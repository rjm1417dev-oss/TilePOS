<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Activitylog\Models\Activity;

class ActivityLogsController extends Controller
{
    public function index(Request $request): Response
    {
        $tenantId = $request->filled('tenant_id') ? (int) $request->tenant_id : null;
        $userId = $request->filled('user_id') ? (int) $request->user_id : null;
        $dateFrom = $request->filled('date_from') ? Carbon::parse($request->date_from)->startOfDay() : null;
        $dateTo = $request->filled('date_to') ? Carbon::parse($request->date_to)->endOfDay() : null;
        $subjectType = $request->filled('subject_type') ? $request->string('subject_type')->toString() : null;
        $event = $request->filled('event') ? $request->string('event')->toString() : null;

        $query = Activity::query()
            ->with('causer:id,name,email,tenant_id')
            ->orderByDesc('created_at')
            ->limit(500);

        if ($tenantId) {
            $query->where(function ($q) use ($tenantId) {
                $q->where(function ($q2) use ($tenantId) {
                    $q2->where('causer_type', User::class)
                        ->whereIn('causer_id', User::where('tenant_id', $tenantId)->pluck('id'));
                })->orWhere(function ($q2) use ($tenantId) {
                    $q2->where('subject_type', Tenant::class)
                        ->where('subject_id', $tenantId);
                });
            });
        }

        if ($userId) {
            $query->where('causer_type', User::class)
                ->where('causer_id', $userId);
        }

        if ($dateFrom) {
            $query->where('created_at', '>=', $dateFrom);
        }
        if ($dateTo) {
            $query->where('created_at', '<=', $dateTo);
        }

        if ($subjectType) {
            $query->where('subject_type', 'like', '%\\'.$subjectType);
        }

        if ($event) {
            $query->where('event', $event);
        }

        $activities = $query->get();

        $tenants = Tenant::orderBy('business_name')->pluck('business_name', 'id');

        $usersQuery = User::query()->whereNotNull('tenant_id')->orderBy('name');
        if ($tenantId) {
            $usersQuery->where('tenant_id', $tenantId);
        } else {
            $usersQuery->whereIn(
                'id',
                Activity::where('causer_type', User::class)->distinct()->pluck('causer_id')
            );
        }
        $users = $usersQuery->get(['id', 'name', 'email'])
            ->mapWithKeys(fn (User $u) => [$u->id => $u->name.' ('.$u->email.')']);

        $subjectTypes = Activity::query()
            ->whereNotNull('subject_type')
            ->distinct()
            ->pluck('subject_type')
            ->map(fn ($t) => class_basename($t))
            ->unique()
            ->sort()
            ->values();

        $events = Activity::query()
            ->whereNotNull('event')
            ->distinct()
            ->pluck('event')
            ->sort()
            ->values();

        $logs = $activities->map(function (Activity $log) use ($tenants) {
            $props = $log->properties;
            $tenantId = null;
            if ($props) {
                $attrs = $props->get('attributes') ?? $props->get('old');
                $tenantId = is_array($attrs) ? ($attrs['tenant_id'] ?? null) : null;
            }
            $tenantId ??= $log->causer?->tenant_id;
            if (! $tenantId && $log->subject_type && class_basename($log->subject_type) === 'Tenant') {
                $tenantId = $log->subject_id;
            }

            return [
                'id' => $log->id,
                'description' => $log->description,
                'event' => $log->event,
                'subject_type' => $log->subject_type ? class_basename($log->subject_type) : null,
                'subject_id' => $log->subject_id,
                'causer' => $log->causer?->only(['id', 'name', 'email']),
                'tenant_id' => $tenantId,
                'tenant_name' => $tenantId ? $tenants[$tenantId] ?? null : null,
                'properties' => $log->properties?->toArray(),
                'created_at' => $log->created_at?->toISOString(),
            ];
        });

        return Inertia::render('super-admin/activity-logs/index', [
            'activityLogs' => $logs,
            'filters' => [
                'tenant_id' => $tenantId,
                'user_id' => $userId,
                'date_from' => $dateFrom?->format('Y-m-d'),
                'date_to' => $dateTo?->format('Y-m-d'),
                'subject_type' => $subjectType,
                'event' => $event,
            ],
            'filterOptions' => [
                'tenants' => $tenants,
                'users' => $users,
                'subjectTypes' => $subjectTypes,
                'events' => $events,
            ],
        ]);
    }
}
