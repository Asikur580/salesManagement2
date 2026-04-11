<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Invoice - {{ $order->order_number }}</title>
    <style>
        body {
            font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif;
            color: #333;
            line-height: 1.6;
            margin: 0;
            padding: 0;
        }

        .container {
            width: 100%;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }

        .header {
            border-bottom: 2px solid #FF4E00;
            padding-bottom: 20px;
            margin-bottom: 20px;
        }

        .header-table {
            width: 100%;
        }

        .brand-name {
            font-size: 28px;
            font-weight: 900;
            color: #FF4E00;
            font-style: italic;
            text-transform: uppercase;
        }

        .invoice-title {
            text-align: right;
            font-size: 24px;
            font-weight: bold;
            color: #111;
            text-transform: uppercase;
        }

        .info-table {
            width: 100%;
            margin-bottom: 30px;
        }

        .info-col {
            width: 50%;
            vertical-align: top;
        }

        .section-title {
            font-size: 10px;
            text-transform: uppercase;
            font-weight: 900;
            color: #888;
            margin-bottom: 5px;
            letter-spacing: 1px;
        }

        .info-box {
            background-color: #f9f9f9;
            padding: 15px;
            border-radius: 10px;
            border-left: 4px solid #FF4E00;
        }

        .info-text {
            font-size: 13px;
            font-weight: 700;
            color: #111;
        }

        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }

        .items-table th {
            background-color: #FF4E00;
            color: #fff;
            text-align: left;
            padding: 12px 15px;
            font-size: 12px;
            text-transform: uppercase;
            font-weight: 900;
        }

        .items-table td {
            padding: 12px 15px;
            border-bottom: 1px solid #eee;
            font-size: 13px;
            font-weight: bold;
        }

        .items-table tr:nth-child(even) {
            background-color: #fafafa;
        }

        .summary-table {
            width: 100%;
            margin-top: 20px;
        }

        .summary-row td {
            padding: 5px 0;
            font-size: 14px;
            font-weight: bold;
        }

        .summary-label {
            text-align: right;
            color: #666;
            padding-right: 20px;
        }

        .summary-value {
            text-align: right;
            width: 150px;
        }

        .total-row td {
            padding-top: 15px;
            border-top: 2px solid #111;
            font-size: 20px;
            font-weight: 900;
            color: #FF4E00;
        }

        .footer {
            margin-top: 50px;
            text-align: center;
            font-size: 11px;
            color: #888;
            border-top: 1px solid #eee;
            padding-top: 20px;
        }

        .status-badge {
            display: inline-block;
            padding: 4px 10px;
            border-radius: 20px;
            font-size: 10px;
            font-weight: 900;
            text-transform: uppercase;
            margin-top: 5px;
        }

        .status-completed { background-color: #E8F5E9; color: #2E7D32; }
        .status-pending { background-color: #FFF3E0; color: #E65100; }
        .status-cancelled { background-color: #FFEBEE; color: #C62828; }

    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <table class="header-table">
                <tr>
                    <td>
                        <div class="brand-name">CARMART</div>
                        <div style="font-size: 11px; color: #666;">Modern Automotive Parts Store</div>
                    </td>
                    <td class="invoice-title">
                        INVOICE
                        <div style="font-size: 14px; color: #FF4E00; margin-top: 5px;">#{{ $order->order_number }}</div>
                    </td>
                </tr>
            </table>
        </div>

        <!-- Info Section -->
        <table class="info-table">
            <tr>
                <td class="info-col">
                    <div class="section-title">Bill To:</div>
                    <div class="info-box">
                        <div class="info-text">{{ $order->user->name }}</div>
                        <div class="info-text" style="color: #666; font-weight: normal; margin-top: 2px;">
                            {{ $order->phone }}<br>
                            {{ $order->email }}<br>
                            {{ $order->shipping_address ?? 'No Address Provided' }}
                        </div>
                    </div>
                </td>
                <td class="info-col" style="padding-left: 20px;">
                    <div class="section-title">Order Info:</div>
                    <div class="info-box" style="border-left-color: #111;">
                        <table style="width: 100%;">
                            <tr>
                                <td style="font-size: 12px; color: #888;">Date:</td>
                                <td style="font-size: 12px; font-weight: bold; text-align: right;">{{ $order->created_at->format('M d, Y') }}</td>
                            </tr>
                            <tr>
                                <td style="font-size: 12px; color: #888;">Status:</td>
                                <td style="text-align: right;">
                                    <span class="status-badge status-{{ strtolower($order->status) }}">
                                        {{ $order->status }}
                                    </span>
                                </td>
                            </tr>
                            <tr>
                                <td style="font-size: 12px; color: #888;">Payment:</td>
                                <td style="font-size: 12px; font-weight: bold; text-align: right; text-transform: uppercase;">{{ $order->payment_method ?? 'COD' }}</td>
                            </tr>
                        </table>
                    </div>
                </td>
            </tr>
        </table>

        <!-- Items Table -->
        <table class="items-table">
            <thead>
                <tr>
                    <th style="width: 50px;">SL.</th>
                    <th>PRODUCT DESCRIPTION</th>
                    <th style="text-align: center; width: 80px;">QTY</th>
                    <th style="text-align: right; width: 120px;">PRICE</th>
                    <th style="text-align: right; width: 120px;">TOTAL</th>
                </tr>
            </thead>
            <tbody>
                @foreach($order->items as $index => $item)
                <tr>
                    <td>{{ $index + 1 }}</td>
                    <td>
                        <div style="font-weight: 900; text-transform: uppercase;">{{ $item->product_name }}</div>
                        @if($item->variant)
                        <div style="font-size: 11px; color: #888; margin-top: 2px;">Variant: {{ $item->variant->name }}</div>
                        @endif
                    </td>
                    <td style="text-align: center;">{{ $item->quantity }}</td>
                    <td style="text-align: right; width: 120px;">Tk. {{ number_format($item->unit_price, 2) }}</td>
                    <td style="text-align: right; width: 120px;">Tk. {{ number_format($item->total_price, 2) }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>

        <!-- Summary -->
        <table class="summary-table">
            <tr class="summary-row">
                <td class="summary-label">Subtotal</td>
                <td class="summary-value">Tk. {{ number_format($order->total_amount - $order->shipping_amount + $order->discount_amount - $order->tax_amount, 2) }}</td>
            </tr>
            <tr class="summary-row">
                <td class="summary-label">Tax</td>
                <td class="summary-value">Tk. {{ number_format($order->tax_amount, 2) }}</td>
            </tr>
            <tr class="summary-row">
                <td class="summary-label">Shipping Cost</td>
                <td class="summary-value">Tk. {{ number_format($order->shipping_amount, 2) }}</td>
            </tr>
            @if($order->discount_amount > 0)
            <tr class="summary-row">
                <td class="summary-label">Discount</td>
                <td class="summary-value">-Tk. {{ number_format($order->discount_amount, 2) }}</td>
            </tr>
            @endif
            <tr class="total-row">
                <td class="summary-label">Grand Total</td>
                <td class="summary-value">Tk. {{ number_format($order->total_amount, 2) }}</td>
            </tr>
        </table>

        <!-- Footer -->
        <div class="footer">
            <p style="font-weight: bold; color: #111; margin-bottom: 5px;">Thank you for shopping with CarMart!</p>
            <p>This is a computer generated invoice and does not require a physical signature.</p>
            <p style="margin-top: 10px;">{{ config('app.url') }} | Support: support@carmart.com</p>
        </div>
    </div>
</body>
</html>
