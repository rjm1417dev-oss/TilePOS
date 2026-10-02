<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Http\Requests\SuperAdmin\StoreRoleRequest;
use App\Http\Requests\SuperAdmin\UpdateRoleRequest;
use App\Models\Tenant;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RoleController extends Controller
{
    public function index(Tenant $tenant): Response
    {
        app()[PermissionRegistrar::class]->setPermissionsTeamId($tenant->id);

        $roles = Role::where('tenant_id', $tenant->id)
            ->withCount('permissions')
            ->orderBy('name')
            ->get()
            ->map(fn (Role $r) => [
                'id' => $r->id,
                'name' => $r->name,
                'permissions_count' => $r->permissions_count,
            ]);

        app()[PermissionRegistrar::class]->setPermissionsTeamId(null);

        return Inertia::render('super-admin/tenants/roles/index', [
            'tenant' => ['id' => $tenant->id, 'business_name' => $tenant->business_name],
            'roles' => $roles,
        ]);
    }

    public function create(Tenant $tenant): Response
    {
        $permissions = Permission::orderBy('name')->pluck('name');

        return Inertia::render('super-admin/tenants/roles/create', [
            'tenant' => ['id' => $tenant->id, 'business_name' => $tenant->business_name],
            'permissions' => $permissions,
        ]);
    }

    public function store(StoreRoleRequest $request, Tenant $tenant): RedirectResponse
    {
        app()[PermissionRegistrar::class]->setPermissionsTeamId($tenant->id);

        $role = Role::create([
            'name' => $request->name,
            'guard_name' => 'web',
            'tenant_id' => $tenant->id,
        ]);
        $role->syncPermissions($request->permissions ?? []);

        app()[PermissionRegistrar::class]->setPermissionsTeamId(null);

        return redirect()
            ->route('super-admin.tenants.roles.index', $tenant)
            ->with('success', 'Role created successfully.');
    }

    public function edit(Tenant $tenant, Role $role): Response
    {
        if ($role->tenant_id !== $tenant->id) {
            abort(404);
        }

        app()[PermissionRegistrar::class]->setPermissionsTeamId($tenant->id);

        $role->load('permissions');
        $permissions = Permission::orderBy('name')->pluck('name');

        app()[PermissionRegistrar::class]->setPermissionsTeamId(null);

        return Inertia::render('super-admin/tenants/roles/edit', [
            'tenant' => ['id' => $tenant->id, 'business_name' => $tenant->business_name],
            'role' => [
                'id' => $role->id,
                'name' => $role->name,
                'permissions' => $role->permissions->pluck('name')->toArray(),
            ],
            'permissions' => $permissions,
        ]);
    }

    public function update(UpdateRoleRequest $request, Tenant $tenant, Role $role): RedirectResponse
    {
        if ($role->tenant_id !== $tenant->id) {
            abort(404);
        }

        $role->update(['name' => $request->name]);
        $role->syncPermissions($request->permissions ?? []);

        return redirect()
            ->route('super-admin.tenants.roles.index', $tenant)
            ->with('success', 'Role updated successfully.');
    }

    public function destroy(Tenant $tenant, Role $role): RedirectResponse
    {
        if ($role->tenant_id !== $tenant->id) {
            abort(404);
        }

        $role->delete();

        return redirect()
            ->route('super-admin.tenants.roles.index', $tenant)
            ->with('success', 'Role deleted successfully.');
    }
}
