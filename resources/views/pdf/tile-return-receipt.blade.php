<!DOCTYPE html>
<html lang="ur">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $tileReturn->receipt_number }}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;700&family=Roboto:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        :root {
            --font-latin: 'Roboto', Arial, sans-serif;
            --font-urdu: 'Noto Nastaliq Urdu', serif;
            --border: 1px solid #1f2129;
            --dotted: 1px dotted #8590a8;
        }

        html, body {
            width: 80mm;
            font-family: var(--font-latin);
            font-size: 8.5px;
            color: #1f2129;
            background: #fbfaf7;
        }

        /* ── Wrapper ──────────────────────────── */
        .receipt {
            width: 80mm;
            padding: 4mm 5mm 6mm;
        }

        /* ── Shop Header ──────────────────────── */
        .shop-name {
            font-size: 14px;
            font-weight: 700;
            text-align: center;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 2px;
        }
        .shop-sub {
            font-size: 7.5px;
            text-align: center;
            line-height: 1.5;
        }

        /* ── Document label ───────────────────── */
        .doc-label {
            font-size: 12px;
            font-weight: 700;
            text-align: center;
            text-decoration: underline;
            margin: 6px 0 5px;
        }

        /* ── Meta block ───────────────────────── */
        .meta {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 5px;
            font-size: 7.5px;
        }
        .meta td {
            padding: 1.5px 2px;
        }
        .meta .lbl { font-weight: 600; width: 22%; }
        .meta .val { width: 28%; }
        .meta .lbl2 { font-weight: 600; width: 22%; text-align: right; }
        .meta .val2 { text-align: right; width: 28%; }

        /* ── Items table ──────────────────────── */
        .items {
            width: 100%;
            border-collapse: collapse;
            font-size: 7px;
            margin-bottom: 2px;
        }
        .items thead tr {
            border-top: var(--border);
            border-bottom: var(--border);
        }
        .items th {
            padding: 2px 2px;
            font-weight: 700;
            text-align: left;
            white-space: nowrap;
        }
        .items td {
            padding: 2.5px 2px;
            border-bottom: var(--dotted);
            vertical-align: top;
        }
        .r { text-align: right; }
        .c { text-align: center; }

        /* ── Items count ──────────────────────── */
        .items-count {
            font-size: 7px;
            margin: 3px 0;
        }

        /* ── Summary ──────────────────────────── */
        .summary {
            width: 100%;
            border-collapse: collapse;
            font-size: 8px;
        }
        .summary td { padding: 1.5px 2px; }
        .summary .sl { width: 55%; }
        .summary .sr { text-align: right; width: 45%; }
        .summary .grand {
            font-weight: 700;
            font-size: 10px;
            border-top: var(--border);
            border-bottom: var(--border);
        }
        .summary .grand td { padding: 2.5px 2px; }

        /* ── Payment ──────────────────────────── */
        .payment {
            width: 100%;
            border-collapse: collapse;
            font-size: 8px;
            margin-top: 4px;
        }
        .payment td { padding: 1.5px 2px; }
        .payment .pr { text-align: right; }

        /* ── Divider ──────────────────────────── */
        .divider {
            border: none;
            border-top: var(--border);
            margin: 4px 0;
        }
        .divider-dot {
            border: none;
            border-top: var(--dotted);
            margin: 5px 0;
        }

        /* ── Urdu terms (front) ───────────────── */
        .urdu-terms {
            font-family: var(--font-urdu);
            direction: rtl;
            text-align: right;
            font-size: 10px;
            line-height: 2.2;
            margin-top: 6px;
        }

        /* ── Software footer ──────────────────── */
        .sw-footer {
            font-size: 6.5px;
            text-align: center;
            color: #525a73;
            margin-top: 6px;
        }

        /* ── Back page ────────────────────────── */
        .back-page {
            page-break-before: always;
            padding: 4mm 5mm;
        }
        .back-border {
            border: 2.5px solid #1f2129;
            padding: 8px;
        }
        .back-list {
            font-family: var(--font-urdu);
            direction: rtl;
            text-align: right;
            font-size: 10px;
            line-height: 2;
            width: 100%;
            border-collapse: collapse;
        }
        .back-list td {
            vertical-align: top;
            padding-bottom: 5px;
        }
        .back-list td.num {
            width: 22px;
            text-align: right;
            direction: ltr;
            font-family: var(--font-latin);
            font-weight: 700;
            font-size: 8px;
            padding-top: 4px;
            padding-left: 0;
            white-space: nowrap;
        }
    </style>
</head>
<body>
@php
    $tenant    = $tileReturn->tenant;
    $shopName  = $tenant?->business_name ?? config('app.name');
    $shopAddr  = $tenant?->business_address ?? '';
    $shopPh    = $tenant?->business_phone ?? '';
    $shopCell  = config('receipt.cell_phone');
    $docLabel  = $tileReturn->type === 'exchange' ? 'EXCHANGE' : 'RETURN';
    $receiptNo = $tileReturn->receipt_number;
    $invDate   = $tileReturn->created_at ?? now();
    $invTime   = $invDate->format('h:i:sA');
    $customer  = $tileReturn->customer?->name ?? '—';
    $payMethod = strtoupper($tileReturn->return_payment_method ?? 'CASH');
    $swFooter  = config('receipt.software_provider', 'Software Provided By. IPCS, Rwp. 0332-5173356');

    $rt = $tileReturn->returnTile;
    $returnLabel = $rt
        ? ($rt->tile_code ?? 'N/A') . ($rt->brand ? ' - ' . $rt->brand->brand_name : '') . ($rt->size ? ' (' . $rt->size->size_in_inches . ')' : '')
        : '—';
    $returnQty = $tileReturn->return_no_of_boxes . ' box(es)';
    if ($tileReturn->return_no_of_tiles > 0) {
        $returnQty .= ' + ' . $tileReturn->return_no_of_tiles . ' loose';
    }

    $et = $tileReturn->exchangeTile;
    $exchangeLabel = $et
        ? ($et->tile_code ?? 'N/A') . ($et->brand ? ' - ' . $et->brand->brand_name : '') . ($et->size ? ' (' . $et->size->size_in_inches . ')' : '')
        : '—';
    $exchangeQty = ($tileReturn->exchange_no_of_boxes ?? 0) . ' box(es)';
    if (($tileReturn->exchange_no_of_tiles ?? 0) > 0) {
        $exchangeQty .= ' + ' . ($tileReturn->exchange_no_of_tiles ?? 0) . ' loose';
    }
@endphp

{{-- ══════════════ FRONT ══════════════ --}}
<div class="receipt">

    {{-- Header --}}
    <div class="shop-name">{{ $shopName }}</div>
    @if($shopAddr)<div class="shop-sub">{{ $shopAddr }}</div>@endif
    @if($shopPh || $shopCell)
    <div class="shop-sub">
        @if($shopPh)Ph: {{ $shopPh }}@endif
        @if($shopCell) &nbsp; Cell: {{ $shopCell }}@endif
    </div>
    @endif

    <div class="doc-label">{{ $docLabel }}</div>

    {{-- Meta --}}
    <table class="meta">
        <tr>
            <td class="lbl">Date</td>
            <td class="val">{{ $invDate->format('d M Y') }}</td>
            <td class="lbl2">Time</td>
            <td class="val2">{{ $invTime }}</td>
        </tr>
        <tr>
            <td class="lbl">Receipt #</td>
            <td class="val">{{ $receiptNo }}</td>
            <td class="lbl2">Customer</td>
            <td class="val2">{{ $customer }}</td>
        </tr>
    </table>

    {{-- Items --}}
    <table class="items">
        <thead>
            <tr>
                <th style="width:45%">Description</th>
                <th class="c" style="width:25%">Qty</th>
                <th class="r" style="width:30%">Amount</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Return: {{ $returnLabel }}</td>
                <td class="c">{{ $returnQty }}</td>
                <td class="r">{{ number_format((float) $tileReturn->return_total_amount, 2) }}</td>
            </tr>
            @if($tileReturn->type === 'exchange' && $tileReturn->exchange_tile_id)
            <tr>
                <td>Exchange: {{ $exchangeLabel }}</td>
                <td class="c">{{ $exchangeQty }}</td>
                <td class="r">{{ number_format((float) ($tileReturn->exchange_total_amount ?? 0), 2) }}</td>
            </tr>
            @endif
        </tbody>
    </table>

    {{-- Summary --}}
    <table class="summary">
        <tr class="grand">
            <td class="sl">Total Amount</td>
            <td class="sr">{{ number_format((float) $tileReturn->return_total_amount, 2) }}</td>
        </tr>
        @if($tileReturn->type === 'exchange' && ($tileReturn->payment_difference ?? 0) != 0)
        <tr>
            <td class="sl">Payment Diff</td>
            <td class="sr">{{ number_format((float) ($tileReturn->payment_difference ?? 0), 2) }}</td>
        </tr>
        @endif
    </table>

    {{-- Payment --}}
    <table class="payment">
        <tr>
            <td style="width:50%">Payment</td>
            <td class="pr" style="width:50%">{{ $payMethod }}</td>
        </tr>
    </table>

    @if($tileReturn->return_notes)
    <div style="font-size: 7px; margin-top: 4px;"><strong>Notes:</strong> {{ $tileReturn->return_notes }}</div>
    @endif

    {{-- Urdu front terms --}}
    <hr class="divider-dot">
    <div class="urdu-terms">
        <div>مال کی واپسی یا تبدیلی 21 دن کے اندر ہو گی</div>
        <div>ٹوٹی، کھلی، یا گیلی ٹائل کی واپسی یا تبدیلی نہیں ہو گی</div>
        <div>بل کے بغیر واپسی یا تبدیلی نہیں ہو گی</div>
        <div>امپورٹڈ مال کی واپسی یا تبدیلی نہیں ہو گی</div>
        <div>کل مال کی واپسی پر %25 کٹوتی ہو گی</div>
        <div>گارنٹی، کلیم کمپنی کی شرائط کے مطابق ہو گی</div>
        <div>واپسی 12 بجے کے بعد ہوگی</div>
    </div>

    <div class="sw-footer">{{ $swFooter }}</div>

</div>

{{-- ══════════════ BACK ══════════════ --}}
<div class="back-page">
    <div class="back-border">
        <table class="back-list">
            <tr>
                <td class="num">.1</td>
                <td>مال واپس یا تبدیل کرنے کے لیے بل ہمراہ لائیں</td>
            </tr>
            <tr>
                <td class="num">.2</td>
                <td>پیک مال کی تبدیلی یا واپسی 21 دن کے اندر ہوگی اور مکمل سامان واپسی یا مکمل سامان تبدیلی کی صورت میں لیبر چار جز دینے ہوں گے۔</td>
            </tr>
            <tr>
                <td class="num">.3</td>
                <td>مال گودام سے لیتے وقت ٹوٹ پھوٹ کی تسلی کائن بلا کرلیں ۔ بعد میں ہماری کوئی ذمہ داری نہیں ہوگی ۔</td>
            </tr>
            <tr>
                <td class="num">.4</td>
                <td>گیلی کھلی اور ٹوٹی ٹائل کی کسی صورت میں واپسی نہیں ہوگی۔</td>
            </tr>
            <tr>
                <td class="num">.5</td>
                <td>ٹائل لگانے کے بعد کھلی ٹائل بچ جانے کی صورت میں اس کو سنبھال کے رکھیں تا کہ آئندہ آنے والی میشیننس یا مرمت میں آپ کو کام آسکے۔</td>
            </tr>
            <tr>
                <td class="num">.6</td>
                <td>فرسی امور کی ٹائل کی واپسی کسی صورت میں نہیں ہوگی۔</td>
            </tr>
            <tr>
                <td class="num">.7</td>
                <td>ٹائل کی پیکنگ ایک جیسی ہونے کی وجہ سے غدار رنگ ڈلیور ہو سکتا ہے لہذا لگانے سے پہلے چیک کریں۔ کوئی بھی مکمل آئٹم واپس کرنے کی صورت میں %35 کٹوتی ہوگی۔</td>
            </tr>
            <tr>
                <td class="num">.8</td>
                <td>ٹائل میں کسی بھی قسم کے نقص کی صورت میں ٹائل لگانے سے پہلے تبدیل کی جاسکتی ہے۔</td>
            </tr>
            <tr>
                <td class="num">.9</td>
                <td>ٹائل لگانے کے بعد ہماری کوئی ذمہ داری نہیں ہوگی۔</td>
            </tr>
            <tr>
                <td class="num">.10</td>
                <td>امپورٹڈ مال کی کوئی گارنٹی نہیں۔</td>
            </tr>
            <tr>
                <td class="num">.11</td>
                <td>ٹائل کے سارے کارٹن احتیاط سے ایک ساتھ کھولیں اور اگر کوئی ٹائل ٹوٹی ہوئی نکلے تو اسے کٹنگ میں استعمال کریں۔</td>
            </tr>
        </table>
    </div>
</div>

</body>
</html>
