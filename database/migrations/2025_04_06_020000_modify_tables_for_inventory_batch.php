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
            $table->string('SupplierName', 255)->nullable();
            $table->date('PurchaseDate');
            $table->decimal('TotalAmount', 12, 2)->default(0);
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
            $table->foreignId('ProductID')->constrained('products', 'ProductID')->onDelete('cascade');
            $table->foreignId('PurchaseID')->nullable()->constrained('purchases', 'PurchaseID')->onDelete('cascade');
            $table->string('BatchNumber')->unique();
            $table->integer('Quantity')->default(0);
            $table->decimal('UnitCost', 10, 2)->default(0);
            $table->timestamp('PurchaseDate')->useCurrent();
            $table->timestamps();
        });

        // Create purchase details table
        Schema::create('purchase_details', function (Blueprint $table) {
            $table->id('PurchaseDetailID');
            $table->foreignId('PurchaseID')->constrained('purchases', 'PurchaseID')->onDelete('cascade');
            $table->foreignId('ProductID')->constrained('products', 'ProductID')->onDelete('cascade');
            $table->integer('Quantity')->default(0);
            $table->decimal('UnitCost', 10, 2)->default(0);
            $table->decimal('SubTotal', 12, 2)->default(0);
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
