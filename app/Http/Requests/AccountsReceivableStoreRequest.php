<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AccountsReceivableStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $total = (float) ($this->total_amount ?? 0);
        $paid = (float) ($this->paid_amount ?? 0);
        $this->merge(['remaining_amount' => max($total - $paid, 0)]);
    }

    public function rules(): array
    {
        return [
            'tile_id' => ['nullable', 'exists:tiles,id'],
            'tile_code_display' => ['nullable', 'string', 'max:255'],
            'customer_name' => ['required', 'string', 'max:255'],
            'customer_phone' => ['nullable', 'string', 'max:255'],
            'total_amount' => ['required', 'numeric', 'min:0'],
            'paid_amount' => ['required', 'numeric', 'min:0'],
        ];
    }
}
