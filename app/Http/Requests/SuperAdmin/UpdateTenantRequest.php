<?php

namespace App\Http\Requests\SuperAdmin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTenantRequest extends FormRequest
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
        $tenant = $this->route('tenant');
        $owner = $tenant->users()->first();

        $emailRules = [
            'required',
            'string',
            'email',
            'max:255',
            'unique:tenants,business_email,'.$tenant->id,
        ];
        if ($owner) {
            $emailRules[] = Rule::unique('users', 'email')->ignore($owner->id);
        } else {
            $emailRules[] = 'unique:users,email';
        }

        return [
            'business_name' => ['required', 'string', 'max:255'],
            'business_email' => $emailRules,
            'business_phone' => ['nullable', 'string', 'max:20'],
            'business_address' => ['nullable', 'string', 'max:500'],
            'is_active' => ['boolean'],
            'trial_ends_at' => ['nullable', 'date'],
            'subscription_status' => ['nullable', 'string', 'in:active,trial,cancelled,expired'],
            'maintenance_mode' => ['boolean'],
            'maintenance_message' => ['nullable', 'string', 'max:1000'],
            'password' => ['nullable', 'confirmed', \Illuminate\Validation\Rules\Password::defaults()],
        ];
    }
}
