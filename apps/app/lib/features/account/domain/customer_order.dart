enum OrderStatus {
  pending('Pending'),
  processing('Processing'),
  shipped('Shipped'),
  delivered('Delivered'),
  cancelled('Cancelled');

  const OrderStatus(this.label);
  final String label;

  factory OrderStatus.fromString(String value) {
    return OrderStatus.values.firstWhere(
      (e) =>
          e.name.toLowerCase() == value.toLowerCase() ||
          e.label.toLowerCase() == value.toLowerCase(),
      orElse: () => OrderStatus.pending,
    );
  }
}

class ShippingAddress {
  final String fullName;
  final String street;
  final String city;
  final String zipCode;
  final String phone;

  ShippingAddress({
    required this.fullName,
    required this.street,
    required this.city,
    required this.zipCode,
    required this.phone,
  });

  factory ShippingAddress.fromJson(Map<String, dynamic> json) {
    return ShippingAddress(
      fullName: json['fullName'] as String,
      street: json['street'] as String,
      city: json['city'] as String,
      zipCode: json['zipCode'] as String,
      phone: json['phone'] as String,
    );
  }
}

class OrderItem {
  final String id;
  final String productId;
  final String productName;
  final int price;
  final int quantity;

  OrderItem({
    required this.id,
    required this.productId,
    required this.productName,
    required this.price,
    required this.quantity,
  });

  factory OrderItem.fromJson(Map<String, dynamic> json) {
    return OrderItem(
      id: json['id'] as String,
      productId: json['productId'] as String,
      productName: json['productName'] as String,
      price: json['price'] as int,
      quantity: json['quantity'] as int,
    );
  }
}

class CustomerOrder {
  final String id;
  final DateTime date;
  final OrderStatus status;
  final int total;
  final String paymentMethod;
  final ShippingAddress shippingAddress;
  final List<OrderItem> items;

  CustomerOrder({
    required this.id,
    required this.date,
    required this.status,
    required this.total,
    required this.paymentMethod,
    required this.shippingAddress,
    required this.items,
  });

  factory CustomerOrder.fromJson(Map<String, dynamic> json) {
    return CustomerOrder(
      id: json['id'] as String,
      date: DateTime.parse(json['date'] as String),
      status: OrderStatus.fromString(json['status'] as String),
      total: json['total'] as int,
      paymentMethod: json['paymentMethod'] as String,
      shippingAddress: ShippingAddress.fromJson(
        json['shippingAddress'] as Map<String, dynamic>,
      ),
      items: (json['items'] as List<dynamic>)
          .map((item) => OrderItem.fromJson(item as Map<String, dynamic>))
          .toList(),
    );
  }
}
