<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // Products Table
        Schema::create('products', function (Blueprint $table) {
            $table->id('ProductID');
            $table->string('ProductName', 255);
            $table->string('Category', 100);
            $table->integer('StockQuantity');
            $table->decimal('UnitPrice', 10, 2);
            $table->decimal('UnitCost', 10, 2);
            $table->boolean('IsActive')->default(true);
            $table->timestamps();
        });

        // Traders Table
        Schema::create('traders', function (Blueprint $table) {
            $table->id('TraderID');
            $table->string('TraderName', 255);
            $table->string('Phone', 20);
            $table->text('Address');
            $table->boolean('IsActive')->default(true);
            $table->timestamps();
        });

        // Sales Table
        Schema::create('sales', function (Blueprint $table) {
            $table->id('SaleID');
            $table->foreignId('TraderID')->references('TraderID')->on('traders');
            $table->date('SaleDate');
            $table->decimal('TotalAmount', 12, 2);
            $table->decimal('PaidAmount', 12, 2)->default(0);
            $table->timestamps();
        });

        // SaleDetails Table
        Schema::create('sale_details', function (Blueprint $table) {
            $table->id('SaleDetailID');
            $table->foreignId('SaleID')->references('SaleID')->on('sales');
            $table->foreignId('ProductID')->references('ProductID')->on('products');
            $table->integer('Quantity');
            $table->decimal('UnitPrice', 10, 2);
            $table->decimal('SubTotal', 12, 2);
            $table->timestamps();
        });

        // Purchases Table
        Schema::create('purchases', function (Blueprint $table) {
            $table->id('PurchaseID');
            $table->string('SupplierName', 255);
            $table->date('PurchaseDate');
            $table->decimal('TotalAmount', 12, 2);
            $table->timestamps();
        });

        // PurchaseDetails Table
        Schema::create('purchase_details', function (Blueprint $table) {
            $table->id('PurchaseDetailID');
            $table->foreignId('PurchaseID')->references('PurchaseID')->on('purchases');
            $table->foreignId('ProductID')->references('ProductID')->on('products');
            $table->integer('Quantity');
            $table->decimal('UnitCost', 10, 2);
            $table->decimal('SubTotal', 12, 2);
            $table->timestamps();
        });

        // Expenses Table
        Schema::create('expenses', function (Blueprint $table) {
            $table->id('ExpenseID');
            $table->date('ExpenseDate');
            $table->string('Description', 500);
            $table->decimal('Amount', 10, 2);
            $table->timestamps();
        });

        // Payments Table
        Schema::create('payments', function (Blueprint $table) {
            $table->id('PaymentID');
            $table->foreignId('TraderID')->references('TraderID')->on('traders');
            $table->foreignId('SaleID')->nullable()->references('SaleID')->on('sales');
            $table->date('PaymentDate');
            $table->decimal('Amount', 12, 2);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('payments');
        Schema::dropIfExists('expenses');
        Schema::dropIfExists('purchase_details');
        Schema::dropIfExists('purchases');
        Schema::dropIfExists('sale_details');
        Schema::dropIfExists('sales');
        Schema::dropIfExists('traders');
        Schema::dropIfExists('products');
    }
};