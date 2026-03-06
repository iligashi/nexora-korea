<?php

namespace App\Jobs;

use App\Models\Car;
use App\Models\CarBrand;
use App\Actions\FetchEncarVehicleDetailsAction;
use App\Actions\FetchEncarVehicleInnersAction;
use App\Services\EncarService;
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
use Illuminate\Support\Str;

class FetchEncarCars implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $timeout = 600;
    
    // Fallback exchange rate in case API fails
    private const FALLBACK_KRW_TO_EUR_RATE = 0.000685;
    
    // Korean price unit (만원 = 10,000 KRW)
    private const KOREAN_MAN_WON_MULTIPLIER = 10000;
    
    // Maximum number of pages to fetch
    private const MAX_PAGES = 3;
    
    // Minimum price threshold in EUR
    private const MIN_PRICE_EUR = 1600;
    
    /**
     * @var int $page The current page number
     * @var int $perPage Number of results per page
     * @var string|null $manufacturer Filter by car manufacturer (e.g., 'ud604ub300')
     */
    public function __construct(
        private readonly int $page = 0,
        private readonly int $perPage = 100,
        private readonly ?string $manufacturer = null
    ) {}

    public function handle(): void
    {
        try {
            $cars = $this->fetchCarsFromEncar();

            // Debug: Log the first car's complete data to inspect price format
            if (!empty($cars) && isset($cars[0])) {
                Log::debug('First car data from Encar:', [
                    'complete_data' => $cars[0],
                    'price_raw' => $cars[0]['Price'] ?? 'No price available',
                    'price_type' => isset($cars[0]['Price']) ? gettype($cars[0]['Price']) : 'N/A',
                    'price_in_krw' => $this->convertManWonToKrw($cars[0]['Price'] ?? 0),
                    'price_in_eur' => $this->convertKrwToEur($this->convertManWonToKrw($cars[0]['Price'] ?? 0))
                ]);
            }

            foreach ($cars as $carData) {
                $this->processCar($carData);
            }

            // If there are more pages and we haven't reached the maximum page limit, dispatch another job
            if (!empty($cars) && $this->page < self::MAX_PAGES - 1) {
                Log::info('Dispatching next page job', [
                    'current_page' => $this->page,
                    'next_page' => $this->page + 1,
                    'max_pages' => self::MAX_PAGES
                ]);
                
                self::dispatch(
                    $this->page + 1,
                    $this->perPage,
                    $this->manufacturer
                )->delay(now()->addSeconds(5));
            } else if ($this->page >= self::MAX_PAGES - 1) {
                Log::info('Reached maximum page limit, stopping pagination', [
                    'current_page' => $this->page,
                    'max_pages' => self::MAX_PAGES
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Error processing Encar cars', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            throw $e;
        }
    }

    /**
     * Get exchange rate from KRW to EUR using an external API
     * Uses caching to reduce API calls
     */
    private function getExchangeRate(): float
    {
        // Try to get the exchange rate from cache
        return Cache::remember('krw_to_eur_rate', 86400, function () {
            try {
                // Use Exchange Rate API to get the latest rates
                $response = Http::get('https://open.er-api.com/v6/latest/KRW');
                
                if ($response->successful() && isset($response->json()['rates']['EUR'])) {
                    $rate = $response->json()['rates']['EUR'];
                    Log::info('Retrieved KRW to EUR exchange rate: ' . $rate);
                    return $rate;
                }
                
                throw new \Exception('Failed to get exchange rate from API');
            } catch (\Exception $e) {
                Log::warning('Using fallback exchange rate: ' . self::FALLBACK_KRW_TO_EUR_RATE, [
                    'error' => $e->getMessage()
                ]);
                return self::FALLBACK_KRW_TO_EUR_RATE;
            }
        });
    }

    /**
     * Convert price from 만원 (10,000 KRW) to KRW
     * Encar API returns prices in 만원 (man-won) units which is 10,000 KRW
     */
    private function convertManWonToKrw(float $priceInManWon): float
    {
        return $priceInManWon * self::KOREAN_MAN_WON_MULTIPLIER;
    }

    /**
     * Convert price from KRW to EUR using current exchange rate
     */
    private function convertKrwToEur(float $priceInKrw): float
    {        
        $exchangeRate = $this->getExchangeRate();
        return round($priceInKrw * $exchangeRate, 2);
    }

    /**
     * Fetch cars from Encar API using curl
     */
    private function fetchCarsFromEncar(): array
    {
        $type = "N";

        if ($this->manufacturer === '르노코리아(삼성_)') {
            $type = "Y";
        }

        // Build the API query
        $query = '(And.Hidden.N._.(C.CarType.' . $type . '.';
        
        // Add manufacturer filter if provided
        if ($this->manufacturer) {
            $query .= '_.Manufacturer.' . $this->manufacturer . '.';
        }
        
        $query .= '))';
        
        // Calculate the start position based on page and perPage
        $start = $this->page * $this->perPage;
        
        // Build the sorting parameter
        $sort = '|MobileModifiedDate|' . $start . '|' . $this->perPage;
        
        // The API URL with query parameters
        $url = 'https://api.encar.com/search/car/list/mobile?count=true&q=' . urlencode($query) . '&sr=' . urlencode($sort) . '&inav=' . urlencode('|Metadata|Sort');
        
        // Prepare the curl command with necessary headers
        $curl = \curl_init($url);
        Log::info('Fetching cars from Encar API', ['url' => $url]);
        \curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        \curl_setopt($curl, CURLOPT_HEADER, false);
        \curl_setopt($curl, CURLOPT_HTTPHEADER, [
            'accept: application/json, text/plain, */*',
            'accept-language: en-US,en;q=0.9',
            'dnt: 1',
            'origin: https://car.encar.com',
            'priority: u=1, i',
            'referer: https://car.encar.com/',
            'sec-ch-ua: "Not:A-Brand";v="24", "Chromium";v="134"',
            'sec-ch-ua-mobile: ?0',
            'sec-ch-ua-platform: "macOS"',
            'sec-fetch-dest: empty',
            'sec-fetch-mode: cors',
            'sec-fetch-site: same-site',
            'user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36'
        ]);

        $response = \curl_exec($curl);
        $httpCode = \curl_getinfo($curl, CURLINFO_HTTP_CODE);
        \curl_close($curl);

        if ($httpCode !== 200) {
            Log::error('Encar API request failed', [
                'status' => $httpCode,
                'body' => $response
            ]);
            return [];
        }

        $data = json_decode($response, true);
        
        // Return the search results array or empty array if not found
        return $data['SearchResults'] ?? [];
    }

    private function processCar(array $carData): void
    {
        // Skip non-regular sales (SellType not '일반')
        if (empty($carData['SellType']) || $carData['SellType'] !== '일반') {
            Log::info('Skipped car - not a regular sale', [
                'car_id' => $carData['Id'] ?? 'unknown',
                'sell_type' => $carData['SellType'] ?? 'not set'
            ]);
            return;
        }

        // Parse year - Encar uses YYYYMM format
        $year = null;
        if (!empty($carData['Year'])) {
            $year = intval($carData['Year'] / 100); // Extract year part from YYYYMM
        } elseif (!empty($carData['FormYear'])) {
            $year = intval($carData['FormYear']);
        }

        // Skip cars older than 2015
        if (!$year || $year < 2015) {
            Log::info('Skipped car - too old or invalid year', ['year' => $year]);
            return;
        }
        
        if($carData['Manufacturer'] === '르노코리아(삼성)') {
            $carData['Manufacturer'] = '르노코리아(삼성_)';
        }

        // Get brand by api_name (only find, don't create)
        $brand = CarBrand::where('api_name', $carData['Manufacturer'])->first();
        $diagnosticData = $this->fetchDiagnosticData($carData['Id']);
        
        // Fetch inner inspection data using our new action
        $innersData = app(FetchEncarVehicleInnersAction::class)->execute($carData['Id']);
        Log::info('Fetched inner inspection data', ['car_id' => $carData['Id'], 'inners_data' => $innersData ? 'Available' : 'Not available']);
        
        Log::info('Fetched diagnostic data', ['car_id' => $carData['Id'], 'diagnostic_data' => $diagnosticData]);
        
        // Skip processing if brand not found
        if (!$brand) {
            Log::info('Skipped car - brand not found', ['manufacturer' => $carData['Manufacturer']]);
            return;
        }

        // Get primary image and thumbnails
        $mainImage = null;
        $thumbnails = [];
        
        if (!empty($carData['Photos'])) {
            // Image quality parameters - only size related, no watermark or timestamp
            $imageParams = '?impolicy=heightRate&rh=696&cw=1160&ch=696&cg=Center';
            
            // Main image is typically type 001
            $mainImageData = collect($carData['Photos'])->firstWhere('type', '001');
            if ($mainImageData) {
                $imageUrl = 'https://ci.encar.com' . $mainImageData['location'] . $imageParams;
                $mainImage = $this->downloadAndStoreImage($imageUrl, 'cars');
            }
            
            // Extract base pattern from the first photo
            $basePattern = null;
            if (!empty($carData['Photos'][0]['location'])) {
                $baseLocation = $carData['Photos'][0]['location'];
                $lastUnderscore = strrpos($baseLocation, '_');
                if ($lastUnderscore !== false) {
                    $basePattern = substr($baseLocation, 0, $lastUnderscore + 1);
                }
            } else if (!empty($carData['Photo'])) {
                $basePattern = $carData['Photo'];
            }
            
            if ($basePattern) {
                // Try all possible image numbers until we encounter consecutive failures
                $i = 1;
                $consecutiveErrors = 0;
                $maxConsecutiveErrors = 1;
                $maxAttempts = 10; // Safety limit

                while ($consecutiveErrors < $maxConsecutiveErrors && $i <= $maxAttempts) {
                    $suffix = str_pad($i, 3, '0', STR_PAD_LEFT);
                    $url = 'https://ci.encar.com' . $basePattern . $suffix . '.jpg' . $imageParams;
                    
                    $thumbnail = $this->downloadAndStoreImage($url, 'cars/thumbnails');
                    
                    if ($thumbnail) {
                        $thumbnails[] = $thumbnail;
                        $consecutiveErrors = 0; // Reset counter on success
                    } else {
                        $consecutiveErrors++;
                    }
                    
                    $i++;
                }
                
                Log::info('Completed image download process', [
                    'car_id' => $carData['Id'] ?? 'unknown',
                    'total_images' => count($thumbnails),
                ]);
            } else {
                // Fallback to old method if we can't determine the pattern
                $thumbnailPhotos = collect($carData['Photos'])
                    ->sortBy('ordering')
                    ->values();
                    
                foreach ($thumbnailPhotos as $photo) {
                    $thumbnail = $this->downloadAndStoreImage(
                        'https://ci.encar.com' . $photo['location'], 
                        'cars/thumbnails'
                    );
                    if ($thumbnail) {
                        $thumbnails[] = $thumbnail;
                    }
                }
            }
        }

        // Extract inspection data
        $hasAccident = false;
        $hasSimpleRepair = false;
        $isRegistered = true;
        
        // Check if there's accident or repair history based on Condition array
        if (!empty($carData['Condition'])) {
            // In Encar, if 'Record' is in the conditions, the car has a maintenance record
            $hasSimpleRepair = in_array('Record', $carData['Condition']);
            
            // Check AdWords field which often contains accident information
            if (!empty($carData['AdWords'])) {
                $adWords = strtolower($carData['AdWords']);
                $hasAccident = str_contains($adWords, '\uc0ac\uace0') || str_contains($adWords, 'accident');
                
                // Check for '\ubb34\uc0ac\uace0' (no accident) and override if found
                if (str_contains($adWords, '\ubb34\uc0ac\uace0') || str_contains($adWords, 'no accident')) {
                    $hasAccident = false;
                }
            }
        }
        
        // Parse model
        $model = $carData['Model'] ?? '';
        // if (!empty($carData['Badge'])) {
        //     $model .= ' ' . $carData['Badge'];
        // }
        
        // Translate model name from Korean to English using our ModelMapper service
        $brandName = $brand->display_name ?? null;
        $model = ModelMapper::getEnglishModelName($model, $brandName);
        
        // Get engine size - first try from Encar API details endpoint
        $engineSize = "1.0"; // Default
        Log::info('Engine size fallback', [
            'car_id' => $carData['Id'],
            'engine_size' => $engineSize
        ]);
        
        // Only try to get detailed engine size if we have a vehicle ID
        if (!empty($carData['Id'])) {
            try {
                // Get vehicle details using our action
                $vehicleAction = app(FetchEncarVehicleDetailsAction::class);
                // Now we only need to pass the ID, action will get vehicleNo internally
                $vehicleDetails = $vehicleAction->execute($carData['Id']);

                Log::info('Vehicle details response', [
                    'car_id' => $carData['Id'],
                    'vehicle_details' => $vehicleDetails
                ]);
                
                // If successful and displacement is available, use it
                if (isset($vehicleDetails['success']) && $vehicleDetails['success']) {
                    $engineSize = $vehicleDetails['raw_data']['displacement'] ??  $vehicleDetails['raw_data']['raw_data']['displacement'] ?? $vehicleDetails['vehicle']['displacement'] ?? "0.0";
                }
            } catch (\Exception $e) {
                // If API call fails, fall back to regex extraction
                Log::warning('Failed to get engine size from Encar API, falling back to regex', [
                    'car_id' => $carData['Id'],
                    'error' => $e->getMessage()
                ]);
            }
        }
        
        // Generate source URL from car's ID
        $sourceUrl = null;
        if (!empty($carData['Id'])) {
            $sourceUrl = 'https://www.encar.com/dc/dc_cardetailview.do?carid=' . $carData['Id'];
        }
        
        // Get the price and convert to KRW and EUR
        $priceManWon = $carData['Price'] ?? null;
        $priceKrw = null;
        $priceEur = null;
        
        if ($priceManWon) {
            // Convert from 만원 (man-won) to KRW
            $priceKrw = $this->convertManWonToKrw((float)$priceManWon);
            // Convert from KRW to EUR
            $priceEur = $this->convertKrwToEur($priceKrw);
            
            // Skip cars cheaper than minimum threshold
            if ($priceEur < self::MIN_PRICE_EUR) {
                Log::info('Skipped car - price below minimum threshold', [
                    'car_id' => $carData['Id'] ?? 'unknown',
                    'price_eur' => $priceEur,
                    'min_threshold' => self::MIN_PRICE_EUR
                ]);
                return;
            }
        }

        // Create or update car
        Car::updateOrCreate(
            [
                'source_url' => $sourceUrl,
                'brand_id' => $brand->id,
            ],
            [
                'model' => $model,
                'year' => $year,
                'engine_size' => $engineSizeWithUnit ?? $engineSize,
                'mileage' => $carData['Mileage'] ?? null,
                'fuel_type' => $this->mapFuelType($carData['FuelType'] ?? ''),
                'transmission' => $this->mapTransmission($carData['Transmission'] ?? ''),
                'price' => $priceKrw,
                'currency' => 'KRW',
                'price_eur' => $priceEur,
                'image' => $mainImage,
                'thumbnails' => $thumbnails,
                'has_accident' => $hasAccident,
                'has_simple_repair' => $hasSimpleRepair,
                'is_registered' => $isRegistered,
                'external_inspection' => $this->mapExternalInspection($carData),
                'internal_inspection' => $this->mapInternalInspection($carData),
                'diagnostic_data' => $diagnosticData,
                'inners' => $innersData,
            ]
        );
    }

    private function downloadAndStoreImage(?string $url, string $path): ?string
    {
        if (!$url) {
            return null;
        }
        
        try {
            // Generate a deterministic filename based on the URL
            // This ensures the same URL always gets the same filename
            $urlHash = md5($url);
            $filename = $path . '/' . $urlHash . '.jpg';
            
            // Check if this file already exists in S3
            if (Storage::disk('s3')->exists($filename)) {
                Log::info('Image already exists in S3, skipping download', [
                    'url' => $url,
                    'filename' => $filename
                ]);
                return $filename;
            }
            
            // Download image
            $response = Http::timeout(30)->get($url);
            if (!$response->successful()) {
                throw new \Exception("Failed to download image: HTTP {$response->status()}");
            }

            $contents = $response->body();
            
            // Store file with content type and public visibility
            $result = Storage::disk('s3')->put($filename, $contents, [
                'ContentType' => 'image/jpeg',
                'visibility' => 'public'
            ]);

            if (!$result) {
                throw new \Exception('Failed to store file on S3');
            }

            // Verify upload
            if (!Storage::disk('s3')->exists($filename)) {
                throw new \Exception('File was not found after upload');
            }

            $fileUrl = Storage::disk('s3')->url($filename);
            Log::info('Image stored successfully', [
                'filename' => $filename,
                'url' => $fileUrl,
                'size' => strlen($contents)
            ]);

            return $filename;

        } catch (\Exception $e) {
            Log::error('Error downloading/storing image', [
                'url' => $url,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'path' => $path
            ]);
            return null;
        }
    }

    private function mapFuelType(string $encarFuelType): string
    {
        return match (strtolower($encarFuelType)) {
            '가솔린' => 'gasoline',
            '디젤' => 'diesel',
            'lpg' => 'lpg',
            '전기' => 'electric',
            '하이브리드' => 'hybrid',
            default => 'other',
        };
    }

    private function mapTransmission(?string $encarTransmission): string
    {
        if (empty($encarTransmission)) {
            Log::warning('Unrecognized transmission: EMPTY or NULL');
            return '';
        }
    
        $normalized = mb_strtolower(trim(preg_replace('/[\s\-]/u', '', $encarTransmission)), 'UTF-8');
    
        $transmissionVariants = [
            // Automatic
            '자동'         => 'automatic',
            'auto'         => 'automatic',
            'automatic'    => 'automatic',
            '오토'         => 'automatic',
            '오토매틱'     => 'automatic',
    
            // Manual
            '수동'         => 'manual',
            'manual'       => 'manual',
            '맨뉴얼'       => 'manual',
    
            // Semi-automatic
            '세미오토'     => 'semi-automatic',
            '세미오토매틱' => 'semi-automatic',
            '반자동'       => 'semi-automatic',
            'semiauto'     => 'semi-automatic',
            'semi-automatic' => 'semi-automatic',
    
            // CVT
            'cvt'          => 'cvt',
            '무단'         => 'cvt',
            '무단변속기'   => 'cvt',
        ];
    
        if (!isset($transmissionVariants[$normalized])) {
            Log::warning("Unrecognized transmission: '{$encarTransmission}' (normalized: '{$normalized}')");
            return 'other';
        }
    
        return $transmissionVariants[$normalized];
    }
    

    private function mapExternalInspection(array $carData): array
    {
        // Map any external inspection data from carData
        // This is placeholder implementation - you'd need to extract specific fields
        $result = [];
        
        if (!empty($carData['Condition'])) {
            $result['conditions'] = $carData['Condition'];
        }
        
        return $result;
    }

    private function mapInternalInspection(array $carData): array
    {
        // Map any internal inspection data from carData
        // This is placeholder implementation - you'd need to extract specific fields
        $result = [];
        
        if (!empty($carData['Options'])) {
            $result['options'] = $carData['Options'];
        }
        
        return $result;
    }

    /**
     * Fetch diagnostic data for a car
     *
     * @param string $carId
     * @return array|null
     */
    private function fetchDiagnosticData(string $carId): ?array
    {
        // Log the attempted fetch
        Log::info("Fetching diagnostic data for car ID: $carId");

        // Try using the car ID directly
        $diagnosticUrl = "https://api.encar.com/v1/readside/diagnosis/vehicle/$carId";
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $diagnosticUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'GET');
        curl_setopt($ch, CURLOPT_ENCODING, 'gzip, deflate, br, zstd');
        // Add this to see HTTP response code
        curl_setopt($ch, CURLINFO_HEADER_OUT, true);

        $headers = array();
        $headers[] = 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:136.0) Gecko/20100101 Firefox/136.0';
        $headers[] = 'Accept: application/json, text/plain, */*';
        $headers[] = 'Accept-Language: en-US,en;q=0.5';
        $headers[] = 'Origin: https://fem.encar.com';
        $headers[] = 'Connection: keep-alive';
        $headers[] = 'Referer: https://fem.encar.com/';
        $headers[] = 'Sec-Fetch-Dest: empty';
        $headers[] = 'Sec-Fetch-Mode: cors';
        $headers[] = 'Sec-Fetch-Site: same-site';
        $headers[] = 'TE: trailers';
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

        $result = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $requestInfo = curl_getinfo($ch);
        
        if (curl_errno($ch)) {
            Log::error("Error fetching diagnostic data: " . curl_error($ch), [
                'car_id' => $carId,
                'url' => $diagnosticUrl
            ]);
            curl_close($ch);
            return null;
        }
        curl_close($ch);

        // Log the HTTP response code to see what's happening
        Log::info("Diagnostic API response code: $httpCode for car ID: $carId", [
            'url' => $diagnosticUrl,
            'response_size' => strlen($result)
        ]);

        // If we get a 404, the diagnostic report might not exist for this car
        if ($httpCode == 404) {
            Log::info("No diagnostic data available for car ID: $carId");
            return null;
        }
        
        // For other non-200 responses, log the error
        if ($httpCode != 200) {
            Log::error("Unexpected response code from diagnostic API", [
                'car_id' => $carId,
                'http_code' => $httpCode,
                'url' => $diagnosticUrl,
                'response' => substr($result, 0, 1000) // Log first 1000 chars only
            ]);
            return null;
        }

        // Log the raw response for debugging
        Log::debug("Raw diagnostic API response for car ID: $carId", [
            'response' => substr($result, 0, 1000) // Log first 1000 chars only
        ]);

        $data = json_decode($result, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            Log::error('Error decoding diagnostic data: ' . json_last_error_msg(), [
                'car_id' => $carId,
                'raw_response' => substr($result, 0, 1000) // Log first 1000 chars only
            ]);
            return null;
        }

        // Check if the expected data structure exists
        if (!isset($data['items']) || empty($data['items'])) {
            Log::info("No items found in diagnostic data for car ID: $carId", [
                'data_keys' => array_keys($data) // Log what keys are actually in the response
            ]);
            return null;
        }

        // Return only the items array from the response
        return $data['items'] ?? null;
    }
}