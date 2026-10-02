<x-mail::message>
# Overdue Payables Reminder

You have {{ $count }} outstanding payable(s) totaling Rs {{ number_format($total, 2) }}.

Please review and settle overdue amounts.

<x-mail::button :url="route('accounts-payables.index')" color="primary">
View Payables
</x-mail::button>

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
