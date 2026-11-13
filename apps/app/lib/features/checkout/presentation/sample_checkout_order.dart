import '../../account/domain/customer_order.dart';

final CustomerOrder sampleCheckoutOrder = CustomerOrder.fromJson(const {
  "id": 1840,
  "customer_id": 4,
  "delivery_address_id": 106,
  "delivery_method": "standard",
  "delivery_cost": "1500.00",
  "payment_method": 2,
  "order_number": "ORD-1794469321863-80W6RGIQ",
  "total_amount": "13459.00",
  "status": "pending",
  "referral_code_id": null,
  "referring_marketer_id": null,
  "deliveryAddress": {
    "id": 106,
    "customer_id": 4,
    "name": "Office/Work",
    "street": "nexus road",
    "city": "Aba",
    "state": "Abia",
    "zip": "450001",
    "createdAt": "2026-10-31T06:16:30.601Z",
    "updatedAt": "2026-10-31T06:16:30.601Z"
  },
  "referralCode": null,
  "payments": [
    {
      "id": 1844,
      "order_id": 1840,
      "payment_type": "order",
      "source_type": "order",
      "source_id": 1840,
      "payment_gateway_id": null,
      "reference": "WALLET-ORDER-1840",
      "gateway_transaction_id": null,
      "amount": "13459.00",
      "currency": "NGN",
      "status": "successful",
      "payment_method": "wallet",
      "paid_at": "2026-11-12T07:42:02.281Z",
      "metadata": {
        "orderId": 1840,
        "orderNumber": "ORD-1794469321863-80W6RGIQ"
      },
      "failure_reason": null,
      "createdAt": "2026-11-12T07:42:02.281Z",
      "updatedAt": "2026-11-12T07:42:02.281Z"
    }
  ],
  "items": [
    {
      "id": 343,
      "order_id": 1840,
      "product_variant_id": 1448,
      "quantity": 1,
      "unit_price": "11959.00",
      "total_price": "11959.00",
      "status": "pending",
      "productVariant": {
        "id": 1448,
        "product_id": 729,
        "merchant_id": 87,
        "name": "Blue",
        "sku": "VAR-729-BLUE",
        "barcode": null,
        "price": "11959.00",
        "is_on_sale": false,
        "on_sale_price": null,
        "cost_price": null,
        "variant_cost_price": "10000.00",
        "variant_selling_price": "11959.00",
        "weight": null,
        "attributes": null,
        "is_active": true,
        "product": {
          "id": 729,
          "category_id": 2,
          "subcategory_id": null,
          "name": "Shoe Test",
          "slug": "shoe-test",
          "description": null,
          "brand_id": 1,
          "is_active": true,
          "base_cost_price": "10000.00",
          "base_selling_price": "11959.00",
          "base_unit_of_measurement": "piece",
          "type": 1,
          "reorder_level": 2,
          "reorder_quantity": 2,
          "merchant_id": 87,
          "images": [
            {
              "id": 560,
              "url": "/api/v1/media/local/560",
              "original_name": "shoe-brown-slides.jpeg"
            }
          ],
          "createdAt": "2026-11-07T06:51:54.675Z",
          "updatedAt": "2026-11-07T06:51:54.688Z",
          "deletedAt": null
        },
        "createdAt": "2026-11-07T06:51:56.385Z",
        "updatedAt": "2026-11-07T06:51:56.385Z",
        "deletedAt": null
      },
      "createdAt": "2026-11-12T07:42:01.853Z",
      "updatedAt": "2026-11-12T07:42:01.853Z"
    }
  ],
  "createdAt": "2026-11-12T07:42:01.853Z",
  "updatedAt": "2026-11-12T07:42:02.288Z"
});
