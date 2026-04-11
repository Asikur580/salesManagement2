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
        Schema::table('orders', function (Blueprint $table) {
            $table->decimal('tax_percentage', 5, 2)->default(0)->after('tax_amount');
            $table->string('service_type')->nullable()->after('type');
            $table->foreignId('technician_id')->nullable()->constrained('users')->onDelete('set null')->after('service_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['technician_id']);
            $table->dropColumn(['tax_percentage', 'service_type', 'technician_id']);
        });
    }
};
