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
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('designation_id')->after('password')->constrained('designations')->cascadeOnDelete();
            $table->foreignId('parent_id')->nullable()->after('designation_id')->constrained('users')->cascadeOnDelete();
            $table->string('phone')->nullable()->after('email');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['designation_id']);
            $table->dropColumn('designation_id');

            $table->dropForeign(['parent_id']);
            $table->dropColumn('parent_id');

            $table->dropColumn('phone');
        });
    }
};
