<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StockStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'tile_id' => ['required', 'exists:tiles,id'],
            'supplier_id' => ['required', 'exists:suppliers,id'],
            'new_stock' => ['required', 'integer', 'min:0'],
            'minimum_stock_level' => ['required', 'integer', 'min:0'],
            'stock_location' => ['required', 'string', 'max:255'],
            'purchased_price' => ['required', 'numeric', 'min:0'],
            'paid_amount' => ['required', 'numeric', 'min:0'],
        ];
    }
}
