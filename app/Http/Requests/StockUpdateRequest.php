<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StockUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'new_stock' => ['nullable', 'integer', 'min:0'],
            'minimum_stock_level' => ['required', 'integer', 'min:0'],
            'supplier_id' => ['required', 'exists:suppliers,id'],
            'stock_location' => ['required', 'string', 'max:255'],
            'purchased_price' => ['nullable', 'numeric', 'min:0'],
            'paid_amount' => ['nullable', 'numeric', 'min:0'],
        ];
    }
}
