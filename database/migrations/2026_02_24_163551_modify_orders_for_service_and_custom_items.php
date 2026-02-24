<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->enum('type', ['sales', 'service'])->default('sales')->after('order_number');
            $table->foreignId('technician_id')->nullable()->after('employee_id')->constrained('technicians')->nullOnDelete();
            $table->decimal('service_charge', 10, 2)->default(0)->after('discount_amount');
            $table->text('service_notes')->nullable()->after('note');
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->foreignId('product_id')->nullable()->change();
            $table->string('custom_item_name')->nullable()->after('product_id');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['technician_id']);
            $table->dropColumn(['type', 'technician_id', 'service_charge', 'service_notes']);
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->foreignId('product_id')->nullable(false)->change();
            $table->dropColumn('custom_item_name');
        });
    }
};
