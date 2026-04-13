<?php
namespace App\Http\Controllers\Accounting;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use App\Models\ExpenseCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ExpenseController extends Controller
{
    public function index()
    {
        $expenses = Expense::with(['category', 'creator'])->latest()->paginate(15);
        $categories = ExpenseCategory::all();
        return Inertia::render('Accounting/Expenses/Index', [
            'expenses' => $expenses, 
            'categories' => $categories
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'expense_category_id' => 'required|exists:expense_categories,id',
            'amount' => 'required|numeric|min:0',
            'date' => 'required|date',
            'reference_no' => 'nullable|string',
            'note' => 'nullable|string'
        ]);

        $validated['created_by'] = auth()->id();
        Expense::create($validated);
        return back()->with('success', 'Expense recorded successfully');
    }

    public function update(Request $request, Expense $expense)
    {
        $validated = $request->validate([
            'expense_category_id' => 'required|exists:expense_categories,id',
            'amount' => 'required|numeric|min:0',
            'date' => 'required|date',
            'reference_no' => 'nullable|string',
            'note' => 'nullable|string'
        ]);

        $expense->update($validated);
        return back()->with('success', 'Expense updated successfully');
    }

    public function destroy(Expense $expense)
    {
        // Strict Block: Financial records cannot be deleted after 24 hours to preserve audit trail
        if ($expense->created_at->diffInHours(now()) > 24 && !auth()->user()->hasRole('super-admin')) {
            return back()->with('error', 'Financial records older than 24 hours cannot be deleted for auditing purposes. Please contact a super-admin.');
        }

        $expense->delete();
        return back()->with('success', 'Expense deleted successfully');
    }
}
