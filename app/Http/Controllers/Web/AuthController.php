<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Jobs\SendSmsJob;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

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

        // Rate Limiting: Prevent SMS / OTP Bombing (Max 3 SMS per 10 minutes per Phone Number)
        $rateLimitKey = 'otp_requests_' . str_replace('+', '', $phone);
        
        if (Cache::has($rateLimitKey) && Cache::get($rateLimitKey) >= 3) {
            return response()->json([
                'success' => false,
                'message' => 'Too many OTP requests for this number. Please wait 10 minutes before trying again.',
            ], 429);
        }

        if (Cache::has($rateLimitKey)) {
            Cache::increment($rateLimitKey);
        } else {
            // Keep the block active for 10 minutes
            Cache::put($rateLimitKey, 1, Carbon::now()->addMinutes(10));
        }

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

        // Dispatch Background Job to send actual SMS
        SendSmsJob::dispatch($phone, $otp);

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
