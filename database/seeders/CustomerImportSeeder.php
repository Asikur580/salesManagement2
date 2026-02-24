<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class CustomerImportSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();
        DB::table('customers')->truncate();

        $path = base_path('gldqpoea_radian_agrovet.sql');
        if (!file_exists($path)) {
            $this->command->error("SQL file not found at $path");
            return;
        }

        $lines = file($path);
        $inInsert = false;
        $count = 0;
        $validEmployeeIds = DB::table('employee_details')->pluck('id')->toArray();

        foreach ($lines as $line) {
            $line = trim($line);

            if (strpos($line, "INSERT INTO `customers`") !== false) {
                $inInsert = true;
                continue;
            }

            if ($inInsert) {
                if ($line === "" || strpos($line, "--") === 0 || strpos($line, "CREATE TABLE") !== false || strpos($line, "UNLOCK TABLES") !== false) {
                    $inInsert = false;
                    continue;
                }

                // Handle multi-line inserts
                $rows = explode('),', $line);
                foreach ($rows as $row) {
                    $row = trim($row);
                    if (empty($row)) continue;

                    // Clean up parentheses and semi-colons
                    $row = ltrim($row, '(');
                    $row = rtrim($row, ');');

                    // Use str_getcsv for basic SQL value parsing (handles quotes and nulls reasonably well for this simple dump)
                    // Note: SQL dumps use single quotes and backslashes for escaping, whereas CSV uses different rules.
                    // This is a customized parser for the specific format seen in the SQL dump.

                    // More robust SQL value parser
                    $parts = [];
                    $current = '';
                    $inQuotes = false;
                    for ($i = 0; $i < strlen($row); $i++) {
                        $char = $row[$i];
                        if ($char === "'" && ($i === 0 || $row[$i - 1] !== "\\")) {
                            $inQuotes = !$inQuotes;
                            $current .= $char;
                        } elseif ($char === "," && !$inQuotes) {
                            $parts[] = trim($current);
                            $current = '';
                        } else {
                            $current .= $char;
                        }
                    }
                    $parts[] = trim($current);

                    if (count($parts) >= 12) {
                        $id = $parts[0];
                        $employee_id = $parts[1];

                        $name = trim($parts[3], "'");
                        $proprietor = trim($parts[4], "'");
                        $phone = trim($parts[5], "'");
                        $address = trim($parts[6], "'");
                        $credit_limit = $parts[8];
                        $created_at = trim($parts[10], "'");
                        $updated_at = trim($parts[11], "'");

                        // Link to valid employee or NULL
                        $linkedEmployeeId = in_array((int)$employee_id, $validEmployeeIds) ? (int)$employee_id : null;

                        DB::table('customers')->insert([
                            'id' => (int)$id,
                            'name' => str_replace("\\'", "'", $name),
                            'proprietor_name' => str_replace("\\'", "'", $proprietor),
                            'phone' => $phone,
                            'address_street' => str_replace("\\'", "'", $address),
                            'employee_id' => $linkedEmployeeId,
                            'credit_limit' => is_numeric($credit_limit) ? (float)$credit_limit : 0,
                            'status' => 'active',
                            'created_at' => ($created_at === 'NULL' || empty($created_at)) ? now() : $created_at,
                            'updated_at' => ($updated_at === 'NULL' || empty($updated_at)) ? now() : $updated_at,
                        ]);
                        $count++;
                    }
                }
            }
        }

        Schema::enableForeignKeyConstraints();
        $this->command->info("Successfully imported $count customers.");
    }
}
