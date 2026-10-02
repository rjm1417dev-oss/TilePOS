<?php

namespace App\Resolvers;

use Spatie\Permission\Contracts\PermissionsTeamResolver;

class TenantPermissionTeamResolver implements PermissionsTeamResolver
{
    protected int|string|null $teamId = null;

    public function getPermissionsTeamId(): int|string|null
    {
        if ($this->teamId !== null) {
            return $this->teamId;
        }

        $user = auth()->user();

        return $user?->tenant_id;
    }

    /**
     * @param  int|string|\Illuminate\Database\Eloquent\Model|null  $id
     */
    public function setPermissionsTeamId($id): void
    {
        if ($id instanceof \Illuminate\Database\Eloquent\Model) {
            $id = $id->getKey();
        }
        $this->teamId = $id;
    }
}
