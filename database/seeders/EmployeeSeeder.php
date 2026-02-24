<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\EmployeeDetail;
use App\Models\Designation;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class EmployeeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Role IDs and Designation IDs (based on previous investigation)
        $roles = Role::pluck('id', 'name')->toArray();
        $designations = Designation::pluck('id', 'name')->toArray();

        // 1. Create Admin
        $admin = $this->createEmployee([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'role_id' => $roles['admin'],
            'designation_id' => $designations['Admin'] ?? 1,
            'employee_id' => 'EMP001',
            'parent_id' => null
        ], 'admin');

        // 2. Create RSMs
        $rsm1 = $this->createEmployee([
            'name' => 'RSM One',
            'email' => 'rsm1@example.com',
            'role_id' => $roles['rsm'],
            'designation_id' => $designations['R S M'] ?? 12,
            'employee_id' => 'EMP002',
            'parent_id' => $admin->id
        ], 'rsm');

        $rsm2 = $this->createEmployee([
            'name' => 'RSM Two',
            'email' => 'rsm2@example.com',
            'role_id' => $roles['rsm'],
            'designation_id' => $designations['R S M'] ?? 12,
            'employee_id' => 'EMP003',
            'parent_id' => $admin->id
        ], 'rsm');

        // 3. Create Managers
        $mgr1 = $this->createEmployee([
            'name' => 'Manager One',
            'email' => 'mgr1@example.com',
            'role_id' => $roles['manager'],
            'designation_id' => $designations['Area Manager'] ?? 3,
            'employee_id' => 'EMP004',
            'parent_id' => $rsm1->id
        ], 'manager');

        $mgr2 = $this->createEmployee([
            'name' => 'Manager Two',
            'email' => 'mgr2@example.com',
            'role_id' => $roles['manager'],
            'designation_id' => $designations['Area Manager'] ?? 3,
            'employee_id' => 'EMP005',
            'parent_id' => $rsm2->id
        ], 'manager');

        $mgr3 = $this->createEmployee([
            'name' => 'Manager Three',
            'email' => 'mgr3@example.com',
            'role_id' => $roles['manager'],
            'designation_id' => $designations['Area Manager'] ?? 3,
            'employee_id' => 'EMP006',
            'parent_id' => $rsm1->id
        ], 'manager');

        // 4. Create Officers
        $this->createEmployee([
            'name' => 'Officer One',
            'email' => 'off1@example.com',
            'role_id' => $roles['officer'],
            'designation_id' => $designations['Marketing Executive'] ?? 4,
            'employee_id' => 'EMP007',
            'parent_id' => $mgr1->id
        ], 'officer');

        $this->createEmployee([
            'name' => 'Officer Two',
            'email' => 'off2@example.com',
            'role_id' => $roles['officer'],
            'designation_id' => $designations['Marketing Executive'] ?? 4,
            'employee_id' => 'EMP008',
            'parent_id' => $mgr2->id
        ], 'officer');

        $this->createEmployee([
            'name' => 'Officer Three',
            'email' => 'off3@example.com',
            'role_id' => $roles['officer'],
            'designation_id' => $designations['Marketing Executive'] ?? 4,
            'employee_id' => 'EMP009',
            'parent_id' => $mgr3->id
        ], 'officer');

        $this->createEmployee([
            'name' => 'Officer Four',
            'email' => 'off4@example.com',
            'role_id' => $roles['officer'],
            'designation_id' => $designations['Marketing Executive'] ?? 4,
            'employee_id' => 'EMP010',
            'parent_id' => $mgr1->id
        ], 'officer');
    }

    private function createEmployee(array $data, string $roleName): EmployeeDetail
    {
        $user = User::updateOrCreate(
            ['email' => $data['email']],
            [
                'name' => $data['name'],
                'password' => Hash::make('password'),
            ]
        );

        $user->syncRoles($roleName);

        return EmployeeDetail::updateOrCreate(
            ['user_id' => $user->id],
            [
                'role_id' => $data['role_id'],
                'designation_id' => $data['designation_id'],
                'parent_id' => $data['parent_id'],
                'employee_id' => $data['employee_id'],
                'status' => 'active',
                'login_allowed' => true,
            ]
        );
    }
}
