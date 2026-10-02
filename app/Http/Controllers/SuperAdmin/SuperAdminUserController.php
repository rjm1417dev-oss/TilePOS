<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Http\Requests\SuperAdmin\StoreSuperAdminRequest;
use App\Http\Requests\SuperAdmin\UpdateSuperAdminRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class SuperAdminUserController extends Controller
{
    public function index(): Response
    {
        $users = User::where('is_super_admin', true)
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'created_at'])
            ->map(fn (User $u) => [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'created_at' => $u->created_at?->toIso8601String(),
            ]);

        return Inertia::render('super-admin/super-admins/index', [
            'users' => $users,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('super-admin/super-admins/create');
    }

    public function store(StoreSuperAdminRequest $request): RedirectResponse
    {
        User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'tenant_id' => null,
            'is_super_admin' => true,
        ]);

        return redirect()
            ->route('super-admin.super-admins.index')
            ->with('success', 'Super admin created successfully.');
    }

    public function edit(User $super_admin_user): Response
    {
        if (! $super_admin_user->is_super_admin) {
            abort(404);
        }

        return Inertia::render('super-admin/super-admins/edit', [
            'user' => [
                'id' => $super_admin_user->id,
                'name' => $super_admin_user->name,
                'email' => $super_admin_user->email,
            ],
        ]);
    }

    public function update(UpdateSuperAdminRequest $request, User $super_admin_user): RedirectResponse
    {
        if (! $super_admin_user->is_super_admin) {
            abort(404);
        }

        $data = [
            'name' => $request->name,
            'email' => $request->email,
        ];
        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }
        $super_admin_user->update($data);

        return redirect()
            ->route('super-admin.super-admins.index')
            ->with('success', 'Super admin updated successfully.');
    }

    public function destroy(User $super_admin_user): RedirectResponse
    {
        if (! $super_admin_user->is_super_admin) {
            abort(404);
        }

        if ($super_admin_user->id === request()->user()?->id) {
            return redirect()
                ->route('super-admin.super-admins.index')
                ->with('error', 'You cannot delete your own account.');
        }

        $super_admin_user->delete();

        return redirect()
            ->route('super-admin.super-admins.index')
            ->with('success', 'Super admin deleted successfully.');
    }
}
