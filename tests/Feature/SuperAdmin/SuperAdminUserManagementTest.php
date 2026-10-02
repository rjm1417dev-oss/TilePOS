<?php

namespace Tests\Feature\SuperAdmin;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SuperAdminUserManagementTest extends TestCase
{
    use RefreshDatabase;

    protected function superAdmin(): User
    {
        return User::factory()->create([
            'is_super_admin' => true,
            'tenant_id' => null,
        ]);
    }

    public function test_super_admin_can_access_super_admins_index(): void
    {
        $user = $this->superAdmin();

        $response = $this->actingAs($user)->get(route('super-admin.super-admins.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('super-admin/super-admins/index')
            ->has('users')
        );
    }

    public function test_super_admin_can_create_super_admin(): void
    {
        $user = $this->superAdmin();

        $response = $this->actingAs($user)->post(route('super-admin.super-admins.store'), [
            'name' => 'New Super Admin',
            'email' => 'newadmin@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $response->assertRedirect(route('super-admin.super-admins.index'));
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('users', [
            'email' => 'newadmin@example.com',
            'is_super_admin' => true,
            'tenant_id' => null,
        ]);
    }

    public function test_super_admin_can_update_super_admin(): void
    {
        $admin = $this->superAdmin();
        $target = User::factory()->create([
            'is_super_admin' => true,
            'tenant_id' => null,
            'name' => 'Old Name',
            'email' => 'target@example.com',
        ]);

        $response = $this->actingAs($admin)->put(route('super-admin.super-admins.update', $target), [
            'name' => 'Updated Name',
            'email' => 'updated@example.com',
            'password' => '',
            'password_confirmation' => '',
        ]);

        $response->assertRedirect(route('super-admin.super-admins.index'));
        $response->assertSessionHas('success');

        $target->refresh();
        $this->assertSame('Updated Name', $target->name);
        $this->assertSame('updated@example.com', $target->email);
    }

    public function test_super_admin_cannot_delete_self(): void
    {
        $admin = $this->superAdmin();

        $response = $this->actingAs($admin)->delete(route('super-admin.super-admins.destroy', $admin));

        $response->assertRedirect(route('super-admin.super-admins.index'));
        $response->assertSessionHas('error', 'You cannot delete your own account.');

        $this->assertDatabaseHas('users', ['id' => $admin->id]);
    }

    public function test_super_admin_can_delete_other_super_admin(): void
    {
        $admin = $this->superAdmin();
        $target = User::factory()->create([
            'is_super_admin' => true,
            'tenant_id' => null,
        ]);

        $response = $this->actingAs($admin)->delete(route('super-admin.super-admins.destroy', $target));

        $response->assertRedirect(route('super-admin.super-admins.index'));
        $response->assertSessionHas('success');

        $this->assertDatabaseMissing('users', ['id' => $target->id]);
    }

    public function test_tenant_user_cannot_access_super_admins(): void
    {
        $tenant = \App\Models\Tenant::create([
            'business_name' => 'Test',
            'business_email' => 't@t.com',
            'password' => 'password',
            'is_active' => true,
        ]);

        $user = User::factory()->create([
            'tenant_id' => $tenant->id,
            'is_super_admin' => false,
        ]);

        $response = $this->actingAs($user)->get(route('super-admin.super-admins.index'));

        $response->assertForbidden();
    }
}
