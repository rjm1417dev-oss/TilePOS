<?php

namespace App\Http\Controllers;

use App\Models\FeatureFlag;
use App\Models\Tenant;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\PermissionRegistrar;

class TenantRegistrationController extends Controller
{
    public function showRegistrationForm(): Response
    {
        return Inertia::render('auth/tenant-register', [
            'appName' => config('app.name'),
        ]);
    }

    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'business_name' => ['required', 'string', 'max:255'],
            'business_email' => ['required', 'string', 'email', 'max:255', 'unique:tenants,business_email', 'unique:users,email'],
            'business_phone' => ['nullable', 'string', 'max:20'],
            'business_address' => ['nullable', 'string', 'max:500'],
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        if ($validator->fails()) {
            return back()
                ->withErrors($validator)
                ->withInput()
                ->with('error', 'Please correct the errors below.');
        }

        $user = null;

        try {
            $tenant = Tenant::create([
                'business_name' => $request->business_name,
                'business_email' => $request->business_email,
                'business_phone' => $request->business_phone,
                'business_address' => $request->business_address,
                'password' => Hash::make($request->password),
                'is_active' => true,
            ]);

            $user = User::create([
                'name' => $request->business_name,
                'email' => $request->business_email,
                'phone' => $request->business_phone,
                'address' => $request->business_address,
                'password' => Hash::make($request->password),
                'tenant_id' => $tenant->id,
                'is_super_admin' => false,
            ]);

            (app()->make(PermissionRegistrar::class))->setPermissionsTeamId($tenant->id);

            (new PermissionSeeder)->run();

            $adminRole = \Spatie\Permission\Models\Role::create([
                'name' => 'Admin',
                'guard_name' => 'web',
                'tenant_id' => $tenant->id,
            ]);

            $adminRole->syncPermissions(\App\Support\Permissions::all());

            $user->assignRole($adminRole);

            foreach (['tiles', 'quotations', 'tile_returns', 'accounts_payable', 'accounts_receivable'] as $key) {
                FeatureFlag::firstOrCreate(
                    ['key' => $key, 'tenant_id' => $tenant->id],
                    ['enabled' => true]
                );
            }

            (app()->make(PermissionRegistrar::class))->setPermissionsTeamId(null);
            (app()->make(PermissionRegistrar::class))->forgetCachedPermissions();

            $request->session()->flash('status', 'Registration successful! Sign in with your business email and password.');

            return redirect()->route('login', [], 303);
        } catch (\Exception $e) {
            if ($user !== null) {
                $request->session()->flash('status', 'Registration successful! Sign in with your business email and password.');

                return redirect()->route('login', [], 303);
            }

            return back()
                ->withInput()
                ->with('error', 'Registration failed. Please try again.');
        }
    }
}
