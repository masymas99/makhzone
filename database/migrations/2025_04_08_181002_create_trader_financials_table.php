<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('trader_financials', function (Blueprint $table) {
            $table->id();
            $table->foreignId('trader_id')->constrained('traders', 'TraderID')->onDelete('cascade');
            $table->foreignId('sale_id')->nullable()->constrained('sales', 'SaleID')->onDelete('cascade');
            $table->foreignId('payment_id')->nullable()->constrained('payments', 'PaymentID')->onDelete('cascade');
            $table->decimal('sale_amount', 12, 2)->default(0);
            $table->decimal('payment_amount', 12, 2)->default(0);
            $table->decimal('balance', 12, 2);
            $table->decimal('total_sales', 12, 2)->default(0);
            $table->decimal('total_payments', 12, 2)->default(0);
            $table->decimal('remaining_amount', 12, 2);
            $table->string('transaction_type'); // 'sale', 'payment'
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('trader_financials');
    }
};
