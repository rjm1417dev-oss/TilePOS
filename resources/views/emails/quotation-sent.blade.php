<x-mail::message>
# {{ $isInvoice ? 'Invoice' : 'Quotation' }} {{ $quotation->quotation_number }}

A new {{ $isInvoice ? 'invoice' : 'quotation' }} has been created for {{ $quotation->customer_name ?? 'Walk-in Customer' }}.

**Total:** Rs {{ number_format($quotation->total_amount, 2) }}

<x-mail::button :url="route('quotations.show', $quotation)" color="primary">
View {{ $isInvoice ? 'Invoice' : 'Quotation' }}
</x-mail::button>

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
