<?php

namespace App\Models;

use App\Scopes\TenantScope;
use App\Traits\HasTenantId;
use App\Traits\LogsTenantActivity;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;

class Quotation extends Model
{
    use HasTenantId, LogsTenantActivity;

    protected static function booted(): void
    {
        static::addGlobalScope(new TenantScope);
    }

    protected $fillable = [
        'tenant_id',
        'quotation_number',
        'type',
        'items_count',
        'customer_id',
        'discount_percentage',
        'discount_amount',
        'tax_percentage',
        'tax_amount',
        'total_amount',
        'payment_method',
        'paid_amount',
        'remaining_amount',
        'customer_name',
        'customer_phone',
        'customer_address',
        'customer_cnic',
        'notes',
        'invoice_date',
        'due_date',
    ];

    protected function casts(): array
    {
        return [
            'invoice_date' => 'date',
            'due_date' => 'date',
            'discount_percentage' => 'decimal:2',
            'discount_amount' => 'decimal:2',
            'tax_percentage' => 'decimal:2',
            'tax_amount' => 'decimal:2',
            'total_amount' => 'decimal:2',
            'paid_amount' => 'decimal:2',
            'remaining_amount' => 'decimal:2',
        ];
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($quotation) {
            if (empty($quotation->quotation_number)) {
                $quotation->quotation_number = static::generateQuotationNumber(
                    $quotation->type,
                    $quotation->tenant_id ?? Auth::user()?->tenant_id
                );
            }
        });
    }

    public static function generateQuotationNumber(string $type, ?int $tenantId = null): string
    {
        if (! $tenantId) {
            $tenantId = Auth::user()?->tenant_id;
        }

        if (! $tenantId) {
            throw new \RuntimeException('Tenant ID is required to generate quotation number.');
        }

        $prefix = strtolower($type) === 'invoice' ? 'IV' : 'QT';
        $date = now();
        $dateString = $date->format('ymd');

        if (Schema::hasTable('quotation_sequences')) {
            try {
                $sequence = DB::table('quotation_sequences')
                    ->where('tenant_id', $tenantId)
                    ->where('type', $type)
                    ->where('date', $date->toDateString())
                    ->lockForUpdate()
                    ->first();

                if ($sequence) {
                    $newNumber = $sequence->last_number + 1;
                    DB::table('quotation_sequences')
                        ->where('id', $sequence->id)
                        ->update([
                            'last_number' => $newNumber,
                            'updated_at' => now(),
                        ]);
                } else {
                    $newNumber = 1;
                    DB::table('quotation_sequences')->insert([
                        'tenant_id' => $tenantId,
                        'type' => $type,
                        'date' => $date->toDateString(),
                        'last_number' => $newNumber,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }

                return $prefix.$dateString.'-'.str_pad($newNumber, 2, '0', STR_PAD_LEFT);
            } catch (\Exception $e) {
                Log::warning('Quotation sequence error, using fallback', [
                    'error' => $e->getMessage(),
                    'tenant_id' => $tenantId,
                    'type' => $type,
                ]);
            }
        }

        $todayPattern = $prefix.$dateString.'-%';
        $existingNumbers = static::withoutGlobalScopes()
            ->where('type', $type)
            ->where('tenant_id', $tenantId)
            ->where('quotation_number', 'like', $todayPattern)
            ->pluck('quotation_number')->toArray();

        $maxCount = 0;
        foreach ($existingNumbers as $number) {
            if (preg_match('/^'.preg_quote($prefix.$dateString, '/').'-(\d+)$/', $number, $matches)) {
                $counter = (int) $matches[1];
                if ($counter > $maxCount) {
                    $maxCount = $counter;
                }
            }
        }

        $count = $maxCount + 1;

        return $prefix.$dateString.'-'.str_pad($count, 2, '0', STR_PAD_LEFT);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(QuotationItem::class)->orderBy('sort_order');
    }

    public function tileItems(): HasMany
    {
        return $this->hasMany(QuotationItem::class)->where('item_type', 'tile')->orderBy('sort_order');
    }

    public function productItems(): HasMany
    {
        return $this->hasMany(QuotationItem::class)->where('item_type', 'product')->orderBy('sort_order');
    }

    public function accountsReceivables()
    {
        return $this->hasMany(AccountsReceivable::class);
    }
}
