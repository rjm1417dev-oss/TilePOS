<?php

namespace App\Helpers;

class TileCalculatorHelper
{
    public static function convertToFeet($value, $unit): float
    {
        return match (strtolower($unit)) {
            'm', 'meters' => $value * 3.28084,
            'in', 'inches' => $value / 12,
            default => (float) $value,
        };
    }

    public static function convertTileToSquareFeet(string $sizeString, string $unit = 'inches'): float
    {
        if (! $sizeString) {
            return 0;
        }

        $parts = array_map('floatval', explode('x', strtolower($sizeString)));
        $length = $parts[0] ?? 0;
        $width = $parts[1] ?? 0;

        return $unit === 'inches'
            ? ($length / 12) * ($width / 12)
            : $length * $width;
    }

    public static function formatDate($date): string
    {
        if (! $date) {
            return 'N/A';
        }

        return date('F d, Y', strtotime($date));
    }

    public static function formatCurrency($amount): string
    {
        if ($amount === null) {
            return 'RS 0.00';
        }

        return 'RS '.number_format($amount, 2);
    }
}
