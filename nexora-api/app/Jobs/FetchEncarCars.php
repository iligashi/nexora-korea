<?php

namespace App\Jobs;

use App\Models\Car;
use App\Models\CarBrand;
use App\Actions\FetchEncarVehicleDetailsAction;
use App\Actions\FetchEncarVehicleInnersAction;
use App\Services\ModelMapper;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Cache;

class FetchEncarCars implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $timeout = 600;

    private const FALLBACK_KRW_TO_EUR_RATE = 0.000685;
    private const KOREAN_MAN_WON_MULTIPLIER = 10000;
    private const MAX_PAGES = 3;
    private const MIN_PRICE_EUR = 1600;

    public function __construct(
        private readonly int $page = 0,
        private readonly int $perPage = 100,
        private readonly ?string $manufacturer = null
    ) {}

    public function handle(): void
    {
        try {
            $cars = $this->fetchCarsFromEncar();

            if (!empty($cars) && isset($cars[0])) {
                Log::debug('First car data from Encar:', [
                    'complete_data'  => $cars[0],
                    'price_raw'      => $cars[0]['Price'] ?? 'No price available',
                    'price_in_krw'   => $this->convertManWonToKrw($cars[0]['Price'] ?? 0),
                    'price_in_eur'   => $this->convertKrwToEur($this->convertManWonToKrw($cars[0]['Price'] ?? 0)),
                ]);
            }

            foreach ($cars as $carData) {
                $this->processCar($carData);
            }

            if (!empty($cars) && $this->page < self::MAX_PAGES - 1) {
                self::dispatch($this->page + 1, $this->perPage, $this->manufacturer)
                    ->delay(now()->addSeconds(5));
            }
        } catch (\Exception $e) {
            Log::error('Error processing Encar cars', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    private function getExchangeRate(): float
    {
        return Cache::remember('krw_to_eur_rate', 86400, function () {
            try {
                $response = Http::get('https://open.er-api.com/v6/latest/KRW');
                if ($response->successful() && isset($response->json()['rates']['EUR'])) {
                    return $response->json()['rates']['EUR'];
                }
                throw new \Exception('Failed to get exchange rate from API');
            } catch (\Exception $e) {
                Log::warning('Using fallback exchange rate', ['error' => $e->getMessage()]);
                return self::FALLBACK_KRW_TO_EUR_RATE;
            }
        });
    }

    private function convertManWonToKrw(float $priceInManWon): float
    {
        return $priceInManWon * self::KOREAN_MAN_WON_MULTIPLIER;
    }

    private function convertKrwToEur(float $priceInKrw): float
    {
        return round($priceInKrw * $this->getExchangeRate(), 2);
    }

    private function fetchCarsFromEncar(): array
    {
        $type = $this->manufacturer === '르노코리아(삼성_)' ? 'Y' : 'N';

        $query = '(And.Hidden.N._.(C.CarType.' . $type . '.';
        if ($this->manufacturer) {
            $query .= '_.Manufacturer.' . $this->manufacturer . '.';
        }
        $query .= '))';

        $start = $this->page * $this->perPage;
        $sort  = '|MobileModifiedDate|' . $start . '|' . $this->perPage;
        $url   = 'https://api.encar.com/search/car/list/mobile?count=true&q=' . urlencode($query)
            . '&sr=' . urlencode($sort) . '&inav=' . urlencode('|Metadata|Sort');

        $curl = curl_init($url);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($curl, CURLOPT_HEADER, false);
        curl_setopt($curl, CURLOPT_HTTPHEADER, [
            'accept: application/json, text/plain, */*',
            'accept-language: en-US,en;q=0.9',
            'dnt: 1',
            'origin: https://car.encar.com',
            'referer: https://car.encar.com/',
            'user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36',
        ]);

        $response = curl_exec($curl);
        $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
        curl_close($curl);

        if ($httpCode !== 200) {
            Log::error('Encar API request failed', ['status' => $httpCode]);
            return [];
        }

        return json_decode($response, true)['SearchResults'] ?? [];
    }

    private function processCar(array $carData): void
    {
        if (empty($carData['SellType']) || $carData['SellType'] !== '일반') {
            return;
        }

        $year = null;
        if (!empty($carData['Year'])) {
            $year = intval($carData['Year'] / 100);
        } elseif (!empty($carData['FormYear'])) {
            $year = intval($carData['FormYear']);
        }

        if (!$year || $year < 2015) {
            return;
        }

        if ($carData['Manufacturer'] === '르노코리아(삼성)') {
            $carData['Manufacturer'] = '르노코리아(삼성_)';
        }

        $brand = CarBrand::where('api_name', $carData['Manufacturer'])->first();
        if (!$brand) {
            return;
        }

        $diagnosticData = $this->fetchDiagnosticData($carData['Id']);
        $innersData     = app(FetchEncarVehicleInnersAction::class)->execute($carData['Id']);

        // Process images
        $mainImage   = null;
        $thumbnails  = [];
        $imageParams = '?impolicy=heightRate&rh=696&cw=1160&ch=696&cg=Center';

        if (!empty($carData['Photos'])) {
            $mainImageData = collect($carData['Photos'])->firstWhere('type', '001');
            if ($mainImageData) {
                $mainImage = $this->downloadAndStoreImage(
                    'https://ci.encar.com' . $mainImageData['location'] . $imageParams,
                    'cars'
                );
            }

            $basePattern = null;
            if (!empty($carData['Photos'][0]['location'])) {
                $baseLocation   = $carData['Photos'][0]['location'];
                $lastUnderscore = strrpos($baseLocation, '_');
                if ($lastUnderscore !== false) {
                    $basePattern = substr($baseLocation, 0, $lastUnderscore + 1);
                }
            }

            if ($basePattern) {
                $i = 1;
                $consecutiveErrors = 0;
                while ($consecutiveErrors < 1 && $i <= 10) {
                    $suffix    = str_pad($i, 3, '0', STR_PAD_LEFT);
                    $thumbnail = $this->downloadAndStoreImage(
                        'https://ci.encar.com' . $basePattern . $suffix . '.jpg' . $imageParams,
                        'cars/thumbnails'
                    );
                    if ($thumbnail) {
                        $thumbnails[]      = $thumbnail;
                        $consecutiveErrors = 0;
                    } else {
                        $consecutiveErrors++;
                    }
                    $i++;
                }
            }
        }

        // Accident / repair detection
        $hasAccident     = false;
        $hasSimpleRepair = false;
        if (!empty($carData['Condition'])) {
            $hasSimpleRepair = in_array('Record', $carData['Condition']);
            if (!empty($carData['AdWords'])) {
                $adWords     = $carData['AdWords'];
                $hasAccident = str_contains($adWords, '사고') || str_contains($adWords, 'accident');
                if (str_contains($adWords, '무사고') || str_contains($adWords, 'no accident')) {
                    $hasAccident = false;
                }
            }
        }

        // Model name translation
        $brandName = $brand->display_name ?? null;
        $model     = ModelMapper::getEnglishModelName($carData['Model'] ?? '', $brandName);

        // Engine size
        $engineSize = '0';
        if (!empty($carData['Id'])) {
            try {
                $vehicleDetails = app(FetchEncarVehicleDetailsAction::class)->execute($carData['Id']);
                if (isset($vehicleDetails['success']) && $vehicleDetails['success']) {
                    $engineSize = $vehicleDetails['raw_data']['displacement']
                        ?? $vehicleDetails['raw_data']['raw_data']['displacement']
                        ?? $vehicleDetails['vehicle']['displacement']
                        ?? '0';
                }
            } catch (\Exception $e) {
                Log::warning('Failed to get engine size', ['car_id' => $carData['Id'], 'error' => $e->getMessage()]);
            }
        }

        // Price
        $priceManWon = $carData['Price'] ?? null;
        $priceKrw    = null;
        $priceEur    = null;

        if ($priceManWon) {
            $priceKrw = $this->convertManWonToKrw((float) $priceManWon);
            $priceEur = $this->convertKrwToEur($priceKrw);
            if ($priceEur < self::MIN_PRICE_EUR) {
                return;
            }
        }

        $sourceUrl = !empty($carData['Id'])
            ? 'https://www.encar.com/dc/dc_cardetailview.do?carid=' . $carData['Id']
            : null;

        Car::updateOrCreate(
            ['source_url' => $sourceUrl, 'brand_id' => $brand->id],
            [
                'model'               => $model,
                'year'                => $year,
                'engine_size'         => $engineSize,
                'mileage'             => $carData['Mileage'] ?? null,
                'fuel_type'           => $this->mapFuelType($carData['FuelType'] ?? ''),
                'transmission'        => $this->mapTransmission($carData['Transmission'] ?? ''),
                'price'               => $priceKrw,
                'currency'            => 'KRW',
                'price_eur'           => $priceEur,
                'image'               => $mainImage,
                'thumbnails'          => $thumbnails,
                'has_accident'        => $hasAccident,
                'has_simple_repair'   => $hasSimpleRepair,
                'is_registered'       => true,
                'external_inspection' => $this->mapExternalInspection($carData),
                'internal_inspection' => $this->mapInternalInspection($carData),
                'diagnostic_data'     => $diagnosticData,
                'inners'              => $innersData,
            ]
        );
    }

    private function downloadAndStoreImage(?string $url, string $path): ?string
    {
        if (!$url) {
            return null;
        }

        try {
            $filename = $path . '/' . md5($url) . '.jpg';

            if (Storage::disk('s3')->exists($filename)) {
                return $filename;
            }

            $response = Http::timeout(30)->get($url);
            if (!$response->successful()) {
                return null;
            }

            Storage::disk('s3')->put($filename, $response->body(), [
                'ContentType' => 'image/jpeg',
                'visibility'  => 'public',
            ]);

            return $filename;
        } catch (\Exception $e) {
            Log::error('Error downloading image', ['url' => $url, 'error' => $e->getMessage()]);
            return null;
        }
    }

    private function mapFuelType(string $type): string
    {
        return match (strtolower($type)) {
            '가솔린'  => 'gasoline',
            '디젤'    => 'diesel',
            'lpg'     => 'lpg',
            '전기'    => 'electric',
            '하이브리드' => 'hybrid',
            default   => 'other',
        };
    }

    private function mapTransmission(?string $t): string
    {
        if (empty($t)) {
            return '';
        }
        $n = mb_strtolower(trim(preg_replace('/[\s\-]/u', '', $t)), 'UTF-8');
        return match ($n) {
            '자동', 'auto', 'automatic', '오토', '오토매틱' => 'automatic',
            '수동', 'manual', '맨뉴얼'                      => 'manual',
            '세미오토', '세미오토매틱', '반자동', 'semiauto' => 'semi-automatic',
            'cvt', '무단', '무단변속기'                      => 'cvt',
            default                                          => 'other',
        };
    }

    private function mapExternalInspection(array $carData): array
    {
        $result = [];
        if (!empty($carData['Condition'])) {
            $result['conditions'] = $carData['Condition'];
        }
        return $result;
    }

    private function mapInternalInspection(array $carData): array
    {
        $result = [];
        if (!empty($carData['Options'])) {
            $result['options'] = $carData['Options'];
        }
        return $result;
    }

    private function fetchDiagnosticData(string $carId): ?array
    {
        $url  = "https://api.encar.com/v1/readside/diagnosis/vehicle/{$carId}";
        $curl = curl_init();
        curl_setopt($curl, CURLOPT_URL, $url);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($curl, CURLOPT_HTTPHEADER, [
            'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:136.0) Gecko/20100101 Firefox/136.0',
            'Accept: application/json, text/plain, */*',
            'Origin: https://fem.encar.com',
            'Referer: https://fem.encar.com/',
        ]);

        $result   = curl_exec($curl);
        $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
        curl_close($curl);

        if ($httpCode !== 200) {
            return null;
        }

        $data = json_decode($result, true);
        if (json_last_error() !== JSON_ERROR_NONE || empty($data['items'])) {
            return null;
        }

        return $data['items'];
    }
}
