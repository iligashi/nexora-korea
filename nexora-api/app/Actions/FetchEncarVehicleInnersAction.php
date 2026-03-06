<?php

namespace App\Actions;

use Illuminate\Support\Facades\Log;

class FetchEncarVehicleInnersAction
{
    public function execute(string $vehicleId): ?array
    {
        try {
            $url  = "https://api.encar.com/v1/readside/inspection/vehicle/{$vehicleId}";
            $curl = curl_init($url);
            curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($curl, CURLOPT_HEADER, false);
            curl_setopt($curl, CURLOPT_HTTPHEADER, [
                'accept: application/json, text/plain, */*',
                'accept-language: en-US,en;q=0.5',
                'origin: https://fem.encar.com',
                'referer: https://fem.encar.com/',
                'user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:136.0) Gecko/20100101 Firefox/136.0',
            ]);

            $response = curl_exec($curl);
            $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);

            if (curl_errno($curl)) {
                Log::error('Curl error fetching inners', ['vehicle_id' => $vehicleId, 'error' => curl_error($curl)]);
                curl_close($curl);
                return null;
            }
            curl_close($curl);

            if ($httpCode !== 200) {
                return null;
            }

            $data = json_decode($response, true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                return null;
            }

            return $data['inners'] ?? null;
        } catch (\Exception $e) {
            Log::error('FetchEncarVehicleInnersAction exception', [
                'vehicle_id' => $vehicleId,
                'error'      => $e->getMessage(),
            ]);
            return null;
        }
    }
}
