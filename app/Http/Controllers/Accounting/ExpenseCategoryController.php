<?php
namespace App\Http\Controllers\Accounting;

use App\Http\Controllers\Controller;
use App\Models\ExpenseCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ExpenseCategoryController extends Controller
{
    public function index()
    {
        $categories = ExpenseCategory::withCount('expenses')->get();
        return Inertia::render('Accounting/Expenses/Categories', ['categories' => $categories]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:expense_categories',
            'description' => 'nullable|string'
        ]);

        ExpenseCategory::create($validated);
        return back()->with('success', 'Category created successfully');
    }

    public function update(Request $request, ExpenseCategory $expenseCategory)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:expense_categories,name,' . $expenseCategory->id,
            'description' => 'nullable|string'
        ]);

        $expenseCategory->update($validated);
        return back()->with('success', 'Category updated successfully');
    }

    public function destroy(ExpenseCategory $expenseCategory)
    {
        if ($expenseCategory->expenses()->count() > 0) {
            return back()->with('error', 'Cannot delete category with associated expenses');
        }
        $expenseCategory->delete();
        return back()->with('success', 'Category deleted');
    }
}
