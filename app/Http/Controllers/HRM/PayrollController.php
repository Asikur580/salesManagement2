<?php

namespace App\Http\Controllers\HRM;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Salary;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PayrollController extends Controller
{
    public function index(Request $request)
    {
        $monthYear = $request->input('month_year', Carbon::now()->format('Y-m'));

        $salaries = Salary::with('user.employeeProfile')
            ->where('month_year', $monthYear)
            ->get()
            ->map(function ($salary) {
                return [
                    'id' => $salary->id,
                    'user_name' => $salary->user->name,
                    'user_email' => $salary->user->email,
                    'base_salary' => $salary->base_salary,
                    'bonus' => $salary->bonus,
                    'deduction' => $salary->deduction,
                    'net_salary' => $salary->net_salary,
                    'status' => $salary->status,
                ];
            });

        return Inertia::render('HRM/Payroll/Index', [
            'salaries' => $salaries,
            'selectedMonth' => $monthYear,
        ]);
    }

    public function generate(Request $request)
    {
        $request->validate([
            'month_year' => 'required|date_format:Y-m',
        ]);

        $monthYear = $request->month_year;
        $date = Carbon::createFromFormat('Y-m', $monthYear);
        $daysInMonth = $date->daysInMonth;

        $employees = User::whereHas('employeeProfile', function($query) {
            $query->where('is_active', true);
        })->with('employeeProfile')->get();

        DB::beginTransaction();
        try {
            foreach ($employees as $emp) {
                $baseSalary = $emp->employeeProfile->base_salary ?? 0;
                
                // Calculate absences and half-days in this month
                $absences = Attendance::where('user_id', $emp->id)
                    ->whereYear('date', $date->year)
                    ->whereMonth('date', $date->month)
                    ->where('status', 'absent')
                    ->count();

                $halfDays = Attendance::where('user_id', $emp->id)
                    ->whereYear('date', $date->year)
                    ->whereMonth('date', $date->month)
                    ->where('status', 'half-day')
                    ->count();

                // Basic deduction logic: Absent = 1 day, Half-day = 0.5 day
                $totalDeductionDays = $absences + ($halfDays * 0.5);
                $deduction = $baseSalary > 0 ? ($baseSalary / $daysInMonth) * $totalDeductionDays : 0;
                
                $bonus = 0; // Configurable later
                
                $netSalary = $baseSalary + $bonus - $deduction;
                if ($netSalary < 0) {
                    $netSalary = 0;
                }

                Salary::updateOrCreate(
                    [
                        'user_id' => $emp->id,
                        'month_year' => $monthYear,
                    ],
                    [
                        'base_salary' => $baseSalary,
                        'bonus' => $bonus,
                        'deduction' => $deduction,
                        'net_salary' => $netSalary,
                        'status' => 'pending',
                    ]
                );
            }

            DB::commit();
            return redirect()->back()->with('success', "Payroll generated successfully for {$monthYear}.");
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', "Failed to generate payroll: " . $e->getMessage());
        }
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:pending,paid',
        ]);

        $salary = Salary::findOrFail($id);
        $salary->status = $request->status;
        $salary->save();

        return redirect()->back()->with('success', 'Salary status updated.');
    }
}
