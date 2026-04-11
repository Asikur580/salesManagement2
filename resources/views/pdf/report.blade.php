<!DOCTYPE html>
<html>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Sales Report</title>
    <style>
        body { font-family: 'DejaVu Sans', sans-serif; font-size: 12px; color: #333; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #eee; padding-bottom: 10px; }
        .header h1 { margin: 0; color: #111; }
        .meta { margin-bottom: 20px; }
        .stats-grid { width: 100%; margin-bottom: 30px; }
        .stat-box { background: #f9f9f9; padding: 15px; border-radius: 5px; text-align: center; border: 1px solid #eee; width: 30%; display: inline-block; margin-right: 2%; }
        .stat-box h3 { margin: 0; font-size: 10px; text-transform: uppercase; color: #777; }
        .stat-box p { margin: 5px 0 0; font-size: 18px; font-weight: bold; color: #111; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th { background: #eee; padding: 10px; text-align: left; border: 1px solid #ddd; }
        td { padding: 10px; border: 1px solid #ddd; }
        .text-right { text-align: right; }
        .footer { position: fixed; bottom: 0; width: 100%; text-align: center; font-size: 10px; color: #aaa; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Sales Analysis Report</h1>
        <p>Generated on: {{ date('F j, Y, g:i a') }}</p>
    </div>

    <div class="meta">
        <strong>Report Period:</strong> {{ $start_date }} to {{ $endDate ?? $end_date }}
    </div>

    <div class="stats-grid">
        <div class="stat-box">
            <h3>Total Revenue</h3>
            <p>TK {{ number_format($summary['total_revenue']) }}</p>
        </div>
        <div class="stat-box">
            <h3>Estimated Profit</h3>
            <p>TK {{ number_format($profit) }}</p>
        </div>
        <div class="stat-box">
            <h3>Total Orders</h3>
            <p>{{ $summary['total_orders'] }}</p>
        </div>
    </div>

    <h3>Top Selling Products</h3>
    <table>
        <thead>
            <tr>
                <th>Product Name</th>
                <th class="text-right">Qty Sold</th>
                <th class="text-right">Revenue</th>
            </tr>
        </thead>
        <tbody>
            @foreach($top_products as $product)
            <tr>
                <td>{{ $product->name }}</td>
                <td class="text-right">{{ $product->total_quantity }}</td>
                <td class="text-right">TK {{ number_format($product->total_revenue) }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <h3>Sales by Source</h3>
    <table>
        <thead>
            <tr>
                <th>Source</th>
                <th class="text-right">Order Count</th>
                <th class="text-right">Total Amount</th>
            </tr>
        </thead>
        <tbody>
            @foreach($source_report as $item)
            <tr>
                <td>{{ strtoupper($item->source) }}</td>
                <td class="text-right">{{ $item->count }}</td>
                <td class="text-right">TK {{ number_format($item->total) }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        © {{ date('Y') }} Sales Management System. All rights reserved.
    </div>
</body>
</html>
