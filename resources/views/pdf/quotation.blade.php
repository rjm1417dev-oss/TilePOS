<!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8">
    <title>{{ $quotation->type === 'quotation' ? 'Quotation' : 'Invoice' }} - {{ $quotation->quotation_number }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        @page {
            margin: 10mm;
            margin-bottom: 80mm;
        }

        body {
            font-family: 'DejaVu Sans', Arial, sans-serif;
            font-size: 10px;
            color: #1f2129;
            background: #fbfaf7;
            margin: 0;
            position: relative;
            min-height: 100vh;
            padding-bottom: 60mm;
        }

        .document-container {
            max-width: 100%;
            margin: 0 auto;
            background: #fbfaf7;
            padding: 20px;
            position: relative;
        }

        .sender-logo-container {
            text-align: right;
            margin-bottom: 10px;
        }

        .sender-logo {
            width: 80px;
            height: 80px;
            display: inline-block;
        }

        .sender-logo img {
            width: 100%;
            height: 100%;
            object-fit: contain;
        }

        .sender-logo-placeholder {
            width: 80px;
            height: 80px;
            background: linear-gradient(140deg, #8f5c36 0%, #bf9066 100%);
            display: inline-block;
            text-align: center;
            line-height: 80px;
            color: #fbfaf7;
            font-weight: 700;
            font-size: 24px;
            border-radius: 8px;
        }

        .header-section {
            display: table;
            width: 100%;
            margin-bottom: 20px;
        }

        .recipient-column {
            display: table-cell;
            vertical-align: top;
            width: 50%;
            padding-right: 16px;
        }

        .recipient-name {
            font-size: 11px;
            font-weight: 700;
            color: #1f2129;
            margin-bottom: 8px;
        }

        .recipient-address {
            font-size: 9px;
            color: #43495d;
            line-height: 1.6;
        }

        .sender-column {
            display: table-cell;
            vertical-align: top;
            width: 50%;
            text-align: right;
            padding-left: 16px;
        }

        .sender-name {
            font-size: 11px;
            font-weight: 700;
            color: #1f2129;
            margin-bottom: 8px;
        }

        .sender-contact {
            font-size: 9px;
            color: #43495d;
            line-height: 1.6;
        }

        .document-title-section {
            margin-bottom: 15px;
            border-bottom: 2px solid #1f2129;
            padding-bottom: 8px;
        }

        .document-title {
            font-size: 15px;
            font-weight: 700;
            color: #1f2129;
            margin-bottom: 5px;
        }

        .document-date {
            font-size: 9px;
            color: #43495d;
        }

        .items-table-wrapper {
            margin-bottom: 15px;
        }

        .items-table {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid #1f2129;
        }

        .items-table thead {
            background: #f4f1ea;
        }

        .items-table th {
            padding: 8px 10px;
            font-size: 9px;
            text-align: left;
            border: 1px solid #1f2129;
            font-weight: 600;
            background: #f4f1ea;
        }

        .items-table td {
            padding: 8px 10px;
            border: 1px solid #1f2129;
            font-size: 9px;
            vertical-align: top;
        }

        .items-table td:last-child,
        .items-table th:last-child {
            text-align: right;
        }

        .item-description {
            font-weight: 600;
        }

        .item-additional-info {
            font-size: 8.5px;
            color: #43495d;
            margin-top: 3px;
            line-height: 1.4;
        }

        .summary-section {
            margin-bottom: 15px;
            text-align: right;
        }

        .summary-table {
            width: 350px;
            border-collapse: collapse;
            margin-left: auto;
            margin-right: 0;
        }

        .summary-table td {
            padding: 6px 10px;
            font-size: 9px;
            border: 1px solid #1f2129;
        }

        .summary-table td:first-child {
            text-align: left;
            background: #f4f1ea;
            font-weight: 600;
        }

        .summary-table td:last-child {
            text-align: right;
        }

        .summary-table .total-row {
            font-weight: 700;
            font-size: 11px;
            background: #f4f1ea;
        }

        .footer {
            position: fixed;
            bottom: 0;
            left: 10mm;
            right: 10mm;
            background: #fbfaf7;
            padding: 10px 0;
            font-size: 8px;
            width: calc(100% - 20mm);
            page-break-inside: avoid;
            box-sizing: border-box;
        }

        .footer-bottom {
            padding: 10px 0;
            margin: 0;
            width: 100%;
            box-sizing: border-box;
        }

        .footer-notes {
            font-size: 8px;
            line-height: 1.5;
            margin-bottom: 10px;
            width: 100%;
            box-sizing: border-box;
        }

        .footer-notes p {
            margin-bottom: 3px;
        }

        .footer-notes strong {
            font-weight: 700;
        }

        .footer-signature {
            display: table;
            width: 100%;
            margin-top: 15px;
            table-layout: fixed;
            box-sizing: border-box;
        }

        .footer-signature-box {
            display: table-cell;
            width: 50%;
            padding: 0 10px;
            vertical-align: top;
            box-sizing: border-box;
        }

        .footer-signature-box:first-child {
            padding-left: 0;
        }

        .footer-signature-box:last-child {
            padding-right: 0;
        }

        .footer-signature-line {
            border-top: 1px solid #1f2129;
            padding-top: 5px;
            margin-top: 20px;
            font-size: 7.5px;
            text-transform: uppercase;
            width: 100%;
            box-sizing: border-box;
        }
    </style>
</head>

<body>
    <div class="document-container">
        <div class="sender-logo-container">
            @if(isset($logoBase64) && $logoBase64)
            <div class="sender-logo">
                <img src="{{ $logoBase64 }}" alt="{{ $quotation->tenant->business_name ?? 'Logo' }}">
            </div>
            @else
            <div class="sender-logo-placeholder">
                {{ $quotation->tenant ? strtoupper(substr($quotation->tenant->business_name ?? 'ET', 0, 2)) : 'ET' }}
            </div>
            @endif
        </div>

        <div class="header-section">
            <div class="recipient-column">
                <div class="recipient-name">{{ $quotation->customer_name ?: 'Walk-in Customer' }}</div>
                <div class="recipient-address">
                    @if ($quotation->customer_address)
                    {{ $quotation->customer_address }}<br>
                    @endif
                    @if ($quotation->customer_phone)
                    Tel: {{ $quotation->customer_phone }}<br>
                    @endif
                    @if ($quotation->customer_cnic)
                    CNIC: {{ $quotation->customer_cnic }}
                    @endif
                </div>
            </div>
            <div class="sender-column">
                <div class="sender-name">{{ $quotation->tenant->business_name ?? 'Elite Tiles & Marble' }}</div>
                <div class="sender-contact">
                    @if($quotation->tenant && $quotation->tenant->business_address)
                    {{ $quotation->tenant->business_address }}<br>
                    @endif
                    @if($quotation->tenant && $quotation->tenant->business_phone)
                    Tel: {{ $quotation->tenant->business_phone }}<br>
                    @endif
                    @if($quotation->tenant && $quotation->tenant->business_email)
                    E-Mail: {{ $quotation->tenant->business_email }}<br>
                    @endif
                </div>
            </div>
        </div>

        <div class="document-title-section">
            <div class="document-title">
                {{ strtoupper($quotation->type === 'quotation' ? 'Quotation' : 'Invoice') }} - {{ $quotation->quotation_number }}
            </div>
            <div class="document-date">
                Date: {{ $quotation->invoice_date?->format('d.m.Y') ?? $quotation->created_at->format('d.m.Y') }}
                @if ($quotation->type === 'quotation' && $quotation->due_date)
                | Due Date: {{ $quotation->due_date->format('d.m.Y') }}
                @endif
            </div>
        </div>

        <div class="items-table-wrapper">
            <table class="items-table">
                <thead>
                    <tr>
                        <th style="width: 35%;">Description</th>
                        <th style="width: 35%;">Additional Information</th>
                        <th style="width: 10%;">Quantity</th>
                        <th style="width: 20%;">Price Net</th>
                    </tr>
                </thead>
                <tbody>
                    @if($quotation->items && $quotation->items->count() > 0)
                    @foreach($quotation->items as $item)
                    <tr>
                        <td>
                            <div class="item-description">{{ $item->item_name }}</div>
                        </td>
                        <td>
                            <div class="item-additional-info">
                                @if($item->item_type === 'tile')
                                Type: Tile<br>
                                @if($item->tile)
                                @if($item->tile->packing_m2 ?? null)
                                Packing: {{ number_format($item->tile->packing_m2, 2) }} m²<br>
                                @endif
                                @if($item->tile->no_of_tiles_per_box)
                                Tiles/Box: {{ $item->tile->no_of_tiles_per_box }}<br>
                                @endif
                                @endif
                                @if($item->total_area)
                                Area: {{ number_format($item->total_area, 2) }} sq.ft<br>
                                @endif
                                @if($item->room_type)
                                Room: {{ $item->room_type }} - {{ $item->surface_type ?? '' }}<br>
                                @endif
                                @else
                                Type: Product<br>
                                @if($item->product && $item->product->brand)
                                Brand: {{ $item->product->brand->brand_name ?? '—' }}<br>
                                @endif
                                Unit Price: Rs {{ number_format($item->unit_price, 2) }}
                                @endif
                            </div>
                        </td>
                        <td>
                            @if($item->item_type === 'tile')
                            {{ $item->boxes_required ?? 0 }}
                            @if(($item->loose_tiles ?? 0) > 0)
                            + {{ $item->loose_tiles }} loose
                            @endif
                            @else
                            {{ number_format($item->quantity, 2) }}
                            @endif
                        </td>
                        <td>Rs {{ number_format($item->subtotal, 2) }}</td>
                    </tr>
                    @endforeach
                    @endif
                </tbody>
            </table>
        </div>

        <div class="summary-section">
            <table class="summary-table">
                <tr>
                    <td>Total Net</td>
                    <td>Rs {{ number_format($subtotal ?? $quotation->items->sum('subtotal'), 2) }}</td>
                </tr>
                @if ($quotation->discount_amount > 0)
                <tr>
                    <td>Discount ({{ number_format($quotation->discount_percentage, 2) }}%)</td>
                    <td>- Rs {{ number_format($quotation->discount_amount, 2) }}</td>
                </tr>
                @endif
                @if ($quotation->tax_amount > 0)
                <tr>
                    <td>Tax ({{ number_format($quotation->tax_percentage, 2) }}%)</td>
                    <td>Rs {{ number_format($quotation->tax_amount, 2) }}</td>
                </tr>
                @endif
                <tr class="total-row">
                    <td>Total Amount</td>
                    <td>Rs {{ number_format($quotation->total_amount, 2) }}</td>
                </tr>
                @if ($quotation->type === 'invoice')
                <tr>
                    <td>Paid Amount</td>
                    <td>Rs {{ number_format($quotation->paid_amount, 2) }}</td>
                </tr>
                <tr>
                    <td>Balance Due</td>
                    <td>Rs {{ number_format(max($quotation->remaining_amount, 0), 2) }}</td>
                </tr>
                @endif
            </table>
        </div>
    </div>

    <div class="footer">
        <div class="footer-bottom">
            <div class="footer-notes">
                @if($quotation->notes)
                <p><strong>Notes:</strong> {{ $quotation->notes }}</p>
                @endif
                <p><strong>Terms & Conditions:</strong></p>
                <p>• Inspect tiles before installation; returns accepted within 7 days in original packaging.</p>
                <p>• Recommended wastage allows for trimming and breakage.</p>
                <p>• Contact us for delivery scheduling or design assistance.</p>
                @if($quotation->type === 'quotation')
                <p>Please confirm acceptance of this quotation by email. With email confirmation, you accept our terms and conditions.</p>
                @endif
            </div>

            <div class="footer-signature">
                <div class="footer-signature-box">
                    <div class="footer-signature-line">Customer Signature</div>
                </div>
                <div class="footer-signature-box">
                    <div class="footer-signature-line">Authorized By</div>
                </div>
            </div>
        </div>
    </div>
</body>

</html>
