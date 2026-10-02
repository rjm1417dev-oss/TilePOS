<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Receipt Cashier Label
    |--------------------------------------------------------------------------
    | Label shown on receipt for cashier (e.g. "POS" or leave empty).
    */
    'cashier_label' => env('RECEIPT_CASHIER_LABEL', 'POS'),

    /*
    |--------------------------------------------------------------------------
    | Receipt Cell Phone
    |--------------------------------------------------------------------------
    | Optional second phone number for receipt header (Cell:). If null, only
    | tenant business_phone is shown as Ph.
    */
    'cell_phone' => env('RECEIPT_CELL_PHONE'),

    /*
    |--------------------------------------------------------------------------
    | Software Provider Footer
    |--------------------------------------------------------------------------
    | Text at bottom of receipt (e.g. "Software Provided By. IPCS, Rwp. 0332-5173356").
    */
    'software_provider' => env('RECEIPT_SOFTWARE_PROVIDER', 'Software Provided By. IPCS, Rwp. 0332-5173356'),

];
