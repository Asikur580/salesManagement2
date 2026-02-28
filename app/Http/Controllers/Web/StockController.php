<?php

namespace App\Http\Controllers\Web;

use Throwable;
use App\Models\Stock;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;

class StockController extends Controller
{
    /**
     * Stock In
     */
    public function stockIn(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'supplier_id' => 'nullable|exists:suppliers,id',
            'quantity' => 'required|integer|min:1',
            'reason' => 'required|string|max:255',
            'date' => 'required|date',
            'remarks' => 'nullable|string',
        ]);

        DB::beginTransaction();

        try {
            $product = Product::findOrFail($request->product_id);

            Stock::create([
                'product_id' => $request->product_id,
                'supplier_id' => $request->supplier_id,
                'type' => 'in',
                'quantity' => $request->quantity,
                'reason' => $request->reason,
                'date' => $request->date,
                'remarks' => $request->remarks,
            ]);

            $product->stock += $request->quantity;
            $product->save();

            DB::commit();

            return redirect()->back()->with('success', 'Stock added successfully.');
        } catch (Throwable $th) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Failed to add stock: ' . $th->getMessage());
        }
    }

    /**
     * Stock Out
     */
    public function stockOut(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
            'reason' => 'required|string|max:255',
            'date' => 'required|date',
            'remarks' => 'nullable|string',
        ]);

        DB::beginTransaction();

        try {
            $product = Product::findOrFail($request->product_id);

            if ($product->stock < $request->quantity) {
                return redirect()->back()->with('error', 'Insufficient stock. Current stock: ' . $product->stock);
            }

            Stock::create([
                'product_id' => $request->product_id,
                'type' => 'out',
                'quantity' => $request->quantity,
                'reason' => $request->reason,
                'date' => $request->date,
                'remarks' => $request->remarks,
            ]);

            $product->stock -= $request->quantity;
            $product->save();

            DB::commit();

            return redirect()->back()->with('success', 'Stock removed successfully.');
        } catch (Throwable $th) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Failed to remove stock: ' . $th->getMessage());
        }
    }

    /**
     * Product Stock History (returns JSON for AJAX)
     */
    public function productHistory($id)
    {
        $history = Stock::with('supplier')
            ->where('product_id', $id)
            ->orderBy('date', 'desc')
            ->get();

        return response()->json([
            'status' => true,
            'data' => $history,
        ]);
    }
}
