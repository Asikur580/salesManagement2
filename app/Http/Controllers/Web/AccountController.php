<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\UserAddress;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

class AccountController extends Controller
{
    public function index()
    {
        $orders = Order::with(['items'])
            ->where('user_id', Auth::id())
            ->latest()
            ->get();

        $addresses = UserAddress::where('user_id', Auth::id())->latest()->get();

        return Inertia::render('Account/MyAccount', [
            'orders' => $orders,
            'addresses' => $addresses,
            'has_password' => (bool) Auth::user()->password,
        ]);
    }

    public function showOrder(Order $order)
    {
        // Ensure user owns the order
        if ($order->user_id !== Auth::id()) {
            abort(403);
        }

        $order->load(['items.product', 'items.variant']);

        return Inertia::render('Account/OrderDetails', [
            'order' => $order,
        ]);
    }

    public function updateProfile(Request $request)
    {
        $user = Auth::user();
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255', 'unique:users,email,' . $user->id],
            'phone' => ['required', 'string', 'max:20', 'unique:users,phone,' . $user->id],
        ]);

        $user->name = $request->name;
        $user->email = $request->email;
        $user->phone = $request->phone;
        $user->save();

        return back();
    }

    public function updatePassword(Request $request)
    {
        $user = Auth::user();
        $hasPassword = (bool) $user->password;

        $rules = [
            'password' => ['required', 'confirmed', Password::defaults()],
        ];

        if ($hasPassword) {
            $rules['current_password'] = ['required', 'current_password'];
        }

        $request->validate($rules);

        $user->password = Hash::make($request->password);
        $user->save();

        return back()->with('success', 'Password updated successfully.');
    }

    public function storeAddress(Request $request)
    {
        $data = $request->validate([
            'type' => 'required|string|in:home,office,shipping',
            'full_name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'email' => 'nullable|email|max:255',
            'address_line_1' => 'required|string|max:500',
            'address_line_2' => 'nullable|string|max:500',
            'city' => 'required|string|max:255',
            'area' => 'nullable|string|max:255',
            'postal_code' => 'nullable|string|max:20',
            'is_default' => 'boolean',
        ]);

        if ($data['is_default']) {
            UserAddress::where('user_id', Auth::id())->update(['is_default' => false]);
        }

        Auth::user()->addresses()->create($data);

        return back()->with('success', 'Address added successfully.');
    }

    public function updateAddress(Request $request, UserAddress $address)
    {
        if ($address->user_id !== Auth::id()) {
            abort(403);
        }

        $data = $request->validate([
            'type' => 'required|string|in:home,office,shipping',
            'full_name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'email' => 'nullable|email|max:255',
            'address_line_1' => 'required|string|max:500',
            'address_line_2' => 'nullable|string|max:500',
            'city' => 'required|string|max:255',
            'area' => 'nullable|string|max:255',
            'postal_code' => 'nullable|string|max:20',
            'is_default' => 'boolean',
        ]);

        if ($data['is_default']) {
            UserAddress::where('user_id', Auth::id())->update(['is_default' => false]);
        }

        $address->update($data);

        return back()->with('success', 'Address updated successfully.');
    }

    public function deleteAddress(UserAddress $address)
    {
        if ($address->user_id !== Auth::id()) {
            abort(403);
        }

        $address->delete();

        return back()->with('success', 'Address deleted successfully.');
    }
}
