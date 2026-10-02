<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Http\Requests\SuperAdmin\StorePermissionRequest;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;

class PermissionController extends Controller
{
    public function index(): Response
    {
        $permissions = Permission::orderBy('name')->get(['id', 'name']);

        return Inertia::render('super-admin/permissions/index', [
            'permissions' => $permissions,
        ]);
    }

    public function store(StorePermissionRequest $request): RedirectResponse
    {
        Permission::firstOrCreate([
            'name' => $request->name,
            'guard_name' => 'web',
        ]);

        return redirect()
            ->route('super-admin.permissions.index')
            ->with('success', 'Permission created successfully.');
    }

    public function destroy(Permission $permission): RedirectResponse
    {
        $permission->delete();

        return redirect()
            ->route('super-admin.permissions.index')
            ->with('success', 'Permission deleted successfully.');
    }
}
