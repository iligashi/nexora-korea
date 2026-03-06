<?php

namespace App\Actions;

use Illuminate\Support\Facades\Log;

class FetchEncarVehicleDetailsAction
{
    public function execute(string $vehicleId): array
    {
        try {
            $vehicleData = $this->fetchVehicleNumber($vehicleId);
            if (isset($vehicleData['error'])) {
                return $vehicleData;
            }

            $vehicleNo = $vehicleData['vehicleNo'] ?? null;
            if (!$vehicleNo) {
                return ['success' => false, 'error' => 'Vehicle number not found'];
            }

            $details = $this->fetchDetailsFromEncarApi($vehicleId, $vehicleNo);
            if (isset($details['error'])) {
                return $details;
            }

            return [
                'success'  => true,
                'raw_data' => $details,
                'vehicle'  => [
                    'displacement' => $details['attribute']['displacement'] ?? null,
                    'vin'          => $details['attribute']['vin'] ?? null,
                    'fuel_type'    => $details['attribute']['fuelType'] ?? null,
                    'transmission' => $details['attribute']['transmission'] ?? null,
                    'model_detail' => $details['attribute']['modelDetail'] ?? null,
                    'is_imported'  => $details['isImported'] ?? false,
                ],
            ];
        } catch (\Exception $e) {
            Log::error('FetchEncarVehicleDetailsAction exception', [
                'vehicle_id' => $vehicleId,
                'error'      => $e->getMessage(),
            ]);
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    private function fetchVehicleNumber(string $vehicleId): array
    {
        $url  = "https://api.encar.com/v1/readside/vehicle/{$vehicleId}?include=CONTENTS";
        $curl = curl_init($url);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($curl, CURLOPT_HEADER, false);
        curl_setopt($curl, CURLOPT_HTTPHEADER, [
            'accept: application/json, text/plain, */*',
            'origin: https://fem.encar.com',
            'referer: https://fem.encar.com/',
            'user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        ]);

        $response = curl_exec($curl);
        $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);

        if (curl_errno($curl)) {
            $error = curl_error($curl);
            curl_close($curl);
            return ['error' => 'Curl error: ' . $error];
        }
        curl_close($curl);

        if ($httpCode !== 200) {
            return ['error' => "HTTP Error: {$httpCode}"];
        }

        $data = json_decode($response, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            return ['error' => 'Invalid JSON: ' . json_last_error_msg()];
        }

        return $data;
    }

    private function fetchDetailsFromEncarApi(string $vehicleId, string $vehicleNo): array
    {
        $url  = "https://api.encar.com/v1/readside/record/vehicle/{$vehicleId}/open?vehicleNo=" . urlencode($vehicleNo);
        $curl = curl_init($url);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($curl, CURLOPT_HEADER, false);
        curl_setopt($curl, CURLOPT_HTTPHEADER, [
            'accept: application/json, text/plain, */*',
            'origin: https://fem.encar.com',
            'referer: https://fem.encar.com/',
            'user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        ]);

        $response = curl_exec($curl);
        $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);

        if (curl_errno($curl)) {
            $error = curl_error($curl);
            curl_close($curl);
            return ['error' => 'Curl error: ' . $error];
        }
        curl_close($curl);

        if ($httpCode !== 200) {
            return ['error' => "HTTP Error: {$httpCode}"];
        }

        $data = json_decode($response, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            return ['error' => 'Invalid JSON: ' . json_last_error_msg()];
        }

        return $data;
    }
}
