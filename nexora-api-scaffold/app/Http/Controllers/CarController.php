<?php

namespace App\Http\Controllers;

use App\Models\Car;
use App\Models\CarBrand;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class CarController extends Controller
{
    /**
     * GET /api/cars
     * Supports: ?brand=Hyundai&fuel=electric&year_min=2018&year_max=2023
     *           &price_min=5000&price_max=30000&transmission=automatic
     *           &sort=price_asc|price_desc|year_desc|mileage_asc
     *           &per_page=12&page=1&search=Sonata
     */
    public function index(Request $request): JsonResponse
    {
        $cacheKey = 'cars_' . md5($request->fullUrl());

        $data = Cache::remember($cacheKey, 300, function () use ($request) {
            $query = Car::with('brand')
                ->where('is_active', true);

            // Brand filter
            if ($request->filled('brand')) {
                $query->whereHas('brand', fn($q) => $q->where('display_name', $request->brand));
            }

            // Fuel type filter
            if ($request->filled('fuel')) {
                $query->where('fuel_type', $request->fuel);
            }

            // Transmission filter
            if ($request->filled('transmission')) {
                $query->where('transmission', $request->transmission);
            }

            // Year range
            if ($request->filled('year_min')) {
                $query->where('year', '>=', (int) $request->year_min);
            }
            if ($request->filled('year_max')) {
                $query->where('year', '<=', (int) $request->year_max);
            }

            // Price range (EUR)
            if ($request->filled('price_min')) {
                $query->where('price_eur', '>=', (float) $request->price_min);
            }
            if ($request->filled('price_max')) {
                $query->where('price_eur', '<=', (float) $request->price_max);
            }

            // Mileage max
            if ($request->filled('mileage_max')) {
                $query->where('mileage', '<=', (int) $request->mileage_max);
            }

            // Accident free filter
            if ($request->boolean('no_accident')) {
                $query->where('has_accident', false);
            }

            // Full-text search
            if ($request->filled('search')) {
                $term = '%' . $request->search . '%';
                $query->where(function ($q) use ($term) {
                    $q->where('model', 'like', $term)
                        ->orWhereHas('brand', fn($bq) => $bq->where('display_name', 'like', $term));
                });
            }

            // Sorting
            match ($request->get('sort', 'newest')) {
                'price_asc'   => $query->orderBy('price_eur', 'asc'),
                'price_desc'  => $query->orderBy('price_eur', 'desc'),
                'year_desc'   => $query->orderBy('year', 'desc'),
                'mileage_asc' => $query->orderBy('mileage', 'asc'),
                default       => $query->orderBy('updated_at', 'desc'),
            };

            $perPage = min((int) $request->get('per_page', 12), 100);
            $paginated = $query->paginate($perPage);

            return [
                'data'       => $paginated->getCollection()->map(fn($car) => $this->formatCar($car)),
                'pagination' => [
                    'total'        => $paginated->total(),
                    'per_page'     => $paginated->perPage(),
                    'current_page' => $paginated->currentPage(),
                    'last_page'    => $paginated->lastPage(),
                    'from'         => $paginated->firstItem(),
                    'to'           => $paginated->lastItem(),
                ],
                'filters' => $this->getFilterOptions(),
            ];
        });

        return response()->json($data);
    }

    /**
     * GET /api/cars/:id
     */
    public function show(int $id): JsonResponse
    {
        $cacheKey = "car_{$id}";

        $data = Cache::remember($cacheKey, 600, function () use ($id) {
            $car = Car::with('brand')->where('is_active', true)->findOrFail($id);
            return $this->formatCar($car, true);
        });

        return response()->json(['data' => $data]);
    }

    /**
     * GET /api/brands
     */
    public function brands(): JsonResponse
    {
        $brands = Cache::remember('active_brands', 3600, function () {
            return CarBrand::where('is_active', true)
                ->withCount(['cars' => fn($q) => $q->where('is_active', true)])
                ->orderBy('display_name')
                ->get()
                ->map(fn($b) => [
                    'id'         => $b->id,
                    'name'       => $b->display_name,
                    'logo_url'   => $b->logo_url,
                    'cars_count' => $b->cars_count,
                ]);
        });

        return response()->json(['data' => $brands]);
    }

    private function formatCar(Car $car, bool $full = false): array
    {
        $base = [
            'id'           => $car->id,
            'brand'        => $car->brand->display_name ?? null,
            'brand_id'     => $car->brand_id,
            'model'        => $car->model,
            'year'         => $car->year,
            'engine_size'  => $car->engine_size,
            'engine_label' => $car->formatted_engine_size,
            'mileage'      => $car->mileage,
            'mileage_label'=> $car->formatted_mileage,
            'fuel_type'    => $car->fuel_type,
            'transmission' => $car->transmission,
            'price_krw'    => $car->price,
            'price_eur'    => $car->price_eur,
            'image_url'    => $car->image_url,
            'has_accident' => $car->has_accident,
            'has_simple_repair' => $car->has_simple_repair,
            'is_featured'  => $car->is_featured,
            'source_url'   => $car->source_url,
            'created_at'   => $car->created_at?->toIso8601String(),
        ];

        if ($full) {
            $base['thumbnail_urls']      = $car->thumbnail_urls;
            $base['external_inspection'] = $car->external_inspection;
            $base['internal_inspection'] = $car->internal_inspection;
            $base['diagnostic_data']     = $car->diagnostic_data;
            $base['inners']              = $car->inners;
        }

        return $base;
    }

    private function getFilterOptions(): array
    {
        return Cache::remember('filter_options', 3600, function () {
            return [
                'brands'       => CarBrand::where('is_active', true)->pluck('display_name'),
                'fuel_types'   => Car::where('is_active', true)->distinct()->pluck('fuel_type')->filter()->values(),
                'transmissions'=> Car::where('is_active', true)->distinct()->pluck('transmission')->filter()->values(),
                'year_range'   => [
                    'min' => Car::where('is_active', true)->min('year'),
                    'max' => Car::where('is_active', true)->max('year'),
                ],
                'price_range'  => [
                    'min' => Car::where('is_active', true)->min('price_eur'),
                    'max' => Car::where('is_active', true)->max('price_eur'),
                ],
            ];
        });
    }
}
