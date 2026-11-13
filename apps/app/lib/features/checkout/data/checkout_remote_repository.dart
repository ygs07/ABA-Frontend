import 'package:dio/dio.dart';
import '../../account/domain/customer_order.dart';
import '../../shop/domain/shop_entities.dart';
import '../domain/checkout_entities.dart';
import '../domain/checkout_repository.dart';

class CheckoutRemoteRepository implements CheckoutRepository {
  CheckoutRemoteRepository(this._dio);
  final Dio _dio;

  @override
  Future<List<CheckoutAddress>> getSavedAddresses() async {
    final response = await _dio.get('/customer/addresses');
    final data = response.data['data'] as List<dynamic>;
    return data.map((json) {
      return CheckoutAddress(
        id: json['id'] as String,
        label: json['label'] as String? ?? 'Address',
        fullName: json['fullName'] as String,
        street: json['street'] as String,
        city: json['city'] as String,
        state: json['state'] as String,
        zipCode: json['zipCode'] as String? ?? '',
        phone: json['phone'] as String,
        isDefault: json['isDefault'] as bool? ?? false,
      );
    }).toList();
  }

  @override
  Future<List<DeliveryMethod>> getDeliveryMethods() async {
    final response = await _dio.get('/checkout/delivery-methods');
    final data = response.data['data'] as List<dynamic>;
    return data.map((json) {
      return DeliveryMethod(
        id: json['id'] as String,
        name: json['name'] as String,
        duration: json['duration'] as String,
        cost: (json['cost'] as num).toDouble(),
      );
    }).toList();
  }

  @override
  Future<List<ReferralCandidate>> searchReferrals(String query) async {
    final response = await _dio.get(
      '/referrals/lookup',
      queryParameters: {'query': query},
    );
    final data = response.data['data'] as List<dynamic>;
    return data.map((json) {
      return ReferralCandidate(
        id: json['id'] as String,
        name: json['name'] as String,
        moniker: json['moniker'] as String,
        code: json['code'] as String,
        imageUrl: json['imageUrl'] as String? ?? '',
      );
    }).toList();
  }

  @override
  Future<CheckoutOrderResult> placeOrder({
    required Cart cart,
    required CheckoutCustomerInfo customerInfo,
    required CheckoutAddress address,
    required DeliveryMethod deliveryMethod,
    required CheckoutPaymentType paymentType,
    ReferralCandidate? referral,
  }) async {
    final payload = {
      'customer': {
        'firstName': customerInfo.firstName,
        'lastName': customerInfo.lastName,
        'email': customerInfo.email,
        'phone': customerInfo.phone,
      },
      'address': {
        'street': address.street,
        'city': address.city,
        'state': address.state,
        'zipCode': address.zipCode,
        'phone': address.phone,
      },
      'deliveryMethodId': deliveryMethod.id,
      'paymentMethod': paymentType.name,
      'referralCode': referral?.code,
      'items': cart.items
          .map(
            (i) => {
              'productId': i.product.id,
              'quantity': i.quantity,
              'color': i.selectedColor,
              'size': i.selectedSize,
            },
          )
          .toList(),
    };

    final response = await _dio.post('/checkout/process', data: payload);
    final data = response.data['data'] as Map<String, dynamic>;
    final orderJson = data['order'] as Map<String, dynamic>;

    return CheckoutOrderResult(
      orderId: data['orderId'] as String,
      status: data['status'] as String? ?? 'Processing',
      totalAmount: (data['totalAmount'] as num).toDouble(),
      createdAt: DateTime.parse(data['createdAt'] as String),
      order: CustomerOrder.fromJson(orderJson),
    );
  }
}
