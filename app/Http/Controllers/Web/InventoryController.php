<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\StockTransaction;
use App\Services\StockService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InventoryController extends Controller
{
    public function __construct(protected StockService $stockService)
    {
    }

    /**
     * Display stock transaction history.
     */
    public function history(Request $request)
    {
        $perPage = (int) $request->input('per_page', 15);
        $query = StockTransaction::with(['product', 'variant', 'user'])
            ->latest();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('product', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            });
        }

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        $paginated = $query->paginate($perPage);

        return Inertia::render('Inventory/History', [
            'transactions' => [
                'data' => $paginated->items(),
                'links' => $paginated->linkCollection()->toArray(),
                'meta' => [
                    'current_page' => $paginated->currentPage(),
                    'from' => $paginated->firstItem(),
                    'last_page' => $paginated->lastPage(),
                    'path' => $paginated->path(),
                    'per_page' => $paginated->perPage(),
                    'to' => $paginated->lastItem(),
                    'total' => $paginated->total(),
                ],
            ],
            'filters' => $request->only(['search', 'type', 'per_page']),
        ]);
    }

    /**
     * Show the manual stock adjustment form.
     */
    public function adjust()
    {
        return Inertia::render('Inventory/Adjust', [
            'products' => Product::with('variants.attributeValues')->get()->map(function ($product) {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'variants' => $product->variants->map(function ($variant) {
                        return [
                            'id' => $variant->id,
                            'name' => $variant->attributeValues->pluck('value')->implode(' - '),
                            'stock' => $variant->stock,
                        ];
                    }),
                    'stock' => $product->stock,
                ];
            }),
        ]);
    }

    /**
     * Process a manual stock adjustment.
     */
    public function updateStock(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'variant_id' => 'nullable|exists:product_variants,id',
            'quantity' => 'required|integer|min:1',
            'type' => 'required|in:in,out,adjustment',
            'reason' => 'required|string|max:255',
        ]);

        $model = $request->variant_id
            ? ProductVariant::findOrFail($request->variant_id)
            : Product::findOrFail($request->product_id);

        $this->stockService->adjustStock(
            $model,
            $request->quantity,
            $request->type,
            $request->reason
        );

        return redirect()->route('inventory.history')->with('success', 'Stock adjusted successfully.');
    }
}
