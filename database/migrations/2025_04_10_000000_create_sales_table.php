<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        if (!Schema::hasTable('sales')) {
            Schema::create('sales', function (Blueprint $table) {
                $table->id('SaleID');
                $table->string('InvoiceNumber')->unique();
                $table->dateTime('SaleDate');
                $table->unsignedBigInteger('CustomerID');
                $table->decimal('TotalAmount', 12, 2);
                $table->string('Status')->default('pending');
                $table->text('Notes')->nullable();
                $table->timestamps();

                $table->foreign('CustomerID')->references('id')->on('traders');
            });
        }
    }

    public function down()
    {
        Schema::dropIfExists('sales');
    }
};
