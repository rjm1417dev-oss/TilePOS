<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileDeleteRequest;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Show the user's profile settings page.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user();
        $profileUser = [
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone ?? $user->tenant?->business_phone ?? '',
            'address' => $user->address ?? $user->tenant?->business_address ?? '',
        ];

        return Inertia::render('settings/profile', [
            'mustVerifyEmail' => $user instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
            'profileUser' => $profileUser,
            'tenantLogo' => $user->tenant?->logo,
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();

        $user->fill($request->safe()->only(['name', 'email', 'phone', 'address']));

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        if ($request->hasFile('profile_image') && $user->isSuperAdmin()) {
            $user->profile_image = $this->imageToBase64($request->file('profile_image'));
        }

        $user->save();

        if (! $user->isSuperAdmin() && $request->hasFile('logo')) {
            $tenant = $user->tenant;
            if ($tenant) {
                $tenant->logo = $this->imageToBase64($request->file('logo'));
                $tenant->save();
            }
        }

        return $user->isSuperAdmin()
            ? redirect()->route('super-admin.settings.profile')
            : to_route('profile.edit');
    }

    /**
     * Convert an uploaded image to a base64 data URL.
     */
    private function imageToBase64(UploadedFile $file): string
    {
        $mime = $file->getMimeType();
        $data = base64_encode(file_get_contents($file->path()));

        return "data:{$mime};base64,{$data}";
    }

    /**
     * Delete the user's profile.
     */
    public function destroy(ProfileDeleteRequest $request): RedirectResponse
    {
        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
