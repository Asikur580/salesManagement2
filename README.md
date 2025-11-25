# 📦 Sales Management System

A complete Sales Management System featuring Customer Management, Employee Management, Supplier Management, Product Management, Order Management, and Sales Tracking.  
Built with **Laravel 12**, **MySQL**, and modern development practices to ensure a scalable and maintainable business workflow.

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
- 🔐 Secure API Authentication (Laravel Sanctum)  
- 📊 Dashboard & Sales Reports  

---

## 🛠️ Tech Stack

- **Backend:** Laravel 12  
- **Database:** MySQL  
- **Authentication:** Laravel Sanctum  
- **Package Managers:** Composer & NPM  
- **Others:** REST API, Seeders, Migrations, Collections, Eloquent ORM  

---

## 📥 Project Setup

Follow these steps to run the project locally:

### 1️⃣ Clone the repository & install dependencies

```bash
git clone https://github.com/your-username/sales-management.git
cd sales-management
composer install
npm install
```
### 2️⃣ Setup environment file
```bash
cp .env.example .env
```
### Update database credentials inside .env:
```bash
DB_DATABASE=sales_management
DB_USERNAME=root
DB_PASSWORD=
```
### 3️⃣ Generate application key
```bash
php artisan key:generate
```
### 4️⃣ Run database migrations
```bash
php artisan migrate
```
### 5️⃣ Seed required data
```bash
php artisan db:seed --class=DesignationSeeder
php artisan db:seed --class=RoleSeeder
php artisan db:seed --class=AdminSeeder
```
### 6️⃣ Start Laravel server
```bash
php artisan serve
```
### 7️⃣ Run frontend assets
```bash
npm run dev
```