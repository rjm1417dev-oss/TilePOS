<?php

use App\Http\Controllers\AccountsPayableController;
use App\Http\Controllers\AccountsReceivableController;
use App\Http\Controllers\BrandController;
use App\Http\Controllers\ChatbotController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ExportController;
use App\Http\Controllers\ImportController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\PublicChatbotController;
use App\Http\Controllers\QuotationController;
use App\Http\Controllers\QuotationPdfController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\SizeController;
use App\Http\Controllers\StockController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\TenantRegistrationController;
use App\Http\Controllers\TileController;
use App\Http\Controllers\TileReturnController;
use App\Http\Controllers\TileReturnPdfController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/tenant/register', [TenantRegistrationController::class, 'showRegistrationForm'])
    ->name('tenant.register')
    ->middleware('guest');

Route::post('/tenant/register', [TenantRegistrationController::class, 'register'])
    ->name('tenant.register.submit')
    ->middleware(['guest', 'throttle:10,1']);

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
        'appName' => config('app.name'),
        'tagline' => config('app.tagline'),
    ]);
})->name('home');

// Public website chatbot — no authentication required, no database access.
Route::post('/chatbot/public', [PublicChatbotController::class, 'message'])
    ->name('chatbot.public.message')
    ->middleware('throttle:20,1');

Route::get('/about-us', fn () => Inertia::render('about-us', [
    'appName' => config('app.name'),
    'tagline' => config('app.tagline'),
]))
    ->name('about-us');

Route::get('/contact-us', fn () => Inertia::render('contact-us', [
    'appName' => config('app.name'),
    'tagline' => config('app.tagline'),
]))
    ->name('contact-us');
Route::post('/contact-us', function (\Illuminate\Http\Request $request) {
    $request->validate([
        'name' => ['required', 'string', 'max:255'],
        'email' => ['required', 'email'],
        'subject' => ['required', 'string', 'max:255'],
        'message' => ['required', 'string', 'max:5000'],
    ]);

    return redirect()->route('contact-us')->with('success', 'Thanks! We\'ll get back to you within 24 hours.');
})->name('contact-us.submit');

Route::get('/faqs', fn () => Inertia::render('faqs', [
    'appName' => config('app.name'),
    'tagline' => config('app.tagline'),
]))
    ->name('faqs');

Route::get('/features', fn () => Inertia::render('features', [
    'appName' => config('app.name'),
    'tagline' => config('app.tagline'),
    'canRegister' => Features::enabled(Features::registration()),
]))
    ->name('features');

Route::get('/how-it-works', fn () => Inertia::render('how-it-works', [
    'appName' => config('app.name'),
    'tagline' => config('app.tagline'),
    'canRegister' => Features::enabled(Features::registration()),
]))
    ->name('how-it-works');

Route::get('/pricing', fn () => Inertia::render('pricing', [
    'appName' => config('app.name'),
    'tagline' => config('app.tagline'),
    'canRegister' => Features::enabled(Features::registration()),
]))
    ->name('pricing');

Route::get('/terms', fn () => Inertia::render('terms', [
    'appName' => config('app.name'),
    'tagline' => config('app.tagline'),
    'canRegister' => Features::enabled(Features::registration()),
]))
    ->name('terms');

Route::get('/cookie-policy', fn () => Inertia::render('cookie-policy', [
    'appName' => config('app.name'),
    'tagline' => config('app.tagline'),
    'canRegister' => Features::enabled(Features::registration()),
]))
    ->name('cookie-policy');

Route::get('/privacy-policy', fn () => Inertia::render('privacy-policy', [
    'appName' => config('app.name'),
    'tagline' => config('app.tagline'),
]))
    ->name('privacy-policy');

Route::get('subscription-expired', fn () => Inertia::render('subscription-expired'))
    ->middleware(['auth', 'verified'])
    ->name('subscription.expired');

Route::get('dashboard', DashboardController::class)
    ->middleware(['auth', 'verified', 'tenant.not.expired'])
    ->name('dashboard');

Route::middleware(['auth', 'verified', 'impersonation.readonly', 'tenant.not.expired'])->group(function () {
    Route::post('chatbot/message', [ChatbotController::class, 'tenantMessage'])
        ->name('chatbot.tenant.message')
        ->middleware('throttle:chatbot');

    Route::post('notifications/mark-read', [NotificationController::class, 'markAsRead'])->name('notifications.mark-read');
    Route::get('reports', [ReportController::class, 'index'])->name('reports.index');
    Route::get('reports/profit-loss', [ReportController::class, 'profitLoss'])->name('reports.profit-loss');
    Route::get('reports/payables-aging', [ReportController::class, 'payablesAging'])->name('reports.payables-aging');
    Route::get('reports/receivables-aging', [ReportController::class, 'receivablesAging'])->name('reports.receivables-aging');
    Route::get('reports/sales-by-product', [ReportController::class, 'salesByProduct'])->name('reports.sales-by-product');
    Route::get('reports/sales-by-brand', [ReportController::class, 'salesByBrand'])->name('reports.sales-by-brand');
    Route::get('reports/sales-by-customer', [ReportController::class, 'salesByCustomer'])->name('reports.sales-by-customer');
    Route::get('reports/stock-valuation', [ReportController::class, 'stockValuation'])->name('reports.stock-valuation');
    Route::get('import', [ImportController::class, 'index'])->name('import.index');
    Route::post('import', [ImportController::class, 'store'])->name('import.store');
    Route::get('import/template/{type}', [ImportController::class, 'downloadTemplate'])->name('import.template');
    Route::get('export', [ExportController::class, 'index'])->name('export.index');
    Route::get('export/download', [ExportController::class, 'download'])->name('export.download');
    Route::resource('roles', RoleController::class)->except(['show']);
    Route::resource('users', UserController::class)->except(['show']);
    Route::resource('brands', BrandController::class);
    Route::resource('sizes', SizeController::class);
    Route::resource('tiles', TileController::class)->middleware('feature:tiles');
    Route::resource('products', ProductController::class);
    Route::post('suppliers/quick-create', [SupplierController::class, 'quickStore'])->name('suppliers.quick-create');
    Route::resource('suppliers', SupplierController::class);
    Route::resource('stocks', StockController::class);
    Route::resource('accounts-payables', AccountsPayableController::class)->middleware('feature:accounts_payable');
    Route::resource('accounts-receivables', AccountsReceivableController::class)->middleware('feature:accounts_receivable');
    Route::post('customers/quick-create', [CustomerController::class, 'quickStore'])->name('customers.quick-create');
    Route::resource('customers', CustomerController::class);
    Route::middleware('feature:quotations')->group(function () {
        Route::get('quotations/{quotation}/download', [QuotationPdfController::class, 'download'])->name('quotations.download');
        Route::resource('quotations', QuotationController::class)->only(['index', 'create', 'store', 'show']);
    });
    Route::middleware('feature:tile_returns')->group(function () {
        Route::get('tile-returns/customer-tiles', [TileReturnController::class, 'customerTiles'])->name('tile-returns.customer-tiles');
        Route::get('tile-returns/{tile_return}/download', [TileReturnPdfController::class, 'download'])->name('tile-returns.download');
        Route::post('tile-returns/calculate-amount', [TileReturnController::class, 'calculateReturnAmount'])->name('tile-returns.calculate-amount');
        Route::resource('tile-returns', TileReturnController::class)->only(['index', 'create', 'store', 'show']);
    });
});

require __DIR__.'/settings.php';
