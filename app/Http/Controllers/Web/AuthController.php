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
        $request->validate([
            'login' => ['required', 'string'],
            'password' => ['required'],
        ]);

        $login = $request->input('login');
        $fieldType = filter_var($login, FILTER_VALIDATE_EMAIL) ? 'email' : 'phone';

        $credentials = [
            $fieldType => $login,
            'password' => $request->input('password'),
        ];

        if (Auth::attempt($credentials, $request->remember)) {
            $request->session()->regenerate();

            $user = Auth::user();

            if ($user->employeeProfile && !$user->employeeProfile->is_active) {
                Auth::logout();
                $request->session()->invalidate();
                return back()->withErrors([
                    'login' => 'Your account has been deactivated. Please contact the administrator.',
                ])->onlyInput('login');
            }

            if ($user->hasAnyRole(['super-admin', 'admin', 'sales', 'accountant'])) {
                return redirect()->intended('dashboard');
            }

            return redirect()->intended(route('shop.index'));
        }

        return back()->withErrors([
            'login' => 'The provided credentials do not match our records.',
        ])->onlyInput('login');
    }

    public function adminLogin(Request $request)
    {
        $request->validate([
            'login' => ['required', 'string'],
            'password' => ['required'],
        ]);

        $login = $request->input('login');
        $fieldType = filter_var($login, FILTER_VALIDATE_EMAIL) ? 'email' : 'phone';

        $credentials = [
            $fieldType => $login,
            'password' => $request->input('password'),
        ];

        if (Auth::attempt($credentials, $request->remember)) {
            $request->session()->regenerate();

            $user = Auth::user();

            if ($user->employeeProfile && !$user->employeeProfile->is_active) {
                Auth::logout();
                $request->session()->invalidate();
                return back()->withErrors([
                    'login' => 'Your account has been deactivated. Please contact the administrator.',
                ])->onlyInput('login');
            }

            if ($user->hasAnyRole(['super-admin', 'admin', 'sales', 'accountant'])) {
                return redirect()->intended('dashboard');
            }

            // If a customer tries to login through admin page, log them out or redirect to shop
            Auth::logout();
            return back()->withErrors([
                'login' => 'Access denied. Only administrators can access the dashboard.',
            ]);
        }

        return back()->withErrors([
            'login' => 'The provided credentials do not match our records.',
        ])->onlyInput('login');
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

        // Migrate session cart to database
        $sessionCart = $request->session()->get('cart', []);
        foreach ($sessionCart as $item) {
            $cartItem = \App\Models\Cart::where('user_id', $user->id)
                ->where('product_id', $item['product_id'])
                ->where('variant_id', $item['variant_id'])
                ->first();

            if ($cartItem) {
                // If item exists in DB, we could either overwrite or add. Adding quantity seems safer.
                $cartItem->increment('quantity', $item['quantity']);
            } else {
                \App\Models\Cart::create([
                    'user_id' => $user->id,
                    'product_id' => $item['product_id'],
                    'variant_id' => $item['variant_id'],
                    'quantity' => $item['quantity'],
                ]);
            }
        }
        $request->session()->forget('cart');

        $request->session()->regenerate();

        return response()->json([
            'success' => true,
            'redirect' => route('shop.index'),
        ]);
    }
}
