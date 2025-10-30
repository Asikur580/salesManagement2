<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" type="image/x-icon" href="Asik-icon.png">
    <title>Sales Manager Dashboard</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js"></script>
    <!-- ✅ Font Awesome CDN -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>

</head>

<body class="bg-gray-100">
    <!-- Header -->
    <header class="bg-white shadow-md fixed top-0 left-0 right-0 z-50">
        <div class="flex items-center justify-between px-6 py-4">
            <!-- Logo -->
            <div class="flex items-center space-x-4">
                <button id="menuToggle" class="lg:hidden text-gray-600 hover:text-gray-800">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M4 6h16M4 12h16M4 18h16"></path>
                    </svg>
                </button>
                <h1 class="text-2xl font-bold text-blue-600">Sales Manager</h1>
            </div>

            <!-- Right Section -->
            <div class="flex items-center space-x-4 relative">
                <!-- 🔔 Notification Button -->
                <button id="notificationBtn" class="relative p-2 text-gray-600 hover:text-gray-800">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9">
                        </path>
                    </svg>
                    <span class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                <!-- 🔽 Notification Dropdown -->
                <div id="notificationDropdown"
                    class="hidden fixed right-6 top-[72px] w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <div class="p-3 border-b font-semibold text-gray-700">Notifications</div>
                    <ul class="max-h-60 overflow-y-auto">
                        <li class="px-4 py-2 hover:bg-gray-100 text-sm text-gray-700 cursor-pointer">
                            🛒 New sale recorded!
                        </li>
                        <li class="px-4 py-2 hover:bg-gray-100 text-sm text-gray-700 cursor-pointer">
                            📦 Stock running low on "Rice".
                        </li>
                        <li class="px-4 py-2 hover:bg-gray-100 text-sm text-gray-700 cursor-pointer">
                            💬 New message from Admin.
                        </li>
                    </ul>
                    <div class="p-2 text-center text-blue-600 text-sm font-medium hover:bg-gray-50 cursor-pointer">
                        View all
                    </div>
                </div>

                <!-- 👤 User Profile Button -->
                <div id="userProfileBtn" class="flex items-center space-x-2 cursor-pointer">
                    <div class="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                        JD
                    </div>
                    <span class="hidden md:block text-sm font-medium text-gray-700">John Doe</span>
                    <svg class="w-4 h-4 text-gray-500 hidden md:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M19 9l-7 7-7-7" />
                    </svg>
                </div>

                <!-- 🔽 User Profile Dropdown -->
                <div id="userDropdown"
                    class="hidden fixed right-6 top-[72px] w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <div class="p-3 border-b text-gray-700">
                        <div class="font-semibold">John Doe</div>
                        <div class="text-sm text-gray-500">john@example.com</div>
                    </div>
                    <ul class="text-sm text-gray-700">
                        <li class="px-4 py-2 hover:bg-gray-100 cursor-pointer">Profile</li>
                        <li class="px-4 py-2 hover:bg-gray-100 cursor-pointer">Settings</li>
                    </ul>
                    <!-- Logout Form -->
                    <form id="logoutForm" method="POST" action="{{ route('logout') }}">
                        @csrf
                        <button type="button"
                            onclick="confirmLogout1()"
                            class="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 font-medium">
                            Logout
                        </button>
                    </form>

                </div>
            </div>
        </div>
    </header>

    <div class="flex pt-16">

        <!-- Sidebar -->
        <aside id="sidebar"
            class="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white shadow-lg transform -translate-x-full lg:translate-x-0 transition-transform duration-300 ease-in-out z-40 overflow-y-auto">

            <nav class="p-4 space-y-1">
                <!-- Dashboard -->
                <a href="index.php"
                    class="flex items-center space-x-3 px-4 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                    <i class="fas fa-tachometer-alt w-5"></i>
                    <span class="font-medium">Dashboard</span>
                </a>

                <!-- Sales / Orders Dropdown -->
                <div class="space-y-1">
                    <button onclick="toggleDropdown('salesDropdown')"
                        class="flex w-full items-center justify-between px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg focus:outline-none">
                        <span class="flex items-center space-x-3">
                            <i class="fas fa-shopping-cart w-5"></i>
                            <span class="font-medium">Sales / Orders</span>
                        </span>
                        <i class="fas fa-chevron-down w-4 h-4 transition-transform" id="icon-salesDropdown"></i>
                    </button>
                    <div id="salesDropdown" class="hidden ml-10 border-l pl-3 space-y-2">
                        <a href="sales.php" class="block text-sm text-gray-600 hover:text-blue-600">All Orders</a>
                        <a href="#" class="block text-sm text-gray-600 hover:text-blue-600">Pending Orders</a>
                        <a href="#" class="block text-sm text-gray-600 hover:text-blue-600">Completed Orders</a>
                    </div>
                </div>

                <!-- Customers Dropdown -->
                <div class="space-y-1">
                    <button onclick="toggleDropdown('customerDropdown')"
                        class="flex w-full items-center justify-between px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg focus:outline-none">
                        <span class="flex items-center space-x-3">
                            <i class="fas fa-users w-5"></i>
                            <span class="font-medium">Customers</span>
                        </span>
                        <i class="fas fa-chevron-down w-4 h-4 transition-transform" id="icon-customerDropdown"></i>
                    </button>
                    <div id="customerDropdown" class="hidden ml-10 border-l pl-3 space-y-2">
                        <a href="#" class="block text-sm text-gray-600 hover:text-blue-600">All Customers</a>
                        <a href="#" class="block text-sm text-gray-600 hover:text-blue-600">New Customers</a>
                        <a href="#" class="block text-sm text-gray-600 hover:text-blue-600">Customer Groups</a>
                    </div>
                </div>

                <!-- Products Dropdown -->
                <div class="space-y-1">
                    <button onclick="toggleDropdown('productDropdown')"
                        class="flex w-full items-center justify-between px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg focus:outline-none">
                        <span class="flex items-center space-x-3">
                            <i class="fas fa-box-open w-5"></i>
                            <span class="font-medium">Products</span>
                        </span>
                        <i class="fas fa-chevron-down w-4 h-4 transition-transform" id="icon-productDropdown"></i>
                    </button>
                    <div id="productDropdown" class="hidden ml-10 border-l pl-3 space-y-2">
                        <a href="#" class="block text-sm text-gray-600 hover:text-blue-600">All Products</a>
                        <a href="#" class="block text-sm text-gray-600 hover:text-blue-600">Add Product</a>
                        <a href="#" class="block text-sm text-gray-600 hover:text-blue-600">Stock Alert</a>
                    </div>
                </div>

                <!-- Reports Dropdown -->
                <div class="space-y-1">
                    <button onclick="toggleDropdown('reportDropdown')"
                        class="flex w-full items-center justify-between px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg focus:outline-none">
                        <span class="flex items-center space-x-3">
                            <i class="fas fa-chart-line w-5"></i>
                            <span class="font-medium">Reports</span>
                        </span>
                        <i class="fas fa-chevron-down w-4 h-4 transition-transform" id="icon-reportDropdown"></i>
                    </button>
                    <div id="reportDropdown" class="hidden ml-10 border-l pl-3 space-y-2">
                        <a href="#" class="block text-sm text-gray-600 hover:text-blue-600">Sales Report</a>
                        <a href="#" class="block text-sm text-gray-600 hover:text-blue-600">Inventory Report</a>
                        <a href="#" class="block text-sm text-gray-600 hover:text-blue-600">Expense Report</a>
                    </div>
                </div>

                <!-- Normal Menus -->
                <a href="#" class="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg">
                    <i class="fas fa-truck w-5"></i>
                    <span class="font-medium">Suppliers</span>
                </a>
                <a href="#" class="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg">
                    <i class="fas fa-user-tie w-5"></i>
                    <span class="font-medium">Employees</span>
                </a>
                <a href="#" class="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg">
                    <i class="fas fa-receipt w-5"></i>
                    <span class="font-medium">Expenses</span>
                </a>
                <a href="#" class="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg">
                    <i class="fas fa-store w-5"></i>
                    <span class="font-medium">Vendors</span>
                </a>
                <a href="#" class="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg">
                    <i class="fas fa-file-invoice w-5"></i>
                    <span class="font-medium">Purchase Orders</span>
                </a>
                <a href="#" class="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg">
                    <i class="fas fa-file-invoice-dollar w-5"></i>
                    <span class="font-medium">Invoices</span>
                </a>
                <a href="#" class="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg">
                    <i class="fas fa-envelope w-5"></i>
                    <span class="font-medium">Messages</span>
                </a>
                <a href="#" class="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg">
                    <i class="fas fa-bell w-5"></i>
                    <span class="font-medium">Notifications</span>
                </a>

                <!-- Sales / Orders Dropdown -->
                <div class="space-y-1">
                    <button onclick="toggleDropdown('settings')"
                        class="flex w-full items-center justify-between px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg focus:outline-none">
                        <span class="flex items-center space-x-3">
                            <i class="fas fa-cogs w-5"></i>
                            <span class="font-medium">Settings</span>
                        </span>
                        <i class="fas fa-chevron-down w-4 h-4 transition-transform" id="icon-settings"></i>
                    </button>
                    <div id="settings" class="hidden ml-10 border-l pl-3 space-y-2">
                        <a href="#" class="block text-sm text-gray-600 hover:text-blue-600">Role</a>
                        <a href="#" class="block text-sm text-gray-600 hover:text-blue-600">User</a>
                    </div>
                </div>

                <!-- Logout Link -->
                <a href="#"
                    onclick="confirmLogout(event)"
                    class="flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg mt-3">
                    <i class="fas fa-sign-out-alt w-5"></i>
                    <span class="font-medium">Logout</span>
                </a>

                <!-- Hidden Logout Form -->
                <form id="logout-form" action="{{ route('logout') }}" method="POST" class="hidden">
                    @csrf
                </form>

            </nav>
        </aside>

        <!-- Main Content -->
        <main class="flex-1 lg:ml-64 p-6">
            <!-- Summary Cards -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div class="bg-white rounded-lg shadow-md p-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-500 text-sm font-medium">Total Sales</p>
                            <h3 class="text-2xl font-bold text-gray-800 mt-2">$124,563</h3>
                            <p class="text-green-500 text-sm mt-2">+12.5% from last month</p>
                        </div>
                        <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </div>
                    </div>
                </div>

                <div class="bg-white rounded-lg shadow-md p-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-500 text-sm font-medium">Total Orders</p>
                            <h3 class="text-2xl font-bold text-gray-800 mt-2">1,847</h3>
                            <p class="text-green-500 text-sm mt-2">+8.2% from last month</p>
                        </div>
                        <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                            </svg>
                        </div>
                    </div>
                </div>

                <div class="bg-white rounded-lg shadow-md p-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-500 text-sm font-medium">Total Customers</p>
                            <h3 class="text-2xl font-bold text-gray-800 mt-2">9,524</h3>
                            <p class="text-green-500 text-sm mt-2">+15.3% from last month</p>
                        </div>
                        <div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                            <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                            </svg>
                        </div>
                    </div>
                </div>

                <div class="bg-white rounded-lg shadow-md p-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-500 text-sm font-medium">Revenue Growth</p>
                            <h3 class="text-2xl font-bold text-gray-800 mt-2">23.5%</h3>
                            <p class="text-green-500 text-sm mt-2">+5.4% from last month</p>
                        </div>
                        <div class="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                            <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Footer include -->
            <!-- footer.php -->
            <footer class="bg-white rounded-lg shadow-md p-4 text-center mt-6">
                <p class="text-sm text-gray-600">© 2025 Soft Deal IT — All Rights Reserved</p>
            </footer>
        </main>

    </div>

    <script>
        function confirmLogout1() {
            Swal.fire({
                title: 'Are you sure?',
                text: 'You will be logged out of your account.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#10b981', // emerald-500
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, logout',
                background: '#ffffff',
                customClass: {
                    popup: 'rounded-2xl shadow-lg',
                    title: 'text-gray-800 font-semibold',
                    htmlContainer: 'text-gray-600'
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    document.getElementById('logoutForm').submit();
                }
            });
        }
    </script>

    <!-- SweetAlert2 Script -->
    <script>
        function confirmLogout(event) {
            event.preventDefault(); // stop default link behavior

            Swal.fire({
                title: 'Are you sure?',
                text: "You will be logged out of your account.",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#10b981', // emerald-500
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, logout',
                background: '#ffffff',
                customClass: {
                    popup: 'rounded-2xl shadow-lg',
                    title: 'text-gray-800 font-semibold',
                    htmlContainer: 'text-gray-600'
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    document.getElementById('logout-form').submit();
                }
            });
        }
    </script>

    <!-- JS -->
    <script>
        function toggleDropdown(id) {
            const dropdown = document.getElementById(id);
            const icon = document.getElementById('icon-' + id);

            dropdown.classList.toggle('hidden');
            icon.classList.toggle('rotate-180');
        }
    </script>

    <script>
        // Mobile menu toggle
        const menuToggle = document.getElementById('menuToggle');
        const sidebar = document.getElementById('sidebar');

        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('-translate-x-full');
        });

        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', (e) => {
            if (window.innerWidth < 1024) {
                if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
                    sidebar.classList.add('-translate-x-full');
                }
            }
        });

        // Sales Chart
        const ctx = document.getElementById('salesChart').getContext('2d');
        const salesChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
                datasets: [{
                    label: 'Sales',
                    data: [65000, 72000, 68000, 85000, 92000, 88000, 105000, 112000, 118000, 124563],
                    borderColor: 'rgb(37, 99, 235)',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointRadius: 4,
                    pointBackgroundColor: 'rgb(37, 99, 235)',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                }, {
                    label: 'Orders',
                    data: [1200, 1350, 1280, 1520, 1640, 1580, 1750, 1820, 1790, 1847],
                    borderColor: 'rgb(34, 197, 94)',
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointRadius: 4,
                    pointBackgroundColor: 'rgb(34, 197, 94)',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            }
        });
    </script>

    <script>
        document.querySelectorAll('#sidebar a').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const url = this.getAttribute('href');

                fetch(url)
                    .then(res => res.text())
                    .then(html => {
                        const parser = new DOMParser();
                        const doc = parser.parseFromString(html, 'text/html');
                        const newContent = doc.querySelector('main').innerHTML;
                        document.querySelector('main').innerHTML = newContent;
                    });
            });
        });
    </script>

    <script>
        const notificationBtn = document.getElementById('notificationBtn');
        const notificationDropdown = document.getElementById('notificationDropdown');
        const userProfileBtn = document.getElementById('userProfileBtn');
        const userDropdown = document.getElementById('userDropdown');

        // Toggle Notification Dropdown
        notificationBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            notificationDropdown.classList.toggle('hidden');
            userDropdown.classList.add('hidden');
        });

        // Toggle User Dropdown
        userProfileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            userDropdown.classList.toggle('hidden');
            notificationDropdown.classList.add('hidden');
        });

        // Hide dropdowns on outside click
        document.addEventListener('click', (e) => {
            if (!notificationDropdown.contains(e.target) && !notificationBtn.contains(e.target)) {
                notificationDropdown.classList.add('hidden');
            }
            if (!userDropdown.contains(e.target) && !userProfileBtn.contains(e.target)) {
                userDropdown.classList.add('hidden');
            }
        });
    </script>



</body>

</html>