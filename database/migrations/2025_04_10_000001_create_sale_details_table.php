<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        if (!Schema::hasTable('sale_details')) {
            Schema::create('sale_details', function (Blueprint $table) {
                $table->id('DetailID');
                $table->unsignedBigInteger('SaleID');
                $table->unsignedBigInteger('ProductID');
                $table->integer('Quantity');
                $table->decimal('UnitPrice', 10, 2);
                $table->decimal('SubTotal', 12, 2);
                $table->decimal('UnitCost', 10, 2);
                $table->decimal('Profit', 12, 2);
                $table->timestamps();

                $table->foreign('SaleID')->references('SaleID')->on('sales')->onDelete('cascade');
                $table->foreign('ProductID')->references('id')->on('products');
            });
        }
    }

    public function down()
    {
        Schema::dropIfExists('sale_details');
    }
};
