<?php

namespace Tests\Feature\SuperAdmin;

use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DatabaseBackupTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(PermissionSeeder::class);
    }

    public function test_super_admin_can_download_database_backup(): void
    {
        $driver = config('database.default');
        if (in_array($driver, ['mysql', 'mariadb'], true)) {
            $this->markTestSkipped('Database backup download test requires SQLite (mysqldump may not be available in test env).');
        }

        $superAdmin = User::factory()->create([
            'is_super_admin' => true,
            'tenant_id' => null,
        ]);

        $response = $this->actingAs($superAdmin)->get(
            route('super-admin.export.database')
        );

        $response->assertOk();
        $response->assertHeader('content-disposition');
        $this->assertStringContainsString('attachment', $response->headers->get('content-disposition'));
    }

    public function test_backup_command_succeeds(): void
    {
        $driver = config('database.default');
        if (in_array($driver, ['mysql', 'mariadb'], true)) {
            $this->markTestSkipped('Database backup command test requires SQLite (mysqldump may not be available in test env).');
        }

        $this->artisan('backup:database')
            ->assertSuccessful();
    }

    public function test_guest_cannot_download_database_backup(): void
    {
        $response = $this->get(route('super-admin.export.database'));

        $response->assertRedirect(route('login'));
    }
}
