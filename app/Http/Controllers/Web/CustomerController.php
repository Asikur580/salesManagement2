<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\EmployeeDetail;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class CustomerController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $query = Customer::with('employee.user');

        // Hierarchy logic
        /** @var User $user */
        if (!$user->hasAnyRole(['admin', 'super-admin'])) {
            $employeeDetail = $user->employeeDetail;
            if ($employeeDetail) {
                $subordinateIds = $employeeDetail->getAllSubordinateIds();
                $query->whereIn('employee_id', $subordinateIds);
            } else {
                $query->whereRaw('1 = 0');
            }
        }

        // Search logic from query params
        if ($request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('proprietor_name', 'like', "%{$search}%");
            });
        }

        // Employee filter
        if ($request->employee_id && $request->employee_id !== 'all') {
            // Need to get all subordinates of this employee to show their customers too
            $selectedEmployee = EmployeeDetail::find($request->employee_id);
            if ($selectedEmployee) {
                $subordinateIds = $selectedEmployee->getAllSubordinateIds();
                $query->whereIn('employee_id', $subordinateIds);
            } else {
                $query->where('employee_id', $request->employee_id);
            }
        }

        $customers = $query->latest()->get()->map(function ($item) {
            return [
                'id' => $item->id,
                'name' => $item->name,
                'proprietorName' => $item->proprietor_name,
                'contact' => [
                    'phone' => $item->phone,
                    'email' => $item->email
                ],
                'address' => [
                    'street' => $item->address_street,
                    'city' => $item->address_city,
                    'state' => $item->address_state,
                    'zipCode' => $item->address_zip_code,
                    'country' => 'USA' // Default if not in DB
                ],
                'employeeId' => $item->employee_id,
                'employeeName' => $item->employee->user->name ?? 'Unassigned',
                'status' => $item->status,
                'creditLimit' => $item->credit_limit ?? 0,
                'joinDate' => $item->created_at->format('Y-m-d'),
                'image' => $item->image,
                'totalOrders' => 0, // Should be calculated
                'totalSpent' => 0,
                'outstandingBalance' => 0
            ];
        });

        // Get employees for filters
        $employeesQuery = EmployeeDetail::with(['user', 'designation']);
        /** @var User $user */
        if (!$user->hasAnyRole(['admin', 'super-admin'])) {
            $employeeDetail = $user->employeeDetail;
            if ($employeeDetail) {
                $employeesQuery->whereIn('id', $employeeDetail->getAllSubordinateIds());
            } else {
                $employeesQuery->whereRaw('1 = 0');
            }
        }
        $employees = $employeesQuery->get();

        return Inertia::render('Customers', [
            'initialCustomers' => $customers,
            'initialEmployees' => $employees,
            'filters' => $request->only(['search', 'employee_id'])
        ]);
    }

    public function show($id)
    {
        $customer = Customer::with('employee.user')->findOrFail($id);

        // Hierarchy check
        $user = Auth::user();
        /** @var User $user */
        if (!$user->hasAnyRole(['admin', 'super-admin'])) {
            $employeeDetail = $user->employeeDetail;
            if ($employeeDetail) {
                $subordinateIds = $employeeDetail->getAllSubordinateIds();
                if (!in_array($customer->employee_id, $subordinateIds)) {
                    return redirect()->route('dashboard')->with('error', 'Unauthorized access to customer.');
                }
            } else {
                return redirect()->route('dashboard')->with('error', 'Unauthorized access.');
            }
        }

        $mappedCustomer = [
            'id' => $customer->id,
            'name' => $customer->name,
            'proprietorName' => $customer->proprietor_name,
            'contact' => [
                'phone' => $customer->phone,
                'email' => $customer->email
            ],
            'address' => [
                'street' => $customer->address_street,
                'city' => $customer->address_city,
                'state' => $customer->address_state,
                'zipCode' => $customer->address_zip_code,
                'country' => 'USA'
            ],
            'employeeId' => $customer->employee_id,
            'employeeName' => $customer->employee->user->name ?? 'Unassigned',
            'status' => $customer->status,
            'creditLimit' => $customer->credit_limit ?? 0,
            'joinDate' => $customer->created_at->format('Y-m-d'),
            'image' => $customer->image,
            'totalOrders' => 0,
            'totalSpent' => 0,
            'outstandingBalance' => 0
        ];

        // Get employees for assignment
        $employeesQuery = EmployeeDetail::with(['user', 'designation']);
        if (!$user->hasAnyRole(['admin', 'super-admin'])) {
            $employeeDetail = $user->employeeDetail;
            if ($employeeDetail) {
                $employeesQuery->whereIn('id', $employeeDetail->getAllSubordinateIds());
            }
        }
        $employees = $employeesQuery->get();

        return Inertia::render('CustomerView', [
            'id' => (string)$id,
            'customer' => $mappedCustomer,
            'employees' => $employees
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'proprietor_name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'email' => 'nullable|email|max:255',
            'address_street' => 'nullable|string',
            'address_city' => 'nullable|string',
            'employee_id' => 'nullable|exists:employee_details,id',
            'status' => 'in:active,inactive',
            'credit_limit' => 'nullable|numeric|min:0',
            'image' => 'nullable|string',
        ]);

        $imagePath = $this->handleImageUpload($request->image);

        Customer::create([
            'name' => $request->name,
            'proprietor_name' => $request->proprietor_name,
            'phone' => $request->phone,
            'email' => $request->email,
            'address_street' => $request->address_street,
            'address_city' => $request->address_city,
            'address_state' => $request->address_state,
            'address_zip_code' => $request->address_zip_code,
            'employee_id' => $request->employee_id,
            'status' => $request->status ?? 'active',
            'credit_limit' => $request->credit_limit ?? 0,
            'image' => $imagePath
        ]);

        return redirect()->back()->with('message', 'Customer created successfully');
    }

    public function update(Request $request, $id)
    {
        $customer = Customer::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'proprietor_name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'email' => 'nullable|email|max:255',
            'address_street' => 'nullable|string',
            'address_city' => 'nullable|string',
            'employee_id' => 'nullable|exists:employee_details,id',
            'status' => 'in:active,inactive',
            'credit_limit' => 'nullable|numeric|min:0',
            'image' => 'nullable|string',
        ]);

        $data = $request->except('image');

        if ($request->filled('image')) {
            $imagePath = $this->handleImageUpload($request->image, $customer->image);
            $data['image'] = $imagePath;
        }

        $customer->update($data);

        return redirect()->back()->with('message', 'Customer updated successfully');
    }

    public function destroy($id)
    {
        $customer = Customer::findOrFail($id);

        if ($customer->image && \Illuminate\Support\Facades\Storage::disk('public')->exists($customer->image)) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($customer->image);
        }

        $customer->delete();

        return redirect()->route('customers.index')->with('message', 'Customer deleted successfully');
    }

    private function handleImageUpload($base64Image, $oldImage = null)
    {
        if (!$base64Image || !preg_match('/^data:image\/(\w+);base64,/', $base64Image, $type)) {
            return $oldImage;
        }

        $image = substr($base64Image, strpos($base64Image, ',') + 1);
        $type = strtolower($type[1]);

        if (!in_array($type, ['jpg', 'jpeg', 'gif', 'png'])) {
            return $oldImage;
        }

        $image = str_replace(' ', '+', $image);
        $image = base64_decode($image);

        if ($oldImage && \Illuminate\Support\Facades\Storage::disk('public')->exists($oldImage)) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($oldImage);
        }

        $imageName = 'customer_' . time() . '_' . \Illuminate\Support\Str::random(10) . '.' . $type;
        \Illuminate\Support\Facades\Storage::disk('public')->put('customers/' . $imageName, $image);

        return 'customers/' . $imageName;
    }
}
