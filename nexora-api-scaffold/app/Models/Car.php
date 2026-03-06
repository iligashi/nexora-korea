<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class Car extends Model
{
    protected $fillable = [
        'brand_id',
        'model',
        'year',
        'engine_size',
        'mileage',
        'fuel_type',
        'transmission',
        'price',
        'currency',
        'price_eur',
        'image',
        'thumbnails',
        'has_accident',
        'has_simple_repair',
        'is_registered',
        'external_inspection',
        'internal_inspection',
        'diagnostic_data',
        'inners',
        'source_url',
        'is_featured',
        'is_active',
    ];

    protected $casts = [
        'thumbnails'          => 'array',
        'external_inspection' => 'array',
        'internal_inspection' => 'array',
        'diagnostic_data'     => 'array',
        'inners'              => 'array',
        'has_accident'        => 'boolean',
        'has_simple_repair'   => 'boolean',
        'is_registered'       => 'boolean',
        'is_featured'         => 'boolean',
        'is_active'           => 'boolean',
        'price'               => 'integer',
        'price_eur'           => 'float',
    ];

    public function brand(): BelongsTo
    {
        return $this->belongsTo(CarBrand::class, 'brand_id');
    }

    /**
     * Get the full S3 URL for the main image.
     */
    public function getImageUrlAttribute(): ?string
    {
        if (!$this->image) {
            return null;
        }

        return config('app.url') . Storage::disk()->url($this->image);
    }

    /**
     * Get full URLs for all thumbnails.
     */
    public function getThumbnailUrlsAttribute(): array
    {
        if (!$this->thumbnails) {
            return [];
        }

        return array_map(
            fn($path) => config('app.url') . Storage::disk()->url($path),
            $this->thumbnails
        );
    }

    /**
     * Formatted mileage string (e.g. "45,000 km").
     */
    public function getFormattedMileageAttribute(): string
    {
        return $this->mileage
            ? number_format($this->mileage) . ' km'
            : 'N/A';
    }

    /**
     * Formatted engine size (e.g. "2.0L").
     */
    public function getFormattedEngineSizeAttribute(): string
    {
        if (!$this->engine_size) {
            return 'N/A';
        }

        $cc = (int) $this->engine_size;
        if ($cc >= 100) {
            return number_format($cc / 1000, 1) . 'L';
        }

        return $this->engine_size;
    }
}
