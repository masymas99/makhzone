<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('purchases', function (Blueprint $table) {
            $table->foreignId('TraderID')->nullable()->after('TotalAmount');
            $table->foreign('TraderID', 'purchases_trader_foreign')
                ->references('TraderID')->on('traders')
                ->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::table('purchases', function (Blueprint $table) {
            $table->dropForeign('purchases_trader_foreign');
            $table->dropColumn('TraderID');
        });
    }
};
