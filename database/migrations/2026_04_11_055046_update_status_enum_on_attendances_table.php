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
        // For broad compatibility (especially SQLite), changing enum directly can be tricky.
        // Easiest is to convert to string or recreate.
        // We'll trust modern Laravel 11's ability to change to string.
        Schema::table('attendances', function (Blueprint $table) {
            $table->string('status', 50)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            $table->enum('status', ['present', 'absent', 'half-day', 'on-leave'])->change();
        });
    }
};
