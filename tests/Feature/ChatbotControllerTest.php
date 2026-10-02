<?php

namespace Tests\Feature;

use App\Models\Tenant;
use App\Models\User;
use App\Services\Chatbot\ChatbotPermissionMapper;
use App\Services\Chatbot\ChatbotService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class ChatbotControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutMiddleware(['throttle']);
        config(['chatbot.groq.api_key' => 'test-api-key']);
    }

    public function test_guests_cannot_use_tenant_chatbot(): void
    {
        $response = $this->postJson('/chatbot/message', ['message' => 'hello']);

        $response->assertUnauthorized();
    }

    public function test_tenant_user_can_send_message_with_permissions(): void
    {
        $tenant = Tenant::create([
            'business_name' => 'Test Tenant',
            'business_email' => 'test@example.com',
            'password' => bcrypt('password'),
        ]);

        $user = User::factory()->create([
            'tenant_id' => $tenant->id,
            'is_super_admin' => false,
        ]);

        // Give the user actual permissions so the mapper returns non-empty tables.
        app()[\Spatie\Permission\PermissionRegistrar::class]->setPermissionsTeamId($tenant->id);

        foreach (['quotations.view', 'customers.view'] as $name) {
            Permission::firstOrCreate(['name' => $name, 'guard_name' => 'web']);
        }

        $role = Role::firstOrCreate(['name' => 'Manager', 'tenant_id' => $tenant->id, 'guard_name' => 'web']);
        $role->givePermissionTo(['quotations.view', 'customers.view']);
        $user->assignRole($role);

        $allowedTables = ChatbotPermissionMapper::forUser($user);

        $mockService = Mockery::mock(ChatbotService::class);
        $mockService->shouldReceive('handleTenantMessage')
            ->once()
            ->with('What are my sales?', [['role' => 'user', 'content' => 'What are my sales?']], $tenant->id, $allowedTables)
            ->andReturn([
                'text' => 'You have 5 sales today.',
                'type' => 'sql',
                'sql' => 'SELECT COUNT(*) FROM quotations WHERE tenant_id = '.$tenant->id,
                'results' => [['count' => 5]],
                'sources' => [],
            ]);

        $this->app->instance(ChatbotService::class, $mockService);

        $response = $this->actingAs($user)->postJson('/chatbot/message', [
            'message' => 'What are my sales?',
        ]);

        $response->assertOk();
        $response->assertJson([
            'message' => 'You have 5 sales today.',
            'type' => 'sql',
            'sources' => [],
        ]);

        // Verify sql is returned but results are NOT (metadata bloat prevention).
        $response->assertJsonMissing(['results']);
    }

    public function test_super_admin_can_send_message(): void
    {
        $user = User::factory()->create([
            'tenant_id' => null,
            'is_super_admin' => true,
        ]);

        $mockService = Mockery::mock(ChatbotService::class);
        $mockService->shouldReceive('handleSuperAdminMessage')
            ->once()
            ->with('How many tenants?', [['role' => 'user', 'content' => 'How many tenants?']], ChatbotPermissionMapper::forSuperAdmin())
            ->andReturn([
                'text' => 'There are 3 tenants.',
                'type' => 'sql',
                'sql' => 'SELECT COUNT(*) FROM tenants',
                'results' => [['count' => 3]],
                'sources' => [],
            ]);

        $this->app->instance(ChatbotService::class, $mockService);

        $response = $this->actingAs($user)->postJson('/super-admin/chatbot/message', [
            'message' => 'How many tenants?',
        ]);

        $response->assertOk();
        $response->assertJson([
            'message' => 'There are 3 tenants.',
            'type' => 'sql',
            'sources' => [],
        ]);
    }

    public function test_tenant_user_cannot_use_super_admin_chatbot(): void
    {
        $tenant = Tenant::create([
            'business_name' => 'Test Tenant',
            'business_email' => 'tenant@example.com',
            'password' => bcrypt('password'),
        ]);

        $user = User::factory()->create([
            'tenant_id' => $tenant->id,
            'is_super_admin' => false,
        ]);

        $response = $this->actingAs($user)->postJson('/super-admin/chatbot/message', [
            'message' => 'How many tenants?',
        ]);

        $response->assertForbidden();
    }

    public function test_message_is_required(): void
    {
        $tenant = Tenant::create([
            'business_name' => 'Test Tenant',
            'business_email' => 'required@example.com',
            'password' => bcrypt('password'),
        ]);

        $user = User::factory()->create([
            'tenant_id' => $tenant->id,
            'is_super_admin' => false,
        ]);

        $response = $this->actingAs($user)->postJson('/chatbot/message', []);

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors(['message']);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }
}
