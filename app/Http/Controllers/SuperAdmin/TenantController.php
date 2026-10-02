<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Http\Requests\SuperAdmin\BulkTenantActionRequest;
use App\Http\Requests\SuperAdmin\StoreTenantRequest;
use App\Http\Requests\SuperAdmin\UpdateTenantRequest;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\PermissionRegistrar;

class TenantController extends Controller
{
    public function index(): Response
    {
        $tenants = Tenant::withCount(['quotations', 'users', 'tiles'])
            ->orderBy('business_name')
            ->get()
            ->map(fn (Tenant $t) => [
                'id' => $t->id,
                'business_name' => $t->business_name,
                'business_email' => $t->business_email,
                'business_phone' => $t->business_phone,
                'is_active' => $t->is_active,
                'trial_ends_at' => $t->trial_ends_at?->toISOString(),
                'subscription_status' => $t->subscription_status,
                'maintenance_mode' => $t->maintenance_mode,
                'quotations_count' => $t->quotations_count,
                'users_count' => $t->users_count,
                'tiles_count' => $t->tiles_count,
            ]);

        return Inertia::render('super-admin/tenants/index', [
            'tenants' => $tenants,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('super-admin/tenants/create');
    }

    public function store(StoreTenantRequest $request): RedirectResponse
    {
        $tenant = Tenant::create([
            'business_name' => $request->business_name,
            'business_email' => $request->business_email,
            'business_phone' => $request->business_phone,
            'business_address' => $request->business_address,
            'password' => Hash::make($request->password),
            'is_active' => true,
            'trial_ends_at' => $request->trial_ends_at,
            'subscription_status' => $request->subscription_status ?? 'active',
        ]);

        $user = User::create([
            'name' => $request->business_name,
            'email' => $request->business_email,
            'password' => Hash::make($request->password),
            'tenant_id' => $tenant->id,
            'is_super_admin' => false,
        ]);

        app()[PermissionRegistrar::class]->setPermissionsTeamId($tenant->id);

        $adminRole = \Spatie\Permission\Models\Role::firstOrCreate(
            [
                'name' => 'Admin',
                'guard_name' => 'web',
                'tenant_id' => $tenant->id,
            ]
        );

        $adminRole->syncPermissions(\App\Support\Permissions::all());

        $user->assignRole($adminRole);

        activity()
            ->performedOn($tenant)
            ->event('created')
            ->log("Created tenant: {$tenant->business_name}");

        return redirect()->route('super-admin.tenants.index')
            ->with('success', 'Tenant created successfully.');
    }

    public function show(Tenant $tenant): Response
    {
        $tenant->loadCount(['quotations', 'users', 'tiles', 'customers']);
        $users = $tenant->users()->get(['id', 'name', 'email']);

        return Inertia::render('super-admin/tenants/show', [
            'tenant' => [
                'id' => $tenant->id,
                'business_name' => $tenant->business_name,
                'business_email' => $tenant->business_email,
                'business_phone' => $tenant->business_phone,
                'business_address' => $tenant->business_address,
                'is_active' => $tenant->is_active,
                'trial_ends_at' => $tenant->trial_ends_at?->toISOString(),
                'subscription_status' => $tenant->subscription_status,
                'maintenance_mode' => $tenant->maintenance_mode,
                'maintenance_message' => $tenant->maintenance_message,
                'created_at' => $tenant->created_at->toISOString(),
                'quotations_count' => $tenant->quotations_count,
                'users_count' => $tenant->users_count,
                'tiles_count' => $tenant->tiles_count,
                'customers_count' => $tenant->customers_count,
            ],
            'users' => $users,
        ]);
    }

    public function edit(Tenant $tenant): Response
    {
        return Inertia::render('super-admin/tenants/edit', [
            'tenant' => [
                'id' => $tenant->id,
                'business_name' => $tenant->business_name,
                'business_email' => $tenant->business_email,
                'business_phone' => $tenant->business_phone,
                'business_address' => $tenant->business_address,
                'is_active' => $tenant->is_active,
                'trial_ends_at' => $tenant->trial_ends_at?->format('Y-m-d'),
                'subscription_status' => $tenant->subscription_status,
                'maintenance_mode' => $tenant->maintenance_mode,
                'maintenance_message' => $tenant->maintenance_message,
            ],
        ]);
    }

    public function update(UpdateTenantRequest $request, Tenant $tenant): RedirectResponse
    {
        $tenant->update([
            'business_name' => $request->business_name,
            'business_email' => $request->business_email,
            'business_phone' => $request->business_phone,
            'business_address' => $request->business_address,
            'is_active' => $request->boolean('is_active'),
            'trial_ends_at' => $request->trial_ends_at,
            'subscription_status' => $request->subscription_status ?? 'active',
            'maintenance_mode' => $request->boolean('maintenance_mode'),
            'maintenance_message' => $request->maintenance_message,
        ]);

        activity()
            ->performedOn($tenant)
            ->event('updated')
            ->log("Updated tenant: {$tenant->business_name}");

        $owner = $tenant->users()->first();
        if ($owner) {
            $owner->update([
                'name' => $request->business_name,
                'email' => $request->business_email,
            ]);
            if ($request->filled('password')) {
                $owner->update(['password' => Hash::make($request->password)]);
            }
        }

        return redirect()->route('super-admin.tenants.index')
            ->with('success', 'Tenant updated successfully.');
    }

    public function destroy(Tenant $tenant): RedirectResponse
    {
        $name = $tenant->business_name;
        $tenant->delete();

        activity()
            ->event('deleted')
            ->withProperties(['tenant_name' => $name])
            ->log("Deleted tenant: {$name}");

        return redirect()->route('super-admin.tenants.index')
            ->with('success', 'Tenant deleted successfully.');
    }

    public function toggleActive(Tenant $tenant): RedirectResponse
    {
        $tenant->update(['is_active' => ! $tenant->is_active]);
        $status = $tenant->is_active ? 'activated' : 'deactivated';

        activity()
            ->performedOn($tenant)
            ->event('toggled')
            ->log("{$status} tenant: {$tenant->business_name}");

        return back()->with('success', 'Tenant status updated.');
    }

    public function bulkActivate(BulkTenantActionRequest $request): RedirectResponse
    {
        $count = Tenant::whereIn('id', $request->input('tenant_ids'))
            ->where('is_active', false)
            ->update(['is_active' => true]);

        return back()->with('success', "Activated {$count} tenant(s).");
    }

    public function bulkDeactivate(BulkTenantActionRequest $request): RedirectResponse
    {
        $count = Tenant::whereIn('id', $request->input('tenant_ids'))
            ->where('is_active', true)
            ->update(['is_active' => false]);

        return back()->with('success', "Deactivated {$count} tenant(s).");
    }
}
