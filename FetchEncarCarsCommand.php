<?php

namespace App\Console\Commands;

use App\Jobs\FetchEncarCars;
use App\Models\CarBrand;
use Illuminate\Console\Command;

class FetchEncarCarsCommand extends Command
{
    protected $signature = 'encar:fetch-cars {--brand= : Specific brand to fetch (optional)}'; 
    protected $description = 'Fetch cars from Encar.com for all or a specific brand';

    public function handle(): int
    {
        $brandOption = $this->option('brand');
        
        if ($brandOption) {
            // If a specific brand was requested
            $brand = CarBrand::where('display_name', $brandOption)->first();
            
            if (!$brand) {
                $this->error("Brand '$brandOption' not found!");
                return self::FAILURE;
            }
            
            $this->info("Dispatching job to fetch cars for brand: {$brand->display_name}");
            FetchEncarCars::dispatch(0, 20, $brand->api_name);
            $this->info('Job dispatched successfully!');
            
            return self::SUCCESS;
        }
        
        // Get all active brands
        $brands = CarBrand::where('is_active', true)->get();
        
        if ($brands->isEmpty()) {
            $this->warn('No active brands found. Please add some brands first.');
            return self::FAILURE;
        }
        
        $this->info('Dispatching jobs to fetch cars from Encar for all active brands...');
        
        $count = 0;
        foreach ($brands as $brand) {
            $this->line(" - Dispatching for brand: {$brand->display_name}");
            
            // Pass the brand api_name to the job
            // Start with page 0 (Encar API uses 0-based pagination)
            FetchEncarCars::dispatch(0, 20, $brand->api_name)
                ->delay(now()->addSeconds($count * 5)); // Add delay to avoid hitting rate limits
            
            $count++;
        }
        
        $this->info("Successfully dispatched jobs for {$count} brands.");
        
        return self::SUCCESS;
    }
}