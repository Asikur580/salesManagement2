# 📦 Sales Management System

A complete Sales Management System featuring Customer Management, Employee Management, Supplier Management, Product Management, Order Management, and Sales Tracking.  
Built with **Laravel**, **MySQL**, and **Vue/React (if used)** to ensure a smooth and scalable business workflow.

---

## 🚀 Features

- 👤 Customer Management  
- 🧑‍💼 Employee Management (RSM, Manager, Officer, etc.)  
- 🚚 Supplier Management  
- 📦 Product Management  
- 🧾 Order Management  
- 💰 Sales Management  
- 🎯 Role-Based Access Control (RBAC)  
- 🏷️ Designation Management  
- 🔐 Admin Panel Authentication  
- 📊 Dashboard & Reports  

---

## 🛠️ Tech Stack

- **Backend:** Laravel 12
- **Database:** MySQL  
- **Package Manager:** Composer & NPM  
- **Authentication:** Laravel sanctum 
- **Others:** REST API, Seeders, Migrations  

---

## 📥 Project Setup

Follow these steps to run the project locally:

### 1️⃣ Clone the repository

```bash
git clone https://github.com/your-username/sales-management.git
cd sales-management
composer install
npm install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan db:seed --class=DesignationSeeder
php artisan db:seed --class=RoleSeeder
php artisan db:seed --class=AdminSeeder
php artisan serve
npm run dev


