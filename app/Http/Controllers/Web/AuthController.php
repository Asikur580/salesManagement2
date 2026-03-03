<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    public function showLogin()
    {
        return Inertia::render('Login');
    }

    public function showAdminLogin()
    {
        return Inertia::render('AdminLogin');
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        if (Auth::attempt($credentials, $request->remember)) {
            $request->session()->regenerate();

            $user = Auth::user();
            if ($user->hasAnyRole(['super-admin', 'admin', 'sales', 'accountant'])) {
                return redirect()->intended('dashboard');
            }

            return redirect()->intended(route('shop.index'));
        }

        return back()->withErrors([
            'email' => 'The provided credentials do not match our records.',
        ])->onlyInput('email');
    }

    public function adminLogin(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        if (Auth::attempt($credentials, $request->remember)) {
            $request->session()->regenerate();

            $user = Auth::user();
            if ($user->hasAnyRole(['super-admin', 'admin', 'sales', 'accountant'])) {
                return redirect()->intended('dashboard');
            }

            // If a customer tries to login through admin page, log them out or redirect to shop
            Auth::logout();
            return back()->withErrors([
                'email' => 'Access denied. Only administrators can access the dashboard.',
            ]);
        }

        return back()->withErrors([
            'email' => 'The provided credentials do not match our records.',
        ])->onlyInput('email');
    }

    public function logout(Request $request)
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/login');
    }

    public function sendOTP(Request $request)
    {
        $request->validate([
            'phone' => ['required', 'string', 'min:11'],
        ]);

        $phone = $request->phone;
        $otp = rand(100000, 999999);
        $expiresAt = Carbon::now()->addMinutes(5);

        $user = User::where('phone', $phone)->first();

        if (!$user) {
            $user = User::create([
                'name' => 'Guest ' . substr($phone, -4),
                'phone' => $phone,
                // Password and email are nullable now
            ]);
            $user->assignRole('customer');
        }

        $user->update([
            'otp' => $otp,
            'otp_expires_at' => $expiresAt,
        ]);

        // LOG OTP for development (since we don't have an SMS gateway integrated)
        Log::info("OTP for {$phone}: {$otp}");

        return response()->json([
            'success' => true,
            'message' => 'OTP sent successfully.',
            'otp_preview' => config('app.debug') ? $otp : null, // Show ONLY in debug mode
        ]);
    }

    public function verifyOTP(Request $request)
    {
        $request->validate([
            'phone' => ['required', 'string'],
            'otp' => ['required', 'string'],
        ]);

        $user = User::where('phone', $request->phone)
            ->where('otp', $request->otp)
            ->where('otp_expires_at', '>', Carbon::now())
            ->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid or expired OTP.',
            ], 422);
        }

        // Clear OTP
        $user->update([
            'otp' => null,
            'otp_expires_at' => null,
        ]);

        Auth::login($user, true);
        $request->session()->regenerate();

        return response()->json([
            'success' => true,
            'redirect' => route('shop.index'),
        ]);
    }
}
