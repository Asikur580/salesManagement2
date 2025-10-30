<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Sales Management - Login</title>
    <script src="https://cdn.tailwindcss.com"></script>

    <style>
        /* ===== Animated Gradient Background ===== */
        @keyframes gradientMove {
            0% {
                background-position: 0% 50%;
            }

            50% {
                background-position: 100% 50%;
            }

            100% {
                background-position: 0% 50%;
            }
        }

        body {
            background: linear-gradient(-45deg, #10b981, #06b6d4, #22c55e, #3b82f6);
            background-size: 400% 400%;
            animation: gradientMove 10s ease infinite;
        }

        /* Glassmorphism effect */
        .glass {
            background: rgba(255, 255, 255, 0.15);
            backdrop-filter: blur(18px);
            -webkit-backdrop-filter: blur(18px);
            border: 1px solid rgba(255, 255, 255, 0.25);
        }
    </style>
</head>

<body class="flex items-center justify-center min-h-screen">

    <div class="glass rounded-3xl shadow-2xl flex flex-col md:flex-row w-full max-w-5xl overflow-hidden text-white m-4">

        <!-- Left Side -->
        <div class="hidden md:flex flex-col justify-center items-center w-1/2 p-12 text-center">
            <h1 class="text-4xl font-bold mb-4">Sales Management System</h1>
            <p class="text-green-100 text-sm leading-relaxed max-w-md">
                Empower your team with smart sales tracking and business insights — all in one platform.
            </p>
            <img src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                alt="Sales Illustration" class="w-64 mt-10 opacity-90 drop-shadow-lg">
        </div>

        <!-- Right Side (Login Form) -->
        <div class="w-full md:w-1/2 bg-white text-gray-800 p-10 md:p-16">
            <h2 class="text-3xl font-semibold mb-4 text-gray-800">Welcome Back</h2>
            <p class="text-gray-500 mb-8">Login to your account</p>

            <form method="POST" action="{{ route('login.post') }}" class="space-y-6">
                @csrf
                <div>
                    <label for="email" class="block text-gray-700 font-medium mb-2">Email Address</label>
                    <input type="email" id="email" name="email" value="{{ old('email') }}" required autofocus
                        class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="you@example.com">
                    @error('email')
                    <p class="text-red-500 text-sm mt-1">{{ $message }}</p>
                    @enderror
                </div>

                <div>
                    <label for="password" class="block text-gray-700 font-medium mb-2">Password</label>
                    <input type="password" id="password" name="password" required
                        class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="Enter your password">
                    @error('password')
                    <p class="text-red-500 text-sm mt-1">{{ $message }}</p>
                    @enderror
                </div>

                <button type="submit"
                    class="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold py-2.5 rounded-lg transition duration-200">
                    Login
                </button>
            </form>



            <p class="text-center text-gray-500 text-sm mt-8">
                © 2025 Sales Management — All rights reserved
            </p>
        </div>
    </div>



</body>

</html>