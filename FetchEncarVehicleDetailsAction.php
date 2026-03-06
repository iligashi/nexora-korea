<?php

namespace App\Actions;

use Illuminate\Support\Facades\Log;

class FetchEncarVehicleDetailsAction
{
    /**
     * Execute the action to fetch vehicle details from Encar
     *
     * @param string $vehicleId The Encar vehicle ID
     * @return array Vehicle details including displacement
     */
    public function execute(string $vehicleId): array
    {
        try {
            // First, get the vehicle number from the CONTENTS endpoint
            $vehicleData = $this->fetchVehicleNumber($vehicleId);
            
            if (isset($vehicleData['error'])) {
                return $vehicleData; // Return the error message
            }
            
            $vehicleNo = $vehicleData['vehicleNo'] ?? null;
            
            if (!$vehicleNo) {
                Log::warning('Vehicle number not found for vehicle ID', ['vehicle_id' => $vehicleId]);
                return [
                    'success' => false,
                    'error' => 'Vehicle number not found'
                ];
            }
            
            Log::info('Retrieved vehicle number', [
                'vehicle_id' => $vehicleId,
                'vehicle_no' => $vehicleNo
            ]);
            
            // Now, get the vehicle details using the vehicle number
            $details = $this->fetchDetailsFromEncarApi($vehicleId, $vehicleNo);
            
            if (isset($details['error'])) {
                return $details; // Return the error message
            }
            
            // Extract useful vehicle details
            $displacement = $details['attribute']['displacement'] ?? null;
            
            return [
                'success' => true,
                'raw_data' => $details,
                'vehicle' => [
                    'displacement' => $displacement,
                    'vin' => $details['attribute']['vin'] ?? null,
                    'fuel_type' => $details['attribute']['fuelType'] ?? null,
                    'transmission' => $details['attribute']['transmission'] ?? null,
                    'model_detail' => $details['attribute']['modelDetail'] ?? null,
                    'is_imported' => $details['isImported'] ?? false,
                ]
            ];
            
        } catch (\Exception $e) {
            Log::error("Exception in FetchEncarVehicleDetailsAction", [
                'vehicle_id' => $vehicleId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return [
                'success' => false,
                'error' => 'Exception: ' . $e->getMessage()
            ];
        }
    }
    
    /**
     * Fetch the vehicle number from Encar API
     *
     * @param string $vehicleId
     * @return array The data containing vehicleNo or error
     */
    private function fetchVehicleNumber(string $vehicleId): array
    {
        // Construct the API URL for vehicle number
        $url = "https://api.encar.com/v1/readside/vehicle/{$vehicleId}?include=CONTENTS";
        
        // Initialize curl session
        $curl = \curl_init($url);
        
        // Set curl options
        \curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        \curl_setopt($curl, CURLOPT_HEADER, false);
        \curl_setopt($curl, CURLOPT_HTTPHEADER, [
            'accept: application/json, text/plain, */*',
            'accept-language: en-US,en;q=0.9',
            'origin: https://fem.encar.com',
            'priority: u=1, i',
            'referer: https://fem.encar.com/',
            'sec-ch-ua: "Chromium";v="131", "Not_A Brand";v="24"',
            'sec-ch-ua-mobile: ?0',
            'sec-ch-ua-platform: "macOS"',
            'sec-fetch-dest: empty',
            'sec-fetch-mode: cors',
            'sec-fetch-site: same-site',
            'user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
        ]);
        
        // Execute curl request
        $response = \curl_exec($curl);
        $httpCode = \curl_getinfo($curl, CURLINFO_HTTP_CODE);
        
        // Check for curl errors
        if (\curl_errno($curl)) {
            $error = \curl_error($curl);
            \curl_close($curl);
            return ['error' => 'Curl error: ' . $error];
        }
        
        \curl_close($curl);
        
        // Check HTTP status code
        if ($httpCode !== 200) {
            return [
                'error' => "HTTP Error: {$httpCode}",
                'response' => $response
            ];
        }
        
        // Decode JSON response
        $data = json_decode($response, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            return ['error' => 'Invalid JSON response: ' . json_last_error_msg()];
        }
        
        return $data;
    }
    
    /**
     * Make the API request to Encar to fetch vehicle details
     *
     * @param string $vehicleId
     * @param string $vehicleNo
     * @return array The API response
     */
    private function fetchDetailsFromEncarApi(string $vehicleId, string $vehicleNo): array
    {
        // Properly URL encode the vehicle number to handle Korean characters
        $encodedVehicleNo = urlencode($vehicleNo);
        
        // Construct the API URL
        $url = "https://api.encar.com/v1/readside/record/vehicle/{$vehicleId}/open?vehicleNo={$encodedVehicleNo}";
        
        // Log the URL for debugging
        Log::info('Fetching vehicle details', [
            'vehicle_id' => $vehicleId,
            'vehicle_no' => $vehicleNo,
            'url' => $url
        ]);
        
        // Initialize curl session
        $curl = \curl_init($url);
        
        // Set curl options
        \curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        \curl_setopt($curl, CURLOPT_HEADER, false);
        \curl_setopt($curl, CURLOPT_HTTPHEADER, [
            'accept: application/json, text/plain, */*',
            'accept-language: en-US,en;q=0.9',
            'origin: https://fem.encar.com',
            'priority: u=1, i',
            'referer: https://fem.encar.com/',
            'sec-ch-ua: "Chromium";v="131", "Not_A Brand";v="24"',
            'sec-ch-ua-mobile: ?0',
            'sec-ch-ua-platform: "macOS"',
            'sec-fetch-dest: empty',
            'sec-fetch-mode: cors',
            'sec-fetch-site: same-site',
            'user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
        ]);
        
        // Execute curl request
        $response = \curl_exec($curl);
        $httpCode = \curl_getinfo($curl, CURLINFO_HTTP_CODE);
        
        // Check for curl errors
        if (\curl_errno($curl)) {
            $error = \curl_error($curl);
            \curl_close($curl);
            return ['error' => 'Curl error: ' . $error];
        }
        
        \curl_close($curl);
        
        // Check HTTP status code
        if ($httpCode !== 200) {
            return [
                'error' => "HTTP Error: {$httpCode}",
                'response' => $response
            ];
        }
        
        // Decode JSON response
        $data = json_decode($response, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            return ['error' => 'Invalid JSON response: ' . json_last_error_msg()];
        }
        
        return $data;
    }
}
