<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('sale_details', function (Blueprint $table) {
            $table->decimal('UnitCost', 10, 2)->after('UnitPrice')->default(0);
            $table->decimal('Profit', 12, 2)->after('SubTotal')->default(0);
        });
    }

    public function down()
    {
        Schema::table('sale_details', function (Blueprint $table) {
            $table->dropColumn(['UnitCost', 'Profit']);
        });
    }
};
