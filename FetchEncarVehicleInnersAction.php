<?php

namespace App\Actions;

use Illuminate\Support\Facades\Log;

class FetchEncarVehicleInnersAction
{
    /**
     * Execute the action to fetch vehicle inner inspection details from Encar
     *
     * @param string $vehicleId The Encar vehicle ID
     * @return array|null Vehicle inner inspection data or null if not available
     */
    public function execute(string $vehicleId): ?array
    {
        try {
            $url = "https://api.encar.com/v1/readside/inspection/vehicle/{$vehicleId}";
            
            // Log the request
            Log::info('Fetching vehicle inner inspection data', [
                'vehicle_id' => $vehicleId,
                'url' => $url
            ]);
            
            // Initialize curl session
            $curl = \curl_init($url);
            
            // Set curl options
            \curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
            \curl_setopt($curl, CURLOPT_HEADER, false);
            \curl_setopt($curl, CURLOPT_HTTPHEADER, [
                'accept: application/json, text/plain, */*',
                'accept-language: en-US,en;q=0.5',
                'accept-encoding: gzip, deflate, br, zstd',
                'origin: https://fem.encar.com',
                'referer: https://fem.encar.com/',
                'connection: keep-alive',
                'sec-fetch-dest: empty',
                'sec-fetch-mode: cors',
                'sec-fetch-site: same-site',
                'user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:136.0) Gecko/20100101 Firefox/136.0'
            ]);
            
            // Execute curl request
            $response = \curl_exec($curl);
            $httpCode = \curl_getinfo($curl, CURLINFO_HTTP_CODE);
            
            // Check for curl errors
            if (\curl_errno($curl)) {
                $error = \curl_error($curl);
                \curl_close($curl);
                Log::error('Curl error when fetching inner inspection data', [
                    'vehicle_id' => $vehicleId,
                    'error' => $error
                ]);
                return null;
            }
            
            \curl_close($curl);
            
            // Check HTTP status code
            if ($httpCode !== 200) {
                Log::warning('HTTP error when fetching inner inspection data', [
                    'vehicle_id' => $vehicleId,
                    'status_code' => $httpCode,
                    'response' => $response
                ]);
                return null;
            }
            
            // Decode JSON response
            $data = json_decode($response, true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                Log::error('Invalid JSON response when fetching inner inspection data', [
                    'vehicle_id' => $vehicleId,
                    'error' => json_last_error_msg()
                ]);
                return null;
            }
            
            // Only return the inners data as requested
            return $data['inners'] ?? null;
            
        } catch (\Exception $e) {
            Log::error('Exception in FetchEncarVehicleInnersAction', [
                'vehicle_id' => $vehicleId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return null;
        }
    }
}
