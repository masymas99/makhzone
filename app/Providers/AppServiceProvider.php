<?php

namespace App\Providers;

use App\Models\Payment;
use App\Models\Sale;
use App\Observers\PaymentObserver;
use App\Observers\TraderFinancialObserver;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);
        Sale::observe(TraderFinancialObserver::class);
        Payment::observe(TraderFinancialObserver::class);
        Payment::observe(PaymentObserver::class);
    }
}
