<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ImportStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('import.create');
    }

    /**
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'type' => ['required', Rule::in(['customers', 'suppliers', 'products'])],
            'file' => ['required', 'file', 'mimes:csv,txt', 'max:2048'],
        ];
    }

    public function messages(): array
    {
        return [
            'file.mimes' => 'The file must be a CSV file.',
            'file.max' => 'The file may not be larger than 2MB.',
        ];
    }
}
