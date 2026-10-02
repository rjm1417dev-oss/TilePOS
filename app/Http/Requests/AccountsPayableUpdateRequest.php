<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AccountsPayableUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $purchased = (float) ($this->purchased_price ?? 0);
        $paid = (float) ($this->paid_amount ?? 0);
        $this->merge(['remaining_amount' => max($purchased - $paid, 0)]);
    }

    public function rules(): array
    {
        return [
            'tile_id' => ['required', 'exists:tiles,id'],
            'stock_reference' => ['required', 'string', 'max:255'],
            'purchased_price' => ['required', 'numeric', 'min:0'],
            'paid_amount' => ['required', 'numeric', 'min:0'],
        ];
    }
}
