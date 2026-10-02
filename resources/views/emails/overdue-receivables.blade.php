<x-mail::message>
# Overdue Receivables Reminder

You have {{ $count }} outstanding receivable(s) totaling Rs {{ number_format($total, 2) }}.

Please follow up with customers for payment.

<x-mail::button :url="route('accounts-receivables.index')" color="primary">
View Receivables
</x-mail::button>

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
