<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ImpersonateController extends Controller
{
    /**
     * Start impersonating the first user of a tenant.
     */
    public function start(Request $request, Tenant $tenant): RedirectResponse
    {
        $user = $tenant->users()->first();

        if (! $user) {
            return back()->with('error', 'Cannot impersonate: tenant has no users.');
        }

        return $this->impersonate($request, $user);
    }

    /**
     * Start impersonating a specific user.
     */
    public function startUser(Request $request, Tenant $tenant, User $user): RedirectResponse
    {
        if ($user->tenant_id !== $tenant->id) {
            return back()->with('error', 'User does not belong to this tenant.');
        }

        return $this->impersonate($request, $user);
    }

    protected function impersonate(Request $request, User $user): RedirectResponse
    {
        $admin = $request->user();
        $request->session()->put('impersonator_id', $admin->id);

        activity()
            ->causedBy($admin)
            ->performedOn($user)
            ->event('impersonation_started')
            ->withProperties(['target_email' => $user->email])
            ->log("Started impersonating {$user->name} ({$user->email})");

        Auth::login($user);

        return redirect()->route('dashboard');
    }

    /**
     * Stop impersonation: logout, re-auth as the original admin, cleanup session.
     */
    public function stop(Request $request): RedirectResponse
    {
        if (! $request->session()->has('impersonator_id')) {
            return redirect()->route('dashboard');
        }

        $impersonatorId = $request->session()->pull('impersonator_id');
        $targetUser = $request->user();

        activity()
            ->causedBy(User::find($impersonatorId))
            ->performedOn($targetUser)
            ->event('impersonation_stopped')
            ->withProperties(['target_email' => $targetUser->email])
            ->log("Stopped impersonating {$targetUser->name} ({$targetUser->email})");

        Auth::logout();

        $impersonator = User::find($impersonatorId);
        if ($impersonator) {
            Auth::login($impersonator);
            $request->session()->regenerate();
        }

        return redirect()->route('super-admin.dashboard');
    }
}
