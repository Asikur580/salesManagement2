<?php

namespace App\Http\Controllers\HRM;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Attendance;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AttendanceController extends Controller
{
    public function index(Request $request)
    {
        $month = $request->input('month', Carbon::now()->month);
        $year = $request->input('year', Carbon::now()->year);
        $roleId = $request->input('role_id');

        $startDate = Carbon::createFromDate($year, $month, 1)->startOfMonth();
        $endDate = $startDate->copy()->endOfMonth();
        $daysInMonth = $startDate->daysInMonth;

        $query = User::whereHas('employeeProfile', function ($query) {
            $query->where('is_active', true);
        });

        if ($roleId) {
            $query->whereHas('roles', function ($q) use ($roleId) {
                $q->where('id', $roleId);
            });
        }

        $users = $query->with(['employeeProfile', 'roles', 'attendances' => function ($query) use ($startDate, $endDate) {
            $query->whereBetween('date', [$startDate->toDateString(), $endDate->toDateString()]);
        }])
        ->orderBy('name')
        ->get();

        $employeesData = $users->map(function ($user) use ($daysInMonth, $startDate) {
            $attendanceGrid = [];
            $totalPresent = 0;

            // Initialize grid
            for ($i = 1; $i <= $daysInMonth; $i++) {
                $attendanceGrid[$i] = null;
            }

            foreach ($user->attendances as $att) {
                $day = Carbon::parse($att->date)->day;
                $attendanceGrid[$day] = [
                    'status' => $att->status,
                    'check_in' => $att->check_in,
                    'check_out' => $att->check_out,
                ];
                
                if (in_array($att->status, ['present', 'late', 'half-day'])) {
                    $totalPresent += ($att->status === 'half-day' ? 0.5 : 1);
                }
            }

            return [
                'id' => $user->id,
                'name' => $user->name,
                'designation' => $user->roles->first()->name ?? 'N/A',
                'attendance_grid' => $attendanceGrid,
                'total_present' => $totalPresent,
            ];
        });

        $roles = \Spatie\Permission\Models\Role::select('id', 'name')->get();

        return Inertia::render('HRM/Attendance/Index', [
            'employees' => $employeesData,
            'selectedMonth' => (int)$month,
            'selectedYear' => (int)$year,
            'daysInMonth' => $daysInMonth,
            'roles' => $roles,
            'filters' => $request->only(['month', 'year', 'role_id']),
            'monthName' => $startDate->format('F'),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'date' => 'required|date',
            'attendances' => 'required|array',
            'attendances.*.user_id' => 'required|exists:users,id',
            'attendances.*.status' => 'required|string', // Expanded statuses handled in frontend/DB
            'attendances.*.check_in' => 'nullable|string',
            'attendances.*.check_out' => 'nullable|string',
        ]);

        $date = $request->date;
        if ($date > now()->toDateString()) {
            return redirect()->back()->with('error', 'Cannot mark attendance for future dates.');
        }

        DB::beginTransaction();
        try {
            foreach ($request->attendances as $record) {
                Attendance::updateOrCreate(
                    [
                        'user_id' => $record['user_id'],
                        'date' => $date,
                    ],
                    [
                        'status' => $record['status'],
                        'check_in' => $record['check_in'] ?? null,
                        'check_out' => $record['check_out'] ?? null,
                    ]
                );
            }

            DB::commit();
            return redirect()->back()->with('success', 'Attendance records updated successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Failed to update attendance: ' . $e->getMessage());
        }
    }
}
