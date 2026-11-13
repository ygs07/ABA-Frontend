import 'package:flutter/material.dart';
import 'package:hugeicons/hugeicons.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/widgets/app_widgets.dart';
import '../../../account/domain/customer_order.dart';
import 'order_success_timeline.dart';

class OrderConfirmedCard extends StatelessWidget {
  const OrderConfirmedCard({super.key, required this.order});

  final CustomerOrder order;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final totalInNaira = order.total / 100.0;
    final address = order.shippingAddress;
    final fullName = address.fullName;
    final addressText = [
      address.street,
      address.city,
      if (address.state != null && address.state!.isNotEmpty) address.state,
      if (address.zipCode.isNotEmpty) address.zipCode,
    ].where((e) => e != null && e.isNotEmpty).join(', ');

    final paymentMethodText = order.paymentMethod.toLowerCase() == 'wallet'
        ? 'ABA Wallet'
        : order.paymentMethod.toLowerCase() == 'card'
            ? 'Card Payment'
            : order.paymentMethod;

    final deliveryMethodText = order.deliveryMethod != null
        ? '${order.deliveryMethod![0].toUpperCase()}${order.deliveryMethod!.substring(1)} Delivery'
        : 'Standard Delivery';

    return Container(
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1E1E1E) : Colors.white,
        borderRadius: AppSpacing.borderRadiusLG,
        border: Border.all(
          color: isDark ? Colors.white12 : AppColors.border,
        ),
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Order Number',
                    style: AppTypography.caption.copyWith(
                      color: AppColors.grey,
                    ),
                  ),
                  Text(
                    order.id,
                    style: AppTypography.bodyMedium.copyWith(
                      fontWeight: FontWeight.bold,
                      fontFamily: 'monospace',
                    ),
                  ),
                ],
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    'Total Paid',
                    style: AppTypography.caption.copyWith(
                      color: AppColors.grey,
                    ),
                  ),
                  Text(
                    formatNaira(totalInNaira),
                    style: AppTypography.bodyLarge.copyWith(
                      fontWeight: FontWeight.w800,
                      color: isDark ? AppColors.secondary : AppColors.primary,
                    ),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.md),
          Divider(color: isDark ? Colors.white10 : AppColors.border),
          const SizedBox(height: AppSpacing.sm),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              HugeIcon(
                icon: HugeIcons.strokeRoundedLocation01,
                color: isDark ? AppColors.secondary : AppColors.primary,
                size: 20,
              ),
              const SizedBox(width: AppSpacing.sm),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      fullName,
                      style: AppTypography.bodySmall.copyWith(
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    Text(
                      addressText,
                      style: AppTypography.caption.copyWith(
                        color: AppColors.grey,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.md),
          Divider(color: isDark ? Colors.white10 : AppColors.border),
          const SizedBox(height: AppSpacing.sm),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Delivery Method',
                style: AppTypography.caption.copyWith(
                  color: AppColors.grey,
                ),
              ),
              Text(
                order.deliveryCost != null && order.deliveryCost! > 0
                    ? '$deliveryMethodText (${formatNaira(order.deliveryCost! / 100.0)})'
                    : deliveryMethodText,
                style: AppTypography.caption.copyWith(
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.xs),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Payment Method',
                style: AppTypography.caption.copyWith(
                  color: AppColors.grey,
                ),
              ),
              Text(
                paymentMethodText,
                style: AppTypography.caption.copyWith(
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
          if (order.items.isNotEmpty) ...[
            const SizedBox(height: AppSpacing.md),
            Divider(color: isDark ? Colors.white10 : AppColors.border),
            const SizedBox(height: AppSpacing.sm),
            Align(
              alignment: Alignment.centerLeft,
              child: Text(
                'Items (${order.items.length})',
                style: AppTypography.caption.copyWith(
                  color: AppColors.grey,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
            const SizedBox(height: AppSpacing.xs),
            ...order.items.map((item) {
              final variantInfo = item.variantName != null && item.variantName!.isNotEmpty
                  ? ' (${item.variantName})'
                  : '';
              return Padding(
                padding: const EdgeInsets.symmetric(vertical: 2),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Text(
                        '${item.quantity}x ${item.productName}$variantInfo',
                        style: AppTypography.caption.copyWith(
                          fontWeight: FontWeight.w600,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    const SizedBox(width: AppSpacing.sm),
                    Text(
                      formatNaira(item.price / 100.0),
                      style: AppTypography.caption.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              );
            }),
          ],
          const SizedBox(height: AppSpacing.md),
          Divider(color: isDark ? Colors.white10 : AppColors.border),
          const SizedBox(height: AppSpacing.sm),
          const OrderSuccessTimeline(),
        ],
      ),
    );
  }
}
