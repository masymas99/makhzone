<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('traders', function (Blueprint $table) {
            $table->decimal('TotalSales', 10, 2)->default(0)->after('Balance');
        });
    }

    public function down()
    {
        Schema::table('traders', function (Blueprint $table) {
            $table->dropColumn('TotalSales');
        });
    }
};
