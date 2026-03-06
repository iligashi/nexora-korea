<?php

namespace Database\Seeders;

use App\Models\CarBrand;
use Illuminate\Database\Seeder;

class CarBrandSeeder extends Seeder
{
    public function run(): void
    {
        $brands = [
            ['api_name' => '현대',           'display_name' => 'Hyundai'],
            ['api_name' => '기아',           'display_name' => 'Kia'],
            ['api_name' => '제네시스',       'display_name' => 'Genesis'],
            ['api_name' => '쉐보레(GM대우)', 'display_name' => 'Chevrolet'],
            ['api_name' => '르노코리아(삼성_)', 'display_name' => 'Renault Korea'],
            ['api_name' => 'KG모빌리티(쌍용)', 'display_name' => 'KG Mobility'],
            ['api_name' => '벤츠',           'display_name' => 'Mercedes-Benz'],
            ['api_name' => 'BMW',            'display_name' => 'BMW'],
            ['api_name' => '아우디',         'display_name' => 'Audi'],
            ['api_name' => '폭스바겐',       'display_name' => 'Volkswagen'],
            ['api_name' => '볼보',           'display_name' => 'Volvo'],
            ['api_name' => '포르쉐',         'display_name' => 'Porsche'],
            ['api_name' => '렉서스',         'display_name' => 'Lexus'],
            ['api_name' => '토요타',         'display_name' => 'Toyota'],
            ['api_name' => '혼다',           'display_name' => 'Honda'],
        ];

        foreach ($brands as $brand) {
            CarBrand::updateOrCreate(
                ['api_name' => $brand['api_name']],
                array_merge($brand, ['is_active' => true])
            );
        }
    }
}
