<?php

namespace App\Http\Requests\SuperAdmin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class StoreTenantRequest extends FormRequest
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
            'business_name' => ['required', 'string', 'max:255'],
            'business_email' => ['required', 'string', 'email', 'max:255', 'unique:tenants,business_email', 'unique:users,email'],
            'business_phone' => ['nullable', 'string', 'max:20'],
            'business_address' => ['nullable', 'string', 'max:500'],
            'password' => ['required', 'confirmed', Password::defaults()],
            'trial_ends_at' => ['nullable', 'date'],
            'subscription_status' => ['nullable', 'string', 'in:active,trial,cancelled,expired'],
        ];
    }
}
