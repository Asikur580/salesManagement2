<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class EmployeeImportSeeder extends Seeder
{
    public function run()
    {
        Schema::disableForeignKeyConstraints();
        DB::table('employee_details')->truncate();

        $sql = file_get_contents('gldqpoea_radian_agrovet.sql');

        // Extract users first for mapping
        $usersMap = [];
        if (preg_match('/INSERT INTO `users` .*? VALUES\s*(.*?);/s', $sql, $matches)) {
            $values = $matches[1];
            preg_match_all('/\((.*?)\)/s', $values, $entryMatches);
            foreach ($entryMatches[1] as $entry) {
                $parts = str_getcsv($entry, ',', "'");
                $usersMap[$parts[1]] = [ // employee_id is key
                    'email' => $parts[2],
                    'password' => $parts[3],
                ];
            }
        }

        // Extract employees
        if (preg_match('/INSERT INTO `employees` .*? VALUES\s*(.*?);/s', $sql, $matches)) {
            $values = $matches[1];
            preg_match_all('/\((.*?)\)/s', $values, $entryMatches);
            foreach ($entryMatches[1] as $entry) {
                $parts = $this->parseSqlEntry($entry);
                if (count($parts) < 16) continue;

                $id = $parts[0];
                $employeeCode = $parts[1]; // e.g. RA-1
                $designationId = $parts[2];
                $name = $parts[3];
                $phone = $parts[4];
                $territory = $parts[5];
                $district = $parts[6];
                $nationalId = $parts[7];
                $bloodGroup = $parts[8];
                $image = $parts[9];
                $creditLimit = $parts[10];
                $status = $parts[13] == 'active' ? 'active' : 'inactive';

                // Find or create user
                $email = $usersMap[$id]['email'] ?? "employee{$id}@radianagro.com";
                $user = DB::table('users')->where('email', $email)->first();

                if (!$user) {
                    $userId = DB::table('users')->insertGetId([
                        'name' => $name,
                        'email' => $email,
                        'password' => $usersMap[$id]['password'] ?? Hash::make('password'),
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                } else {
                    $userId = $user->id;
                    DB::table('users')->where('id', $userId)->update(['name' => $name]);
                }

                // Map role based on designation
                $roleId = $this->getRoleIdByDesignation($designationId);

                DB::table('employee_details')->insert([
                    'id' => $id,
                    'user_id' => $userId,
                    'role_id' => $roleId,
                    'company_id' => 1,
                    'department_id' => ($roleId == 2) ? 2 : 1, // Admin dept for admin role, Marketing otherwise
                    'designation_id' => $designationId,
                    'employee_id' => $employeeCode,
                    'credit_limit' => $creditLimit ?: 0,
                    'phone' => $phone,
                    'national_id' => $nationalId,
                    'blood_group' => $bloodGroup,
                    'territory' => $territory,
                    'district' => $district,
                    'status' => $status,
                    'image' => $image && $image !== 'NULL' ? "employees/{$image}" : null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                // Assign role in model_has_roles if not exists
                $roleName = DB::table('roles')->where('id', $roleId)->value('name');
                if ($roleName) {
                    $hasRole = DB::table('model_has_roles')
                        ->where('role_id', $roleId)
                        ->where('model_id', $userId)
                        ->where('model_type', 'App\Models\User')
                        ->exists();
                    if (!$hasRole) {
                        DB::table('model_has_roles')->insert([
                            'role_id' => $roleId,
                            'model_type' => 'App\Models\User',
                            'model_id' => $userId,
                        ]);
                    }
                }
            }
        }

        Schema::enableForeignKeyConstraints();
        $this->command->info('Employees imported successfully!');
    }

    private function getRoleIdByDesignation($id)
    {
        $managers = [1, 2, 16, 19, 20];
        $officers = [4, 5, 17, 18, 23];
        $admins = [22];
        $rsms = [24];

        if (in_array($id, $managers)) return 4;
        if (in_array($id, $officers)) return 5;
        if (in_array($id, $admins)) return 2;
        if (in_array($id, $rsms)) return 3;

        return 5; // Default to officer
    }

    private function parseSqlEntry($entry)
    {
        $parts = [];
        $current = '';
        $inQuotes = false;
        $quoteChar = '';

        for ($i = 0; $i < strlen($entry); $i++) {
            $char = $entry[$i];
            if (($char === "'" || $char === '"') && ($i === 0 || $entry[$i - 1] !== '\\')) {
                if ($inQuotes && $char === $quoteChar) {
                    $inQuotes = false;
                } else if (!$inQuotes) {
                    $inQuotes = true;
                    $quoteChar = $char;
                } else {
                    $current .= $char;
                }
            } else if ($char === ',' && !$inQuotes) {
                $parts[] = trim($current) === 'NULL' ? null : trim($current);
                $current = '';
            } else {
                $current .= $char;
            }
        }
        $parts[] = trim($current) === 'NULL' ? null : trim($current);

        return $parts;
    }
}
