<x-mail::message>
# Low Stock Alert

{{ $count }} item(s) are below the minimum stock level or out of stock.

Please review your stock levels and reorder as needed.

<x-mail::button :url="route('stocks.index')" color="primary">
View Stock
</x-mail::button>

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
