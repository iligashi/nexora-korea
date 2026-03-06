<?php

namespace App\Services;

class ModelMapper
{
    /**
     * Maps Korean car model names to their English equivalents.
     * Falls back to the original name if no mapping is found.
     */
    private static array $modelMap = [
        // Hyundai
        '아반떼'    => 'Elantra',
        '소나타'    => 'Sonata',
        '그랜저'    => 'Grandeur',
        '투싼'      => 'Tucson',
        '싼타페'    => 'Santa Fe',
        '팰리세이드' => 'Palisade',
        '아이오닉'  => 'IONIQ',
        '아이오닉5' => 'IONIQ 5',
        '아이오닉6' => 'IONIQ 6',
        '코나'      => 'Kona',
        '넥쏘'      => 'Nexo',
        '스타렉스'  => 'Staria',
        '스타리아'  => 'Staria',
        '캐스퍼'    => 'Casper',
        '베뉴'      => 'Venue',
        '포터'      => 'Porter',

        // Kia
        'K3'        => 'K3',
        'K5'        => 'K5',
        'K7'        => 'K7',
        'K8'        => 'K8',
        'K9'        => 'K9',
        '스포티지'  => 'Sportage',
        '쏘렌토'    => 'Sorento',
        '텔루라이드' => 'Telluride',
        '카니발'    => 'Carnival',
        '스팅어'    => 'Stinger',
        '니로'      => 'Niro',
        'EV6'       => 'EV6',
        'EV9'       => 'EV9',
        '모닝'      => 'Morning (Picanto)',
        '레이'      => 'Ray',
        '봉고'      => 'Bongo',

        // Genesis
        'G70'       => 'G70',
        'G80'       => 'G80',
        'G90'       => 'G90',
        'GV70'      => 'GV70',
        'GV80'      => 'GV80',
        'GV60'      => 'GV60',

        // Renault Korea
        'XM3'       => 'XM3',
        'QM6'       => 'QM6',
        'SM6'       => 'SM6',
        '조에'      => 'Zoe',
        '마스터'    => 'Master',

        // KG Mobility (SsangYong)
        '티볼리'    => 'Tivoli',
        '렉스턴'    => 'Rexton',
        '코란도'    => 'Korando',
        '토레스'    => 'Torres',
        '무쏘'      => 'Musso',
    ];

    /**
     * Get the English model name for a given Korean model name.
     *
     * @param string $koreanModel
     * @param string|null $brandName
     * @return string
     */
    public static function getEnglishModelName(string $koreanModel, ?string $brandName = null): string
    {
        // Direct map lookup
        if (isset(self::$modelMap[$koreanModel])) {
            return self::$modelMap[$koreanModel];
        }

        // Partial match: try to find a key that the korean model starts with
        foreach (self::$modelMap as $korean => $english) {
            if (str_starts_with($koreanModel, $korean)) {
                return $english;
            }
        }

        // Return original if no mapping found
        return $koreanModel;
    }
}
