<?php

namespace App\Http\Controllers;

use App\Jobs\FetchEncarCars;
use App\Models\CarBrand;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class FetchController extends Controller
{
    /**
     * POST /api/fetch
     * Triggers an Encar import job.
     * Accepts optional: { "brand": "Hyundai" }
     * Protected by a simple secret key header: X-Fetch-Secret
     */
    public function trigger(Request $request): JsonResponse
    {
        $secret = $request->header('X-Fetch-Secret');
        if ($secret !== config('app.fetch_secret')) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $brandName = $request->input('brand');

        if ($brandName) {
            $brand = CarBrand::where('display_name', $brandName)->first();
            if (!$brand) {
                return response()->json(['error' => "Brand '{$brandName}' not found"], 404);
            }

            FetchEncarCars::dispatch(0, 20, $brand->api_name);

            return response()->json([
                'message' => "Fetch job dispatched for {$brand->display_name}",
                'brand'   => $brand->display_name,
            ]);
        }

        // Dispatch for all active brands
        $brands = CarBrand::where('is_active', true)->get();
        $count  = 0;

        foreach ($brands as $brand) {
            FetchEncarCars::dispatch(0, 20, $brand->api_name)
                ->delay(now()->addSeconds($count * 5));
            $count++;
        }

        // Clear cache after triggering import
        Cache::flush();

        return response()->json([
            'message'       => "Fetch jobs dispatched for {$count} brands",
            'brands_queued' => $count,
        ]);
    }

    /**
     * GET /api/fetch/status
     * Returns queue / import stats.
     */
    public function status(): JsonResponse
    {
        $stats = [
            'total_cars'   => \App\Models\Car::where('is_active', true)->count(),
            'total_brands' => CarBrand::where('is_active', true)->count(),
            'last_updated' => \App\Models\Car::max('updated_at'),
        ];

        return response()->json(['data' => $stats]);
    }
}
