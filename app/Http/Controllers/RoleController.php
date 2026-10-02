<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreRoleRequest;
use App\Http\Requests\UpdateRoleRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RoleController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Role::class);

        $tenantId = Auth::user()->tenant_id;
        if (! $tenantId) {
            return redirect()->route('super-admin.dashboard');
        }
        app()[PermissionRegistrar::class]->setPermissionsTeamId($tenantId);

        $roles = Role::where('tenant_id', $tenantId)
            ->withCount('permissions')
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString();

        app()[PermissionRegistrar::class]->setPermissionsTeamId(null);

        return Inertia::render('roles/index', [
            'roles' => $roles,
            'filters' => $request->only(['search']),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Role::class);

        if (! Auth::user()->tenant_id) {
            return redirect()->route('super-admin.dashboard');
        }

        $permissions = Permission::orderBy('name')->pluck('name');

        return Inertia::render('roles/create', [
            'permissions' => $permissions,
        ]);
    }

    public function store(StoreRoleRequest $request): RedirectResponse
    {
        $this->authorize('create', Role::class);

        $tenantId = Auth::user()->tenant_id;
        if (! $tenantId) {
            return redirect()->route('super-admin.dashboard');
        }
        app()[PermissionRegistrar::class]->setPermissionsTeamId($tenantId);

        $role = Role::create([
            'name' => $request->name,
            'guard_name' => 'web',
            'tenant_id' => $tenantId,
        ]);
        $role->syncPermissions($request->permissions ?? []);

        app()[PermissionRegistrar::class]->setPermissionsTeamId(null);

        return redirect()->route('roles.index')->with('success', 'Role created successfully.');
    }

    public function edit(Role $role): Response
    {
        $this->authorize('update', $role);

        if ($role->tenant_id !== Auth::user()->tenant_id) {
            abort(404);
        }

        app()[PermissionRegistrar::class]->setPermissionsTeamId($role->tenant_id);
        $role->load('permissions');
        $permissions = Permission::orderBy('name')->pluck('name');
        app()[PermissionRegistrar::class]->setPermissionsTeamId(null);

        return Inertia::render('roles/edit', [
            'role' => [
                'id' => $role->id,
                'name' => $role->name,
                'permissions' => $role->permissions->pluck('name')->toArray(),
            ],
            'permissions' => $permissions,
        ]);
    }

    public function update(UpdateRoleRequest $request, Role $role): RedirectResponse
    {
        $this->authorize('update', $role);

        if ($role->tenant_id !== Auth::user()->tenant_id) {
            abort(404);
        }

        $role->update(['name' => $request->name]);
        $role->syncPermissions($request->permissions ?? []);

        return redirect()->route('roles.index')->with('success', 'Role updated successfully.');
    }

    public function destroy(Role $role): RedirectResponse
    {
        $this->authorize('delete', $role);

        if ($role->tenant_id !== Auth::user()->tenant_id) {
            abort(404);
        }

        $role->delete();

        return redirect()->route('roles.index')->with('success', 'Role deleted successfully.');
    }
}
