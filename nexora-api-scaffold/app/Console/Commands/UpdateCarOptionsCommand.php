<?php

namespace App\Console\Commands;

use App\Models\Car;
use App\Actions\FetchEncarVehicleDetailsAction;
use Illuminate\Console\Command;

class UpdateCarOptionsCommand extends Command
{
    protected $signature = 'cars:update-options {--limit=0 : Max cars to update (0 = all)}';
    protected $description = 'Fetch and update options for existing cars from Encar vehicle details API';

    public function handle(): void
    {
        $query = Car::whereNotNull('source_url');
        $limit = (int) $this->option('limit');
        if ($limit > 0) {
            $query->limit($limit);
        }

        $cars = $query->get();
        $this->info("Updating options for {$cars->count()} cars...");

        $action  = app(FetchEncarVehicleDetailsAction::class);
        $updated = 0;
        $failed  = 0;

        foreach ($cars as $car) {
            // Extract car ID from source URL
            $carId = null;
            if (preg_match('/carid=(\d+)/', $car->source_url, $m)) {
                $carId = $m[1];
            }

            if (!$carId) {
                $this->warn("No car ID found for car #{$car->id}");
                $failed++;
                continue;
            }

            try {
                $details = $action->execute($carId);

                if (isset($details['success']) && $details['success'] && !empty($details['options'])) {
                    $internal = $car->internal_inspection;
                    if (!is_array($internal) || empty($internal)) {
                        $internal = [];
                    }

                    $existingOptions = $internal['options'] ?? [];
                    $newOptions = array_values(array_unique(array_merge($existingOptions, $details['options'])));
                    $internal['options'] = $newOptions;

                    $car->internal_inspection = $internal;
                    $car->save();

                    $updated++;
                    $this->line("  ✓ Car #{$car->id} ({$car->brand}) — {$car->model}: " . count($newOptions) . " options");
                } else {
                    $this->line("  - Car #{$car->id}: no options found");
                }
            } catch (\Exception $e) {
                $failed++;
                $this->warn("  ✗ Car #{$car->id}: " . $e->getMessage());
            }

            // Small delay to avoid rate limiting
            usleep(500000); // 0.5 seconds
        }

        $this->info("Done! Updated: {$updated}, Failed: {$failed}");
    }
}
