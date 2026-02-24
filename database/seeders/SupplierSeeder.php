<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SupplierSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $sql = "INSERT IGNORE INTO `suppliers` (`id`, `proprietor_name`, `company_name`, `phone`, `email`, `whatsapp`, `country`, `address`, `image`, `created_at`, `updated_at`) VALUES
        (1, 'Md. Sazzad Hossain', 'Accuiel Pharma', '01909-444888', 'sazzad.ph47@gmail.com', '01909-444888', 'Bangladesh', 'Chottogram', NULL, '2025-05-29 01:39:28', '2025-05-29 01:45:38'),
        (2, 'Limon', 'Abyaad Agrocare', '01718-421636', 'limonpharma@gmail.com', '01718-421636', 'Bngladesh', 'Dhaka', NULL, '2025-05-29 01:49:08', '2025-05-29 01:49:08'),
        (3, 'Md. Zahirul Haque', 'Ina Agro Biotech', '01714-092753', 'zahirinaagro2021@gmail.com', '01714-092753', 'Bangladesh', 'Mymensingh', NULL, '2025-05-29 01:53:18', '2025-05-29 01:53:18'),
        (4, 'Md. Minhazul Abedin Nanno', 'Linkage Interational Pvt.Ltd', '01616-277232', 'linkageiltd@gmail.com', '01616-277232', 'Bangladesh', 'Chattogram', NULL, '2025-05-29 02:04:43', '2025-05-29 02:04:43'),
        (5, 'Md. Rubel Rana', 'Optics Pharma Ltd', '01722-112461', 'opticspharma1472@gmail.com', '01722-112461', 'Bangladesh', 'Bogura Sadar', NULL, '2025-05-29 02:06:56', '2025-05-29 02:06:56'),
        (6, 'Md. Mamunur Rashid', 'S.M Fish Agrovet Ltd.', '01768-873898', 'smfishagrovet.bogra@gmail.com', '01768-873898', 'Bangladesh', 'Bogura', NULL, '2025-05-29 02:09:17', '2025-05-29 02:09:17'),
        (7, 'Md. Munjur Rahman', 'Curex Agro Pharma Ltd.', '+88027193330', NULL, 'N/A', 'Bangladesh', 'Dhaka', NULL, '2025-05-29 02:11:36', '2025-05-29 02:11:36'),
        (8, 'Mr. Vinod Kumar', 'Star vet Remedies', '+0919119083220', NULL, '+0919119083220', 'India', 'Saharanpur', NULL, '2025-05-29 02:20:20', '2025-05-29 02:20:20'),
        (9, 'Dr. Sarwor Jahan', 'Safe Bio Produc.Ltd', '01711-054728', NULL, '01711-054728', 'Bangladesh', 'Gazipur, Khaka', NULL, '2025-09-10 05:40:16', '2025-09-10 05:40:16'),
        (10, 'Md. Shamim Hossain', 'Radiant Agrovet', '01738-181354', NULL, '01738-181354', 'Bangladesh', 'Dhaka, Mohammadpur', NULL, '2025-10-01 21:55:48', '2025-10-01 21:55:48');";

        DB::unprepared($sql);

        $this->command->info('Suppliers imported successfully!');
    }
}
