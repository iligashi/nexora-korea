<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    protected function schedule(Schedule $schedule): void
    {
        // Refresh all car listings every 6 hours
        $schedule->command('encar:fetch-cars')->everySixHours();

        // Prune queue failed jobs older than 7 days
        $schedule->command('queue:prune-failed --hours=168')->daily();
    }

    protected function commands(): void
    {
        $this->load(__DIR__ . '/Commands');
        require base_path('routes/console.php');
    }
}
