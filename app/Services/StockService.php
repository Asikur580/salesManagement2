<?php

namespace App\Services;

use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\StockTransaction;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Exception;

class StockService
{
    /**
     * Centralized method to adjust stock and record the transaction.
     *
     * @param Product|ProductVariant $model The product or variant being adjusted.
     * @param int $quantity The amount to change (always positive).
     * @param string $type The direction: 'in', 'out', 'adjustment', 'return'.
     * @param string|null $reason Detailed reason for the adjustment.
     * @param array $reference Metadata for referencing other models (type, id).
     * @return StockTransaction
     * @throws Exception
     */
    public function adjustStock($model, int $quantity, string $type, ?string $reason = null, array $reference = [])
    {
        return DB::transaction(function () use ($model, $quantity, $type, $reason, $reference) {
            $isVariant = $model instanceof ProductVariant;
            
            // Re-fetch the models with a lock to prevent race conditions
            $lockedModel = get_class($model)::lockForUpdate()->find($model->id);
            $lockedProduct = $isVariant ? Product::lockForUpdate()->find($lockedModel->product_id) : $lockedModel;

            // Calculate change direction
            // 'in', 'return' usually increase stock
            // 'out' usually decrease stock
            // 'adjustment' depends on context (but here we assume 'quantity' is the DELTA)
            $isDecrement = in_array($type, ['out']);
            
            if ($isDecrement) {
                if ($lockedModel->stock < $quantity) {
                    throw new Exception("Insufficient stock. Available: {$lockedModel->stock}, Requested: {$quantity}");
                }

                $lockedModel->decrement('stock', $quantity);
                if ($isVariant) {
                    $lockedProduct->decrement('stock', $quantity);
                }
            } else {
                $lockedModel->increment('stock', $quantity);
                if ($isVariant) {
                    $lockedProduct->increment('stock', $quantity);
                }
            }

            // Fresh load to get the latest balance
            $lockedModel->refresh();

            // Record transaction
            return StockTransaction::create([
                'product_id' => $lockedProduct->id,
                'product_variant_id' => $isVariant ? $lockedModel->id : null,
                'user_id' => Auth::id(),
                'type' => $type,
                'quantity' => $quantity,
                'balance_after' => $lockedModel->stock,
                'reference_type' => $reference['type'] ?? null,
                'reference_id' => $reference['id'] ?? null,
                'reason' => $reason,
            ]);
        });
    }

    /**
     * Record stock out for a sale (from Order).
     */
    public function recordSale($order)
    {
        foreach ($order->items as $item) {
            $model = $item->product_variant_id 
                ? ProductVariant::find($item->product_variant_id)
                : Product::find($item->product_id);

            if ($model) {
                $this->adjustStock(
                    $model,
                    $item->quantity,
                    'out',
                    "Sale: Order #{$order->order_number}",
                    ['type' => 'App\Models\Order', 'id' => $order->id]
                );
            }
        }
    }

    /**
     * Record stock in for a cancelled sale (from Order).
     */
    public function returnStock($order)
    {
        // Don't return stock if order type is service because services might not deduct stock the same way,
        // although recordSale checks items. If service parts are deducted, we should return them too.
        foreach ($order->items as $item) {
            $model = $item->product_variant_id 
                ? ProductVariant::find($item->product_variant_id)
                : Product::find($item->product_id);

            if ($model) {
                // Determine direction based on order type? Order cancel -> stock IN.
                $this->adjustStock(
                    $model,
                    $item->quantity,
                    'in',
                    "Restored: Order #{$order->order_number} Cancelled",
                    ['type' => 'App\Models\Order', 'id' => $order->id]
                );
            }
        }
    }

    /**
     * Record stock in from a RestockOrder.
     */
    public function recordRestock($restockOrder)
    {
        return DB::transaction(function () use ($restockOrder) {
            foreach ($restockOrder->items as $item) {
                $model = $item->product_variant_id
                    ? ProductVariant::find($item->product_variant_id)
                    : Product::find($item->product_id);

                if ($model) {
                    $this->adjustStock(
                        $model,
                        $item->quantity,
                        'in',
                        "Restock: Order #{$restockOrder->order_number} (Supplier: {$restockOrder->supplier->name})",
                        ['type' => 'App\Models\RestockOrder', 'id' => $restockOrder->id]
                    );
                }
            }
            return true;
        });
    }

    /**
     * Get products that are below their low stock threshold.
     */
    public function getLowStockItems($limit = 10)
    {
        $query = Product::whereColumn('stock', '<=', 'low_stock_alert')
            ->where('stock', '>', 0);
        
        return $limit ? $query->limit($limit)->get() : $query->get();
    }

    /**
     * Get products that are completely out of stock.
     */
    public function getOutOfStockItems($limit = 10)
    {
        $query = Product::where('stock', '<=', 0);
        
        return $limit ? $query->limit($limit)->get() : $query->get();
    }
}
