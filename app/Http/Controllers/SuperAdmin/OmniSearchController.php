<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OmniSearchController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $query = $request->input('q', '');
        $query = trim($query);
        if (strlen($query) < 2) {
            return response()->json(['results' => []]);
        }

        $tenants = Tenant::where(function ($q) use ($query) {
            $q->where('business_name', 'like', "%{$query}%")
                ->orWhere('business_email', 'like', "%{$query}%")
                ->orWhere('business_phone', 'like', "%{$query}%");
        })
            ->limit(8)
            ->get(['id', 'business_name', 'business_email']);

        $actions = [];
        $q = strtolower($query);
        if (str_contains($q, 'create') || str_contains($q, 'tenant')) {
            $actions[] = ['type' => 'action', 'label' => 'Create Tenant', 'url' => route('super-admin.tenants.create')];
        }
        if (str_contains($q, 'setting') || str_contains($q, 'config')) {
            $actions[] = ['type' => 'action', 'label' => 'Settings', 'url' => route('super-admin.settings.index')];
        }
        if (str_contains($q, 'log') || str_contains($q, 'dashboard')) {
            $actions[] = ['type' => 'action', 'label' => 'Dashboard', 'url' => route('super-admin.dashboard')];
        }

        $results = $tenants->map(fn ($t) => [
            'type' => 'tenant',
            'id' => $t->id,
            'label' => $t->business_name,
            'subtitle' => $t->business_email,
            'url' => route('super-admin.tenants.show', $t),
        ])->toArray();

        return response()->json([
            'results' => array_merge($actions, $results),
        ]);
    }
}
