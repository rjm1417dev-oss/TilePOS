<!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8">
    <title>{{ ucfirst($tileReturn->type) }} Receipt - {{ $tileReturn->receipt_number }}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }

        @page { margin: 10mm; margin-bottom: 80mm; }

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

        .document-container { max-width: 100%; margin: 0 auto; padding: 20px; }

        .sender-logo-container { text-align: right; margin-bottom: 10px; }

        .sender-logo { width: 80px; height: 80px; display: inline-block; }
        .sender-logo img { width: 100%; height: 100%; object-fit: contain; }

        .sender-logo-placeholder {
            width: 80px; height: 80px;
            background: linear-gradient(140deg, #8f5c36 0%, #bf9066 100%);
            display: inline-block;
            text-align: center;
            line-height: 80px;
            color: #fbfaf7;
            font-weight: 700;
            font-size: 24px;
            border-radius: 8px;
        }

        .header-section { display: table; width: 100%; margin-bottom: 20px; }

        .recipient-column { display: table-cell; vertical-align: top; width: 50%; padding-right: 16px; }
        .recipient-name { font-size: 11px; font-weight: 700; color: #1f2129; margin-bottom: 8px; }
        .recipient-address { font-size: 9px; color: #43495d; line-height: 1.6; }

        .sender-column { display: table-cell; vertical-align: top; width: 50%; text-align: right; padding-left: 16px; }
        .sender-name { font-size: 11px; font-weight: 700; color: #1f2129; margin-bottom: 8px; }
        .sender-contact { font-size: 9px; color: #43495d; line-height: 1.6; }

        .document-title-section {
            margin-bottom: 15px;
            border-bottom: 2px solid #1f2129;
            padding-bottom: 8px;
        }
        .document-title { font-size: 15px; font-weight: 700; color: #1f2129; margin-bottom: 5px; }
        .document-date { font-size: 9px; color: #43495d; }

        .items-table { width: 100%; border-collapse: collapse; border: 1px solid #1f2129; }
        .items-table thead { background: #f4f1ea; }
        .items-table th {
            padding: 8px 10px; font-size: 9px; text-align: left;
            border: 1px solid #1f2129; font-weight: 600;
        }
        .items-table td { padding: 8px 10px; border: 1px solid #1f2129; font-size: 9px; }
        .items-table td:last-child, .items-table th:last-child { text-align: right; }

        .summary-section { margin-bottom: 15px; text-align: right; }
        .summary-table {
            width: 350px; border-collapse: collapse;
            margin-left: auto; margin-right: 0;
        }
        .summary-table td { padding: 6px 10px; font-size: 9px; border: 1px solid #1f2129; }
        .summary-table td:first-child { text-align: left; background: #f4f1ea; font-weight: 600; }
        .summary-table td:last-child { text-align: right; }
        .summary-table .total-row { font-weight: 700; font-size: 11px; background: #f4f1ea; }

        .footer {
            position: fixed; bottom: 0; left: 10mm; right: 10mm;
            background: #fbfaf7; padding: 10px 0; font-size: 8px;
            width: calc(100% - 20mm); page-break-inside: avoid;
        }
        .footer-signature { display: table; width: 100%; margin-top: 15px; table-layout: fixed; }
        .footer-signature-box { display: table-cell; width: 50%; padding: 0 10px; vertical-align: top; }
        .footer-signature-line { border-top: 1px solid #1f2129; padding-top: 5px; margin-top: 20px; font-size: 7.5px; text-transform: uppercase; }
    </style>
</head>

<body>
    <div class="document-container">
        <div class="sender-logo-container">
            @if(isset($logoBase64) && $logoBase64)
            <div class="sender-logo"><img src="{{ $logoBase64 }}" alt="Logo"></div>
            @else
            <div class="sender-logo-placeholder">{{ $tileReturn->tenant ? strtoupper(substr($tileReturn->tenant->business_name ?? 'RT', 0, 2)) : 'RT' }}</div>
            @endif
        </div>

        <div class="header-section">
            <div class="recipient-column">
                <div class="recipient-name">{{ $tileReturn->customer?->name ?? '—' }}</div>
            </div>
            <div class="sender-column">
                <div class="sender-name">{{ $tileReturn->tenant->business_name ?? 'Business' }}</div>
                <div class="sender-contact">
                    @if($tileReturn->tenant && $tileReturn->tenant->business_address){{ $tileReturn->tenant->business_address }}<br>@endif
                    @if($tileReturn->tenant && $tileReturn->tenant->business_phone)Tel: {{ $tileReturn->tenant->business_phone }}<br>@endif
                    @if($tileReturn->tenant && $tileReturn->tenant->business_email)E-Mail: {{ $tileReturn->tenant->business_email }}@endif
                </div>
            </div>
        </div>

        <div class="document-title-section">
            <div class="document-title">{{ strtoupper($tileReturn->type) }} RECEIPT - {{ $tileReturn->receipt_number }}</div>
            <div class="document-date">Date: {{ $tileReturn->created_at->format('d.m.Y H:i') }}</div>
        </div>

        <div class="items-table-wrapper" style="margin-bottom: 15px;">
            <table class="items-table">
                <thead>
                    <tr>
                        <th style="width: 40%;">Description</th>
                        <th style="width: 20%;">Quantity</th>
                        <th style="width: 40%;">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>
                            @php
                                $rt = $tileReturn->returnTile;
                                $tileLabel = $rt ? ($rt->tile_code ?? 'N/A') . ($rt->brand ? ' - ' . $rt->brand->brand_name : '') . ($rt->size ? ' (' . $rt->size->size_in_inches . ')' : '') : '—';
                            @endphp
                            {{ $tileLabel }}
                        </td>
                        <td>
                            {{ $tileReturn->return_no_of_boxes }} box(es)
                            @if($tileReturn->return_no_of_tiles > 0)
                            + {{ $tileReturn->return_no_of_tiles }} loose
                            @endif
                        </td>
                        <td>Rs {{ number_format($tileReturn->return_total_amount, 2) }}</td>
                    </tr>
                    @if($tileReturn->type === 'exchange' && $tileReturn->exchange_tile_id)
                    <tr>
                        <td>
                            @php
                                $et = $tileReturn->exchangeTile;
                                $exLabel = $et ? ($et->tile_code ?? 'N/A') . ($et->brand ? ' - ' . $et->brand->brand_name : '') . ($et->size ? ' (' . $et->size->size_in_inches . ')' : '') : '—';
                            @endphp
                            Exchange: {{ $exLabel }}
                        </td>
                        <td>
                            {{ $tileReturn->exchange_no_of_boxes ?? 0 }} box(es)
                            @if(($tileReturn->exchange_no_of_tiles ?? 0) > 0)
                            + {{ $tileReturn->exchange_no_of_tiles }} loose
                            @endif
                        </td>
                        <td>Rs {{ number_format($tileReturn->exchange_total_amount ?? 0, 2) }}</td>
                    </tr>
                    @endif
                </tbody>
            </table>
        </div>

        <div class="summary-section">
            <table class="summary-table">
                <tr class="total-row">
                    <td>Total Amount</td>
                    <td>Rs {{ number_format($tileReturn->return_total_amount, 2) }}</td>
                </tr>
                @if($tileReturn->type === 'exchange' && $tileReturn->payment_difference != 0)
                <tr>
                    <td>Payment Difference</td>
                    <td>Rs {{ number_format($tileReturn->payment_difference ?? 0, 2) }}</td>
                </tr>
                @endif
                <tr>
                    <td>Payment Method</td>
                    <td>{{ $tileReturn->return_payment_method ?? '—' }}</td>
                </tr>
            </table>
        </div>

        @if($tileReturn->return_notes)
        <div style="margin-top: 15px; border-top: 1px solid #1f2129; padding-top: 10px;">
            <strong>Notes:</strong> {{ $tileReturn->return_notes }}
        </div>
        @endif
    </div>

    <div class="footer">
        <div class="footer-signature">
            <div class="footer-signature-box"><div class="footer-signature-line">Customer Signature</div></div>
            <div class="footer-signature-box"><div class="footer-signature-line">Authorized By</div></div>
        </div>
    </div>
</body>

</html>
