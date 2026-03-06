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
            $brand = CarBrand::where('display_name', $brandOption)->first();
            if (!$brand) {
                $this->error("Brand '{$brandOption}' not found!");
                return self::FAILURE;
            }
            FetchEncarCars::dispatch(0, 20, $brand->api_name);
            $this->info("Dispatched fetch job for: {$brand->display_name}");
            return self::SUCCESS;
        }

        $brands = CarBrand::where('is_active', true)->get();
        if ($brands->isEmpty()) {
            $this->warn('No active brands found. Run the CarBrandSeeder first.');
            return self::FAILURE;
        }

        $count = 0;
        foreach ($brands as $brand) {
            FetchEncarCars::dispatch(0, 20, $brand->api_name)
                ->delay(now()->addSeconds($count * 5));
            $this->line(" + Queued: {$brand->display_name}");
            $count++;
        }

        $this->info("Dispatched {$count} brand fetch jobs.");
        return self::SUCCESS;
    }
}
