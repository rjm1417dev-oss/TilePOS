<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Http\Requests\SuperAdmin\StoreUserRequest;
use App\Http\Requests\SuperAdmin\UpdateUserRequest;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Activitylog\Models\Activity;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;
use Symfony\Component\HttpFoundation\StreamedResponse;

class UserController extends Controller
{
    public function index(Tenant $tenant): Response
    {
        $users = $tenant->users()
            ->with('roles')
            ->orderBy('name')
            ->get()
            ->map(fn (User $u) => [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'roles' => $u->roles->pluck('name')->toArray(),
            ]);

        return Inertia::render('super-admin/tenants/users/index', [
            'tenant' => ['id' => $tenant->id, 'business_name' => $tenant->business_name],
            'users' => $users,
        ]);
    }

    public function create(Tenant $tenant): Response
    {
        app()[PermissionRegistrar::class]->setPermissionsTeamId($tenant->id);
        $roles = Role::where('tenant_id', $tenant->id)->orderBy('name')->pluck('name', 'id');
        app()[PermissionRegistrar::class]->setPermissionsTeamId(null);

        return Inertia::render('super-admin/tenants/users/create', [
            'tenant' => ['id' => $tenant->id, 'business_name' => $tenant->business_name],
            'roles' => $roles,
        ]);
    }

    public function store(StoreUserRequest $request, Tenant $tenant): RedirectResponse
    {
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'tenant_id' => $tenant->id,
            'is_super_admin' => false,
        ]);

        if (! empty($request->role_ids)) {
            app()[PermissionRegistrar::class]->setPermissionsTeamId($tenant->id);
            $roles = Role::where('tenant_id', $tenant->id)->whereIn('id', $request->role_ids)->get();
            $user->syncRoles($roles);
            app()[PermissionRegistrar::class]->setPermissionsTeamId(null);
        }

        return redirect()
            ->route('super-admin.tenants.users.index', $tenant)
            ->with('success', 'User created successfully.');
    }

    public function edit(Tenant $tenant, User $user): Response
    {
        if ($user->tenant_id !== $tenant->id) {
            abort(404);
        }

        app()[PermissionRegistrar::class]->setPermissionsTeamId($tenant->id);
        $user->load('roles');
        $roles = Role::where('tenant_id', $tenant->id)->orderBy('name')->pluck('name', 'id');
        app()[PermissionRegistrar::class]->setPermissionsTeamId(null);

        return Inertia::render('super-admin/tenants/users/edit', [
            'tenant' => ['id' => $tenant->id, 'business_name' => $tenant->business_name],
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role_ids' => $user->roles->pluck('id')->toArray(),
            ],
            'roles' => $roles,
        ]);
    }

    public function update(UpdateUserRequest $request, Tenant $tenant, User $user): RedirectResponse
    {
        if ($user->tenant_id !== $tenant->id) {
            abort(404);
        }

        $data = [
            'name' => $request->name,
            'email' => $request->email,
        ];
        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }
        $user->update($data);

        app()[PermissionRegistrar::class]->setPermissionsTeamId($tenant->id);
        $roles = Role::where('tenant_id', $tenant->id)->whereIn('id', $request->role_ids ?? [])->get();
        $user->syncRoles($roles);
        app()[PermissionRegistrar::class]->setPermissionsTeamId(null);

        return redirect()
            ->route('super-admin.tenants.users.index', $tenant)
            ->with('success', 'User updated successfully.');
    }

    public function exportData(Tenant $tenant, User $user): StreamedResponse
    {
        if ($user->tenant_id !== $tenant->id) {
            abort(404);
        }

        $activities = Activity::where('causer_type', User::class)
            ->where('causer_id', $user->id)
            ->orderByDesc('created_at')
            ->get()
            ->map(fn ($a) => [
                'created_at' => $a->created_at?->toIso8601String(),
                'description' => $a->description,
                'event' => $a->event,
                'subject_type' => $a->subject_type,
                'subject_id' => $a->subject_id,
                'properties' => $a->properties?->toArray(),
            ]);

        $data = [
            'exported_at' => now()->toIso8601String(),
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'address' => $user->address,
                'created_at' => $user->created_at?->toIso8601String(),
            ],
            'activity_logs' => $activities->toArray(),
        ];

        $filename = 'user-data-'.$user->id.'-'.now()->format('Y-m-d').'.json';

        return response()->streamDownload(
            fn () => print json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE),
            $filename,
            ['Content-Type' => 'application/json'],
            'attachment'
        );
    }

    public function destroy(Tenant $tenant, User $user): RedirectResponse
    {
        if ($user->tenant_id !== $tenant->id) {
            abort(404);
        }

        Activity::where('causer_type', User::class)
            ->where('causer_id', $user->id)
            ->update(['causer_id' => null, 'causer_type' => null]);

        $user->syncRoles([]);
        $user->delete();

        return redirect()
            ->route('super-admin.tenants.users.index', $tenant)
            ->with('success', 'User and associated personal data deleted.');
    }
}
