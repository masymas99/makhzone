<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // Drop existing tables if they exist
        Schema::dropIfExists('inventory_batches');
        Schema::dropIfExists('purchase_details');
        Schema::dropIfExists('purchases');

        // Create new purchases table without foreign key first
        Schema::create('purchases', function (Blueprint $table) {
            $table->id('PurchaseID');
            $table->foreignId('SupplierID')->nullable();
            $table->string('SupplierName', 255);
            $table->date('PurchaseDate');
            $table->decimal('TotalAmount', 12, 2);
            $table->timestamps();
        });

        // Add foreign key constraint after suppliers table exists
        Schema::table('purchases', function (Blueprint $table) {
            $table->foreign('SupplierID', 'purchases_supplier_foreign')
                ->references('SupplierID')->on('suppliers')
                ->onDelete('cascade');
        });

        // Create inventory batches table without foreign keys first
        Schema::create('inventory_batches', function (Blueprint $table) {
            $table->id('BatchID');
            $table->foreignId('ProductID');
            $table->foreignId('PurchaseID');
            $table->string('BatchNumber')->unique();
            $table->integer('Quantity');
            $table->decimal('UnitCost', 10, 2);
            $table->date('PurchaseDate');
            $table->timestamps();
        });

        // Add foreign key constraints to inventory batches
        Schema::table('inventory_batches', function (Blueprint $table) {
            $table->foreign('ProductID')
                ->references('ProductID')
                ->on('products')
                ->onDelete('cascade');

            $table->foreign('PurchaseID')
                ->references('PurchaseID')
                ->on('purchases')
                ->onDelete('cascade');
        });

        // Create purchase details table
        Schema::create('purchase_details', function (Blueprint $table) {
            $table->id('PurchaseDetailID');
            $table->foreignId('PurchaseID')->references('PurchaseID')->on('purchases');
            $table->foreignId('ProductID')->references('ProductID')->on('products');
            $table->integer('Quantity');
            $table->decimal('UnitCost', 10, 2);
            $table->decimal('SubTotal', 12, 2);
            $table->timestamps();
        });
    }

    public function down()
    {
        // Drop tables in reverse order
        Schema::dropIfExists('purchase_details');
        Schema::dropIfExists('inventory_batches');
        Schema::dropIfExists('purchases');
    }
};
