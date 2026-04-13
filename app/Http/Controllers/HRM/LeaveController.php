<?php

namespace App\Http\Controllers\HRM;

use App\Http\Controllers\Controller;
use App\Models\LeaveRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class LeaveController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $query = LeaveRequest::with('user');

        // If the user does not have permission to manage leaves,
        // they can only view their own leave requests.
        if (!$user->hasPermissionTo('hrm.leave.manage') && !$user->hasRole('super-admin')) {
            $query->where('user_id', $user->id);
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        $perPage = $request->input('per_page', 15);
        $leaves = $query->latest()->paginate($perPage)->withQueryString();

        return Inertia::render('HRM/Leaves/Index', [
            'leaves' => $leaves,
            'filters' => $request->only(['status']),
            'canManage' => $user->hasPermissionTo('hrm.leave.manage') || $user->hasRole('super-admin'),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'type' => 'required|in:casual,sick,annual',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'reason' => 'nullable|string',
        ]);

        $overlapping = LeaveRequest::where('user_id', Auth::id())
            ->whereIn('status', ['pending', 'approved'])
            ->where(function ($query) use ($request) {
                $query->whereBetween('start_date', [$request->start_date, $request->end_date])
                    ->orWhereBetween('end_date', [$request->start_date, $request->end_date])
                    ->orWhere(function ($q) use ($request) {
                        $q->where('start_date', '<=', $request->start_date)
                          ->where('end_date', '>=', $request->end_date);
                    });
            })->exists();

        if ($overlapping) {
            return redirect()->back()->with('error', 'You already have a pending or approved leave request during this period.');
        }

        LeaveRequest::create([
            'user_id' => Auth::id(),
            'type' => $request->type,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'reason' => $request->reason,
            'status' => 'pending',
        ]);

        return redirect()->back()->with('success', 'Leave request submitted successfully.');
    }

    public function updateStatus(Request $request, $id)
    {
        // Only managers should hit this route. (Protected by middleware in web.php)
        $request->validate([
            'status' => 'required|in:approved,rejected,pending',
        ]);

        $leave = LeaveRequest::findOrFail($id);
        $leave->status = $request->status;
        $leave->save();

        return redirect()->back()->with('success', 'Leave request status updated.');
    }
}
