<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class UserController extends Controller
{
    public function index(Request $request): \Inertia\Response|RedirectResponse
    {
        $this->authorize('viewAny', User::class);

        $tenantId = Auth::user()->tenant_id;
        if (! $tenantId) {
            return redirect()->route('super-admin.dashboard');
        }

        $users = User::where('tenant_id', $tenantId)
            ->with('roles')
            ->when($request->search, fn ($q) => $q->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                    ->orWhere('email', 'like', "%{$request->search}%");
            }))
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString()
            ->through(fn (User $u) => [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'roles' => $u->roles->pluck('name')->toArray(),
            ]);

        return Inertia::render('users/index', [
            'users' => $users,
            'filters' => $request->only(['search']),
        ]);
    }

    public function create(): \Inertia\Response|RedirectResponse
    {
        $this->authorize('create', User::class);

        $tenantId = Auth::user()->tenant_id;
        if (! $tenantId) {
            return redirect()->route('super-admin.dashboard');
        }
        app()[PermissionRegistrar::class]->setPermissionsTeamId($tenantId);
        $roles = Role::where('tenant_id', $tenantId)->orderBy('name')->pluck('name', 'id');
        app()[PermissionRegistrar::class]->setPermissionsTeamId(null);

        return Inertia::render('users/create', [
            'roles' => $roles,
        ]);
    }

    public function store(StoreUserRequest $request): RedirectResponse
    {
        $this->authorize('create', User::class);

        $tenantId = Auth::user()->tenant_id;
        if (! $tenantId) {
            return redirect()->route('super-admin.dashboard');
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'tenant_id' => $tenantId,
            'is_super_admin' => false,
        ]);

        if (! empty($request->role_ids)) {
            app()[PermissionRegistrar::class]->setPermissionsTeamId($tenantId);
            $roles = Role::where('tenant_id', $tenantId)->whereIn('id', $request->role_ids)->get();
            $user->syncRoles($roles);
            app()[PermissionRegistrar::class]->setPermissionsTeamId(null);
        }

        return redirect()->route('users.index')->with('success', 'User created successfully.');
    }

    public function edit(User $user): Response
    {
        $this->authorize('update', $user);

        if ($user->tenant_id !== Auth::user()->tenant_id) {
            abort(404);
        }

        app()[PermissionRegistrar::class]->setPermissionsTeamId($user->tenant_id);
        $user->load('roles');
        $roles = Role::where('tenant_id', $user->tenant_id)->orderBy('name')->pluck('name', 'id');
        app()[PermissionRegistrar::class]->setPermissionsTeamId(null);

        return Inertia::render('users/edit', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role_ids' => $user->roles->pluck('id')->toArray(),
            ],
            'roles' => $roles,
        ]);
    }

    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        $this->authorize('update', $user);

        if ($user->tenant_id !== Auth::user()->tenant_id) {
            abort(404);
        }

        $data = ['name' => $request->name, 'email' => $request->email];
        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }
        $user->update($data);

        app()[PermissionRegistrar::class]->setPermissionsTeamId($user->tenant_id);
        $roles = Role::where('tenant_id', $user->tenant_id)->whereIn('id', $request->role_ids ?? [])->get();
        $user->syncRoles($roles);
        app()[PermissionRegistrar::class]->setPermissionsTeamId(null);

        return redirect()->route('users.index')->with('success', 'User updated successfully.');
    }

    public function destroy(User $user): RedirectResponse
    {
        $this->authorize('delete', $user);

        if ($user->tenant_id !== Auth::user()->tenant_id) {
            abort(404);
        }

        $user->delete();

        return redirect()->route('users.index')->with('success', 'User deleted successfully.');
    }
}
