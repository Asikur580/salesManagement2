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
        Schema::create('employee_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('role_id')->nullable()->constrained('roles')->nullOnDelete();           
            $table->foreignId('designation_id')->constrained('designations')->onDelete('cascade');
            $table->foreignId('parent_id')->nullable()->constrained('employee_details')->nullOnDelete();
            $table->string('employee_id')->unique();
            $table->decimal('credit_limit', 15, 2)->default(0);
            $table->string('phone')->nullable();
            $table->string('national_id')->nullable();
            $table->string('blood_group')->nullable();
            $table->string('territory')->nullable();
            $table->string('district')->nullable();
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->boolean('login_allowed')->default(true);
            $table->string('image')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employee_details');
    }
};
