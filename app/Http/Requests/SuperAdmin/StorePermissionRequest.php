<?php

namespace App\Http\Requests\SuperAdmin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePermissionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isSuperAdmin() ?? false;
    }

    /**
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => [
                'required', 'string', 'max:255', 'regex:/^[a-z0-9_.]+$/',
                Rule::unique('permissions')->where('guard_name', 'web'),
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'name.regex' => 'Permission name must use lowercase letters, numbers, underscores and dots only (e.g. module.action).',
        ];
    }
}
