<?php

namespace Tests\Feature;

use App\Models\Brand;
use App\Models\Stock;
use App\Models\Tenant;
use App\Models\Tile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class QuotationStockValidationTest extends TestCase
{
    use RefreshDatabase;

    private Tenant $tenant;

    private User $user;

    private Tile $tile;

    protected function setUp(): void
    {
        parent::setUp();

        $this->tenant = Tenant::create([
            'business_name' => 'Test Tenant',
            'business_email' => 'tenant@test.example',
            'business_phone' => null,
            'business_address' => null,
            'password' => 'password',
            'is_active' => true,
        ]);

        $this->user = User::factory()->create([
            'tenant_id' => $this->tenant->id,
            'is_super_admin' => false,
        ]);

        app()[PermissionRegistrar::class]->setPermissionsTeamId($this->tenant->id);
        $role = Role::firstOrCreate(
            ['name' => 'Admin', 'guard_name' => 'web', 'tenant_id' => $this->tenant->id],
        );
        $permission = Permission::firstOrCreate(['name' => 'quotations.create', 'guard_name' => 'web']);
        $role->givePermissionTo($permission);
        $this->user->assignRole($role);
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $brand = Brand::factory()->create(['tenant_id' => $this->tenant->id]);
        $size = \App\Models\Size::create([
            'tenant_id' => $this->tenant->id,
            'size_in_inches' => '12x12',
            'description' => null,
        ]);

        $this->tile = Tile::create([
            'tenant_id' => $this->tenant->id,
            'brand_id' => $brand->id,
            'tile_code' => 'T-001',
            'size_id' => $size->id,
            'no_of_tiles_per_box' => 10,
            'price_per_box' => 100,
        ]);
    }

    public function test_invoice_fails_when_tile_stock_insufficient(): void
    {
        Stock::create([
            'tenant_id' => $this->tenant->id,
            'tile_id' => $this->tile->id,
            'in_stock' => 2,
            'minimum_stock_level' => 0,
        ]);

        $payload = [
            'type' => 'invoice',
            'customer_name' => 'Test Customer',
            'items' => [
                [
                    'item_type' => 'tile',
                    'tile_id' => $this->tile->id,
                    'item_name' => $this->tile->tile_code.' - Test',
                    'quantity' => 5,
                    'unit_price' => 100,
                    'subtotal' => 500,
                    'boxes_required' => 5,
                    'loose_tiles' => 0,
                ],
            ],
        ];

        $response = $this->actingAs($this->user)
            ->post(route('quotations.store'), $payload);

        $response->assertRedirect();
        $response->assertSessionHasErrors('items');
    }

    public function test_invoice_succeeds_when_tile_stock_sufficient(): void
    {
        Stock::create([
            'tenant_id' => $this->tenant->id,
            'tile_id' => $this->tile->id,
            'in_stock' => 10,
            'minimum_stock_level' => 0,
        ]);

        $payload = [
            'type' => 'invoice',
            'customer_name' => 'Test Customer',
            'items' => [
                [
                    'item_type' => 'tile',
                    'tile_id' => $this->tile->id,
                    'item_name' => $this->tile->tile_code.' - Test',
                    'quantity' => 5,
                    'unit_price' => 100,
                    'subtotal' => 500,
                    'boxes_required' => 5,
                    'loose_tiles' => 0,
                ],
            ],
        ];

        $response = $this->actingAs($this->user)
            ->post(route('quotations.store'), $payload);

        $response->assertRedirect();
        $response->assertSessionHasNoErrors();
    }

    public function test_quotation_succeeds_without_stock_check(): void
    {
        Stock::create([
            'tenant_id' => $this->tenant->id,
            'tile_id' => $this->tile->id,
            'in_stock' => 0,
            'minimum_stock_level' => 0,
        ]);

        $payload = [
            'type' => 'quotation',
            'customer_name' => 'Test Customer',
            'items' => [
                [
                    'item_type' => 'tile',
                    'tile_id' => $this->tile->id,
                    'item_name' => $this->tile->tile_code.' - Test',
                    'quantity' => 5,
                    'unit_price' => 100,
                    'subtotal' => 500,
                    'boxes_required' => 5,
                    'loose_tiles' => 0,
                ],
            ],
        ];

        $response = $this->actingAs($this->user)
            ->post(route('quotations.store'), $payload);

        $response->assertRedirect();
        $response->assertSessionHasNoErrors();
    }
}
