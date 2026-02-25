<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('brands', function (Blueprint $table) {
            $table->string('slug')->unique()->after('name')->nullable();
            $table->string('image')->after('slug')->nullable();
        });

        // Generate slugs for existing brands
        $brands = \Illuminate\Support\Facades\DB::table('brands')->get();
        foreach ($brands as $brand) {
            \Illuminate\Support\Facades\DB::table('brands')
                ->where('id', $brand->id)
                ->update(['slug' => \Illuminate\Support\Str::slug($brand->name)]);
        }

        // Change slug to non-nullable after populating
        Schema::table('brands', function (Blueprint $table) {
            $table->string('slug')->nullable(false)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('brands', function (Blueprint $table) {
            $table->dropColumn(['slug', 'image']);
        });
    }
};
