<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use App\Models\ExpenseCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ExpenseController extends Controller
{
    public function index(Request $request)
    {
        $query = Expense::with(['category', 'creator']);

        if ($request->expense_category_id) {
            $query->where('expense_category_id', $request->expense_category_id);
        }

        if ($request->start_date && $request->end_date) {
            $query->whereBetween('date', [$request->start_date, $request->end_date]);
        }

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('description', 'like', "%{$request->search}%")
                    ->orWhereHas('category', function ($q2) use ($request) {
                        $q2->where('name', 'like', "%{$request->search}%");
                    });
            });
        }

        $perPage = $request->input('per_page', 10);
        $paginated = $query->orderBy('date', 'desc')->paginate($perPage)->withQueryString();

        $expenses = [
            'data' => collect($paginated->items())->map(function ($item) {
                return [
                    'id' => $item->id,
                    'expense_category_id' => $item->expense_category_id,
                    'amount' => $item->amount,
                    'date' => $item->date,
                    'description' => $item->description,
                    'category' => $item->category ? ['name' => $item->category->name] : null,
                    'creator' => $item->creator ? ['name' => $item->creator->name] : null,
                ];
            }),
            'links' => $paginated->linkCollection()->toArray(),
            'meta' => [
                'current_page' => $paginated->currentPage(),
                'from' => $paginated->firstItem(),
                'last_page' => $paginated->lastPage(),
                'path' => $paginated->path(),
                'per_page' => $paginated->perPage(),
                'to' => $paginated->lastItem(),
                'total' => $paginated->total(),
            ]
        ];

        $categories = ExpenseCategory::select('id', 'name')->where('status', 'active')->get();

        return Inertia::render('Expenses', [
            'initialExpenses' => $expenses,
            'categories' => $categories,
            'filters' => $request->only(['search', 'per_page', 'expense_category_id', 'start_date', 'end_date']),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'expense_category_id' => 'required|exists:expense_categories,id',
            'amount' => 'required|numeric|min:0',
            'date' => 'required|date',
            'description' => 'nullable|string',
        ]);

        $data = $request->all();
        $data['created_by'] = auth()->id();

        Expense::create($data);

        return redirect()->back()->with('success', 'Expense recorded successfully.');
    }

    public function update(Request $request, $id)
    {
        $expense = Expense::findOrFail($id);

        $request->validate([
            'expense_category_id' => 'required|exists:expense_categories,id',
            'amount' => 'required|numeric|min:0',
            'date' => 'required|date',
            'description' => 'nullable|string',
        ]);

        $expense->update($request->all());

        return redirect()->back()->with('success', 'Expense updated successfully.');
    }

    public function destroy($id)
    {
        $expense = Expense::findOrFail($id);
        $expense->delete();

        return redirect()->back()->with('success', 'Expense deleted successfully.');
    }
}
