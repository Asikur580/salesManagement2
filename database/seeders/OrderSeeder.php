<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\EmployeeDetail;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Throwable;

class OrderSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Get all products, customers, and office employees
        $products = Product::all();
        $customers = Customer::all();
        
        // Get officers
        $officers = EmployeeDetail::whereHas('role', function($query) {
            $query->where('name', 'officer');
        })->get();

        if ($products->isEmpty() || $customers->isEmpty() || $officers->isEmpty()) {
            $this->command->error('Missing products, customers, or officers. Please run their seeders first.');
            return;
        }

        $statuses = ['pending', 'approved', 'delivered', 'cancelled'];
        $paymentMethods = ['cash', 'credit'];
        $discountTypes = ['percentage', 'fixed'];

        // Get some admin user IDs for fallback approval
        $admins = User::role(['admin', 'super-admin'])->pluck('id')->toArray();

        for ($i = 0; $i < 50; $i++) {
            DB::beginTransaction();
            try {
                $officer = $officers->random();
                $customer = $customers->random();
                $status = $statuses[array_rand($statuses)];
                
                // Determine creator and approver
                $createdBy = $officer->user_id;
                $approvedBy = null;
                
                if (in_array($status, ['approved', 'delivered'])) {
                    // Try to get supervisor (parent)
                    $supervisor = $officer->parent;
                    if ($supervisor && $supervisor->user_id) {
                        $approvedBy = $supervisor->user_id;
                    } elseif (!empty($admins)) {
                        $approvedBy = $admins[array_rand($admins)];
                    }
                }

                // Create Order
                $orderDate = now()->subDays(rand(0, 30));
                $orderNumber = 'ORD-' . str_pad(Order::count() + 1, 6, '0', STR_PAD_LEFT);

                $order = Order::create([
                    'order_number' => $orderNumber,
                    'customer_id' => $customer->id,
                    'employee_id' => $officer->id,
                    'order_date' => $orderDate,
                    'payment_method' => $paymentMethods[array_rand($paymentMethods)],
                    'status' => $status,
                    'note' => 'Seeded test order #' . ($i + 1),
                    'created_by' => $createdBy,
                    'approved_by' => $approvedBy,
                ]);

                // Create 1-5 Order Items
                $itemCount = rand(1, 5);
                $subtotal = 0;
                $selectedProducts = $products->random($itemCount);

                foreach ($selectedProducts as $product) {
                    $quantity = rand(1, 10);
                    $priceType = rand(0, 1) ? 'tp' : 'flat';
                    $unitPrice = ($priceType === 'tp') ? ($product->purchase_price * 1.2) : $product->sale_price;
                    $totalPrice = $quantity * $unitPrice;
                    
                    OrderItem::create([
                        'order_id' => $order->id,
                        'product_id' => $product->id,
                        'price_type' => $priceType,
                        'unit_price' => $unitPrice,
                        'quantity' => $quantity,
                        'bonus_quantity' => (rand(1, 10) > 8) ? 1 : 0,
                        'total_price' => $totalPrice,
                    ]);

                    $subtotal += $totalPrice;
                }

                // Calculate Margins/Totals
                $discountType = $discountTypes[array_rand($discountTypes)];
                $discountValue = (rand(1, 10) > 7) ? rand(5, 15) : 0;
                $discountAmount = 0;

                if ($discountType === 'percentage') {
                    $discountAmount = ($subtotal * $discountValue) / 100;
                } else {
                    $discountAmount = $discountValue;
                }

                $order->update([
                    'subtotal' => $subtotal,
                    'discount' => $discountValue,
                    'discount_type' => $discountType,
                    'discount_amount' => $discountAmount,
                    'total_amount' => $subtotal - $discountAmount,
                ]);

                DB::commit();
            } catch (Throwable $th) {
                DB::rollBack();
                $this->command->error('Error seeding order ' . ($i + 1) . ': ' . $th->getMessage());
            }
        }

        $this->command->info('50 orders (officer-only) successfully seeded.');
    }
}
