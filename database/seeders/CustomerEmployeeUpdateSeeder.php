<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class CustomerEmployeeUpdateSeeder extends Seeder
{
    public function run()
    {
        $sqlFile = 'gldqpoea_radian_agrovet.sql';
        if (!file_exists($sqlFile)) {
            $this->command->error("SQL file not found: $sqlFile");
            return;
        }

        $handle = fopen($sqlFile, 'r');
        $inInsert = false;
        $count = 0;

        while (($line = fgets($handle)) !== false) {
            if (strpos($line, 'INSERT INTO `customers`') !== false) {
                $inInsert = true;
                continue;
            }

            if ($inInsert) {
                if (trim($line) == '' || strpos($line, '--') === 0 || strpos($line, 'UNLOCK TABLES') !== false) {
                    $inInsert = false;
                    continue;
                }

                // Extract values using regex or simple parsing
                preg_match_all('/\((.*?)\)(?:,|;)/s', $line, $matches);

                foreach ($matches[1] as $entry) {
                    $values = $this->parseSqlValue($entry);

                    if (count($values) >= 12) {
                        $id = $values[0];
                        $employeeId = $values[1]; // The employee_id in the dump

                        if ($employeeId && $employeeId !== 'NULL') {
                            // Verify if employee exists in employee_details
                            $exists = DB::table('employee_details')->where('id', $employeeId)->exists();

                            if ($exists) {
                                DB::table('customers')
                                    ->where('id', $id)
                                    ->update(['employee_id' => $employeeId]);
                                $count++;
                            }
                        }
                    }
                }

                if (strpos($line, ';') !== false) {
                    $inInsert = false;
                }
            }
        }

        fclose($handle);
        $this->command->info("Updated $count customers with employee IDs.");
    }

    private function parseSqlValue($entry)
    {
        $result = [];
        $current = '';
        $inQuotes = false;
        $esc = false;

        for ($i = 0; $i < strlen($entry); $i++) {
            $c = $entry[$i];
            if ($esc) {
                $current .= $c;
                $esc = false;
            } elseif ($c == '\\') {
                $esc = true;
            } elseif ($c == "'") {
                $inQuotes = !$inQuotes;
            } elseif ($c == ',' && !$inQuotes) {
                $val = trim($current);
                if ($val === 'NULL') $result[] = null;
                else $result[] = $val;
                $current = '';
            } else {
                $current .= $c;
            }
        }
        $val = trim($current);
        if ($val === 'NULL') $result[] = null;
        else $result[] = $val;

        return $result;
    }
}
