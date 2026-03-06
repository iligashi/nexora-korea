<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cars', function (Blueprint $table) {
            $table->id();
            $table->foreignId('brand_id')->constrained('car_brands')->onDelete('cascade');
            $table->string('model');
            $table->unsignedSmallInteger('year');
            $table->string('engine_size')->nullable();      // e.g. "2000" (cc)
            $table->unsignedInteger('mileage')->nullable(); // km
            $table->string('fuel_type')->nullable();        // gasoline|diesel|electric|hybrid|lpg
            $table->string('transmission')->nullable();     // automatic|manual|cvt|semi-automatic
            $table->unsignedBigInteger('price')->nullable(); // KRW
            $table->string('currency', 3)->default('KRW');
            $table->decimal('price_eur', 10, 2)->nullable();
            $table->string('image')->nullable();             // S3 path
            $table->json('thumbnails')->nullable();          // array of S3 paths
            $table->boolean('has_accident')->default(false);
            $table->boolean('has_simple_repair')->default(false);
            $table->boolean('is_registered')->default(true);
            $table->json('external_inspection')->nullable();
            $table->json('internal_inspection')->nullable();
            $table->json('diagnostic_data')->nullable();
            $table->json('inners')->nullable();
            $table->string('source_url')->nullable()->unique();
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['brand_id', 'year']);
            $table->index(['fuel_type', 'transmission']);
            $table->index('price_eur');
            $table->index('mileage');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cars');
    }
};
