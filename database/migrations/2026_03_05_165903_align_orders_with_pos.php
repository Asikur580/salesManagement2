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
        Schema::table('orders', function (Blueprint $table) {
            $table->string('type')->default('sales')->after('order_number');
            $table->dateTime('order_date')->useCurrent()->after('type');
            $table->decimal('subtotal', 12, 2)->after('total_amount');
            $table->decimal('discount', 12, 2)->default(0)->after('subtotal');
            $table->string('discount_type')->default('fixed')->after('discount');
            $table->decimal('service_charge', 12, 2)->default(0)->after('tax_amount');
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null')->after('created_by');
            // Rename or add status to match POS 'delivered'
            $table->string('status')->default('pending')->after('order_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            //
        });
    }
};
