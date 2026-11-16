import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:hugeicons/hugeicons.dart';
import '../../../core/router/safe_navigation.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/widgets/app_widgets.dart';
import '../application/shop_providers.dart';
import '../domain/shop_entities.dart';

class ProductDetailScreen extends ConsumerStatefulWidget {
  const ProductDetailScreen({
    super.key,
    required this.productId,
    required String id,
  });
  final String productId;

  @override
  ConsumerState<ProductDetailScreen> createState() =>
      _ProductDetailScreenState();
}

class _ProductDetailScreenState extends ConsumerState<ProductDetailScreen> {
  int _selectedImageIndex = 0;
  String? _selectedColor;
  String? _selectedSize;
  int _quantity = 1;

  final GlobalKey<_ProductInfoTabsState> _infoTabsKey = GlobalKey();
  final GlobalKey _aboutSellerKey = GlobalKey();

  void _scrollToInfoTab(_InfoTab tab) {
    _infoTabsKey.currentState?.setTab(tab);
    if (_infoTabsKey.currentContext != null) {
      Scrollable.ensureVisible(
        _infoTabsKey.currentContext!,
        duration: const Duration(milliseconds: 500),
        curve: Curves.easeInOut,
      );
    }
  }

  void _scrollToAboutSeller() {
    if (_aboutSellerKey.currentContext != null) {
      Scrollable.ensureVisible(
        _aboutSellerKey.currentContext!,
        duration: const Duration(milliseconds: 500),
        curve: Curves.easeInOut,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final productAsync = ref.watch(productDetailProvider(widget.productId));

    return productAsync.when(
      loading: () =>
          const Scaffold(body: LoadingState(message: 'Loading product…')),
      error: (e, _) => Scaffold(
        appBar: AppBar(),
        body: ErrorState(message: e.toString()),
      ),
      data: (product) {
        if (product == null) {
          return Scaffold(
            appBar: AppBar(),
            body: const ErrorState(message: 'Product not found.'),
          );
        }
        return _ProductDetailBody(
          product: product,
          selectedImageIndex: _selectedImageIndex,
          onImageSelect: (i) => setState(() => _selectedImageIndex = i),
          selectedColor: _selectedColor,
          onColorSelect: (c) => setState(() => _selectedColor = c),
          selectedSize: _selectedSize,
          onSizeSelect: (s) => setState(() => _selectedSize = s),
          quantity: _quantity,
          onQuantityChange: (q) => setState(() => _quantity = q),
          infoTabsKey: _infoTabsKey,
          aboutSellerKey: _aboutSellerKey,
          onScrollToDelivery: () => _scrollToInfoTab(_InfoTab.delivery),
          onScrollToAboutSeller: _scrollToAboutSeller,
        );
      },
    );
  }
}

// ─── Detail body ──────────────────────────────────────────────────────────

class _ProductDetailBody extends ConsumerWidget {
  const _ProductDetailBody({
    required this.product,
    required this.selectedImageIndex,
    required this.onImageSelect,
    required this.selectedColor,
    required this.onColorSelect,
    required this.selectedSize,
    required this.onSizeSelect,
    required this.quantity,
    required this.onQuantityChange,
    required this.infoTabsKey,
    required this.aboutSellerKey,
    required this.onScrollToDelivery,
    required this.onScrollToAboutSeller,
  });

  final Product product;
  final int selectedImageIndex;
  final ValueChanged<int> onImageSelect;
  final String? selectedColor;
  final ValueChanged<String?> onColorSelect;
  final String? selectedSize;
  final ValueChanged<String?> onSizeSelect;
  final int quantity;
  final ValueChanged<int> onQuantityChange;
  final GlobalKey<_ProductInfoTabsState> infoTabsKey;
  final GlobalKey aboutSellerKey;
  final VoidCallback onScrollToDelivery;
  final VoidCallback onScrollToAboutSeller;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final cs = Theme.of(context).colorScheme;
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cartNotifier = ref.read(cartProvider.notifier);
    final inCart = (ref.watch(cartProvider).valueOrNull ?? const Cart()).items
        .any((i) => i.product.id == product.id);

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      body: CustomScrollView(
        slivers: [
          // Image gallery app bar
          _ImageSliverAppBar(
            product: product,
            selectedIndex: selectedImageIndex,
            onImageSelect: onImageSelect,
          ),

          // Content
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(
                AppSpacing.md,
                AppSpacing.md,
                AppSpacing.md,
                AppSpacing.xl + AppSpacing.xxxl, // nav bar clearance
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // 1. Title & Share
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: Text(
                          product.name,
                          style: AppTypography.h4.copyWith(
                            fontWeight: FontWeight.w800,
                            letterSpacing: -0.5,
                          ),
                        ),
                      ),
                      const SizedBox(width: AppSpacing.sm),
                      IconButton(
                        onPressed: () {},
                        icon: HugeIcon(
                          icon: HugeIcons.strokeRoundedShare01,
                          size: 24,
                          color: cs.onSurface,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.xs),

                  // 2. Reviews & Rating Summary
                  Row(
                    children: [
                      const HugeIcon(
                        icon: HugeIcons.strokeRoundedStar,
                        size: 16,
                        color: Colors.amber,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        product.rating.toString(),
                        style: AppTypography.bodySmall.copyWith(
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(width: AppSpacing.xs),
                      Text(
                        '•',
                        style: AppTypography.bodySmall.copyWith(
                          color: cs.onSurfaceVariant,
                        ),
                      ),
                      const SizedBox(width: AppSpacing.xs),
                      Text(
                        '${product.reviewCount} Reviews',
                        style: AppTypography.bodySmall.copyWith(
                          color: isDark ? AppColors.secondary : cs.primary,
                          decoration: TextDecoration.underline,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.md),
                  const Divider(),
                  const SizedBox(height: AppSpacing.md),

                  // 3. Seller Info Mini Row
                  Row(
                    children: [
                      CircleAvatar(
                        radius: 20,
                        backgroundColor: cs.surfaceContainerHighest,
                        child: HugeIcon(
                          icon: HugeIcons.strokeRoundedStore01,
                          size: 20,
                          color: cs.onSurfaceVariant,
                        ),
                      ),
                      const SizedBox(width: AppSpacing.md),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              product.brand,
                              style: AppTypography.bodyMedium.copyWith(
                                fontWeight: FontWeight.w700,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            Row(
                              children: [
                                Text(
                                  '99.9% positive',
                                  style: AppTypography.label.copyWith(
                                    color: cs.onSurfaceVariant,
                                  ),
                                ),
                                const SizedBox(width: 4),
                                Text(
                                  '•',
                                  style: AppTypography.label.copyWith(
                                    color: cs.onSurfaceVariant,
                                  ),
                                ),
                                const SizedBox(width: 4),
                                GestureDetector(
                                  onTap: onScrollToAboutSeller,
                                  child: Text(
                                    'Seller details',
                                    style: AppTypography.label.copyWith(
                                      color: isDark
                                          ? AppColors.secondary
                                          : cs.primary,
                                      decoration: TextDecoration.underline,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                      OutlinedButton(
                        onPressed: () {},
                        style: OutlinedButton.styleFrom(
                          minimumSize: const Size(0, 32),
                          padding: const EdgeInsets.symmetric(horizontal: 12),
                        ),
                        child: const Text(
                          'Message',
                          style: TextStyle(fontSize: 12),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.md),
                  const Divider(),
                  const SizedBox(height: AppSpacing.md),

                  // 4. Price
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.baseline,
                    textBaseline: TextBaseline.alphabetic,
                    children: [
                      Text(
                        formatNaira(product.discountedPrice),
                        style: AppTypography.h3.copyWith(
                          fontWeight: FontWeight.w800,
                          color: isDark ? AppColors.secondary : cs.primary,
                        ),
                      ),
                      if (product.hasDiscount) ...[
                        const SizedBox(width: AppSpacing.sm),
                        Text(
                          formatNaira(product.price),
                          style: AppTypography.bodyLarge.copyWith(
                            decoration: TextDecoration.lineThrough,
                            color: AppColors.grey,
                          ),
                        ),
                        const SizedBox(width: AppSpacing.xs),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: AppSpacing.xs + 2,
                            vertical: 2,
                          ),
                          decoration: BoxDecoration(
                            color: AppColors.error.withAlpha(20),
                            borderRadius: AppSpacing.borderRadiusXS,
                          ),
                          child: Text(
                            '-${product.discount!.toInt()}%',
                            style: AppTypography.label.copyWith(
                              color: AppColors.error,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),
                      ],
                    ],
                  ),
                  const SizedBox(height: 2),
                  Text(
                    'Prices include VAT.',
                    style: AppTypography.label.copyWith(
                      color: cs.onSurfaceVariant,
                    ),
                  ),
                  const SizedBox(height: AppSpacing.md),

                  // Condition
                  Row(
                    children: [
                      SizedBox(
                        width: 80,
                        child: Text(
                          'Condition:',
                          style: AppTypography.bodySmall.copyWith(
                            color: cs.onSurfaceVariant,
                          ),
                        ),
                      ),
                      Text(
                        'New ',
                        style: AppTypography.bodySmall.copyWith(
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      Text(
                        '"Brand new, sealed"',
                        style: AppTypography.bodySmall.copyWith(
                          color: cs.onSurfaceVariant,
                          fontStyle: FontStyle.italic,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.md),
                  const Divider(),
                  const SizedBox(height: AppSpacing.md),

                  // Color & Size (Product Options)
                  if (product.colors != null && product.colors!.isNotEmpty) ...[
                    _SelectorRow(
                      title: 'Color',
                      selected: selectedColor,
                      options: product.colors!,
                      onSelect: onColorSelect,
                    ),
                    const SizedBox(height: AppSpacing.md),
                  ],

                  if (product.sizes != null && product.sizes!.isNotEmpty) ...[
                    _SelectorRow(
                      title: 'Size',
                      selected: selectedSize,
                      options: product.sizes!,
                      onSelect: onSizeSelect,
                    ),
                    const SizedBox(height: AppSpacing.md),
                  ],

                  // Quantity & Stock
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      SizedBox(
                        width: 80,
                        child: Text(
                          'Quantity:',
                          style: AppTypography.bodySmall.copyWith(
                            color: cs.onSurfaceVariant,
                          ),
                        ),
                      ),
                      _QuantitySelector(
                        quantity: quantity,
                        onChanged: onQuantityChange,
                      ),
                      const SizedBox(width: AppSpacing.md),
                      Expanded(
                        child: Text(
                          product.inStock
                              ? '${product.stock} available'
                              : 'Out of Stock',
                          style: AppTypography.bodySmall.copyWith(
                            color: product.inStock
                                ? const Color(0xFF10B981)
                                : AppColors.error,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.xl),

                  // Actions
                  SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: FilledButton(
                      onPressed: () {},
                      style: FilledButton.styleFrom(
                        backgroundColor: isDark
                            ? AppColors.secondary
                            : cs.primary,
                        foregroundColor: isDark ? cs.onPrimary : Colors.white,
                      ),
                      child: const Text(
                        'Buy It Now',
                        style: TextStyle(
                          fontWeight: FontWeight.w700,
                          fontSize: 16,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: OutlinedButton.icon(
                      onPressed: () {},
                      icon: HugeIcon(
                        icon: HugeIcons.strokeRoundedFavourite,
                        size: 20,
                        color: isDark ? AppColors.secondary : cs.primary,
                      ),
                      label: Text(
                        'Add to Watchlist',
                        style: TextStyle(
                          color: isDark ? AppColors.secondary : cs.primary,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      style: OutlinedButton.styleFrom(
                        side: BorderSide(
                          color: (isDark ? AppColors.secondary : cs.primary)
                              .withAlpha(50),
                        ),
                        backgroundColor:
                            (isDark ? AppColors.secondary : cs.primary)
                                .withAlpha(10),
                      ),
                    ),
                  ),
                  const SizedBox(height: AppSpacing.xl),

                  // Highlights
                  Container(
                    padding: const EdgeInsets.all(AppSpacing.md),
                    decoration: BoxDecoration(
                      color: cs.surfaceContainerHighest.withAlpha(100),
                      borderRadius: AppSpacing.borderRadiusLG,
                      border: Border.all(color: AppColors.border),
                    ),
                    child: Column(
                      children: [
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            HugeIcon(
                              icon: HugeIcons.strokeRoundedTruckReturn,
                              size: 18,
                              color: cs.onSurface,
                            ),
                            const SizedBox(width: AppSpacing.sm),
                            Expanded(
                              child: RichText(
                                text: TextSpan(
                                  style: AppTypography.bodySmall.copyWith(
                                    color: cs.onSurface,
                                  ),
                                  children: const [
                                    TextSpan(
                                      text: 'Breathe easy. ',
                                      style: TextStyle(
                                        fontWeight: FontWeight.w700,
                                      ),
                                    ),
                                    TextSpan(text: 'Returns accepted.'),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: AppSpacing.sm),
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const HugeIcon(
                              icon: HugeIcons.strokeRoundedFire,
                              size: 18,
                              color: AppColors.error,
                            ),
                            const SizedBox(width: AppSpacing.sm),
                            Expanded(
                              child: RichText(
                                text: TextSpan(
                                  style: AppTypography.bodySmall.copyWith(
                                    color: cs.onSurface,
                                  ),
                                  children: const [
                                    TextSpan(
                                      text: 'People want this. ',
                                      style: TextStyle(
                                        fontWeight: FontWeight.w700,
                                      ),
                                    ),
                                    TextSpan(
                                      text:
                                          'Over 20 people have this in their cart.',
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: AppSpacing.xl),
                  const Divider(),
                  const SizedBox(height: AppSpacing.lg),

                  // Shipping & Returns
                  Text(
                    'Shipping, returns, and payments',
                    style: AppTypography.h6.copyWith(
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: AppSpacing.md),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      SizedBox(
                        width: 80,
                        child: Text(
                          'Shipping:',
                          style: AppTypography.bodySmall.copyWith(
                            color: cs.onSurfaceVariant,
                          ),
                        ),
                      ),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Wrap(
                              children: [
                                Text(
                                  'Delivery calculated at checkout. ',
                                  style: AppTypography.bodySmall.copyWith(
                                    color: cs.onSurface,
                                  ),
                                ),
                                GestureDetector(
                                  onTap: onScrollToDelivery,
                                  child: Text(
                                    'See details',
                                    style: TextStyle(
                                      color: isDark
                                          ? AppColors.secondary
                                          : cs.primary,
                                      decoration: TextDecoration.underline,
                                      fontSize: 12,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 2),
                            Text(
                              'Located in: Lagos, Nigeria',
                              style: AppTypography.label.copyWith(
                                color: cs.onSurfaceVariant,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      SizedBox(
                        width: 80,
                        child: Text(
                          'Delivery:',
                          style: AppTypography.bodySmall.copyWith(
                            color: cs.onSurfaceVariant,
                          ),
                        ),
                      ),
                      Expanded(
                        child: Text(
                          'Estimated between 2-5 working days.',
                          style: AppTypography.bodySmall,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      SizedBox(
                        width: 80,
                        child: Text(
                          'Returns:',
                          style: AppTypography.bodySmall.copyWith(
                            color: cs.onSurfaceVariant,
                          ),
                        ),
                      ),
                      Expanded(
                        child: Wrap(
                          children: [
                            Text(
                              '14 days returns. Buyer pays for return shipping. ',
                              style: AppTypography.bodySmall.copyWith(
                                color: cs.onSurface,
                              ),
                            ),
                            GestureDetector(
                              onTap: onScrollToDelivery,
                              child: Text(
                                'See details',
                                style: TextStyle(
                                  color: isDark
                                      ? AppColors.secondary
                                      : cs.primary,
                                  decoration: TextDecoration.underline,
                                  fontSize: 12,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      SizedBox(
                        width: 80,
                        child: Text(
                          'Payments:',
                          style: AppTypography.bodySmall.copyWith(
                            color: cs.onSurfaceVariant,
                          ),
                        ),
                      ),
                      Expanded(
                        child: Wrap(
                          spacing: AppSpacing.xs,
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 6,
                                vertical: 2,
                              ),
                              decoration: BoxDecoration(
                                border: Border.all(color: AppColors.border),
                                borderRadius: BorderRadius.circular(4),
                                color: Colors.white,
                              ),
                              child: const Text(
                                'Paystack',
                                style: TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                  color: Color(0xFF0F172A),
                                ),
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 6,
                                vertical: 2,
                              ),
                              decoration: BoxDecoration(
                                border: Border.all(color: AppColors.border),
                                borderRadius: BorderRadius.circular(4),
                                color: Colors.white,
                              ),
                              child: Text(
                                'Cards',
                                style: TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                  color: isDark
                                      ? AppColors.secondary
                                      : cs.primary,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: AppSpacing.xl),
                  const Divider(),
                  const SizedBox(height: AppSpacing.lg),

                  // Guarantees
                  Text(
                    'Shop with confidence',
                    style: AppTypography.h6.copyWith(
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: AppSpacing.md),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      HugeIcon(
                        icon: HugeIcons.strokeRoundedShield02,
                        size: 24,
                        color: isDark ? AppColors.secondary : cs.primary,
                      ),
                      const SizedBox(width: AppSpacing.md),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Aba Buyer Protection',
                              style: AppTypography.bodySmall.copyWith(
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                            const SizedBox(height: 2),
                            RichText(
                              text: TextSpan(
                                style: AppTypography.label.copyWith(
                                  color: cs.onSurfaceVariant,
                                ),
                                children: [
                                  const TextSpan(
                                    text:
                                        'Get the item you ordered or get your money back. ',
                                  ),
                                  TextSpan(
                                    text: 'Learn more',
                                    style: TextStyle(
                                      color: isDark
                                          ? AppColors.secondary
                                          : cs.primary,
                                      decoration: TextDecoration.underline,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.md),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      HugeIcon(
                        icon: HugeIcons.strokeRoundedTruckDelivery,
                        size: 24,
                        color: cs.onSurface,
                      ),
                      const SizedBox(width: AppSpacing.md),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Trusted Logistics',
                              style: AppTypography.bodySmall.copyWith(
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              'Fast shipping and tracking provided for all orders.',
                              style: AppTypography.label.copyWith(
                                color: cs.onSurfaceVariant,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: AppSpacing.xl),
                  const Divider(),
                  const SizedBox(height: AppSpacing.lg),

                  // Description Tabs
                  _ProductInfoTabs(key: infoTabsKey, product: product),
                  const SizedBox(height: AppSpacing.md),

                  // Tags
                  if (product.tags != null && product.tags!.isNotEmpty) ...[
                    Wrap(
                      spacing: AppSpacing.xs,
                      children: product.tags!
                          .map(
                            (t) => Chip(
                              label: Text('#$t', style: AppTypography.label),
                              padding: EdgeInsets.zero,
                              visualDensity: VisualDensity.compact,
                              backgroundColor: cs.surfaceContainerHighest
                                  .withAlpha(100),
                              side: const BorderSide(color: AppColors.border),
                            ),
                          )
                          .toList(),
                    ),
                    const SizedBox(height: AppSpacing.md),
                  ],

                  // Related Items
                  const SizedBox(height: AppSpacing.xl),
                  const Divider(),
                  const SizedBox(height: AppSpacing.xl),
                  Text(
                    'Related items',
                    style: AppTypography.h6.copyWith(
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: AppSpacing.md),
                  _RelatedProductsRail(
                    currentProductId: product.id,
                    category: product.category,
                  ),

                  // About Seller
                  const SizedBox(height: AppSpacing.xl),
                  const Divider(),
                  const SizedBox(height: AppSpacing.xl),
                  Text(
                    'About the Seller',
                    style: AppTypography.h6.copyWith(
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  _AboutSellerTab(
                    key: aboutSellerKey,
                    merchantName: product.brand,
                  ),
                ],
              ),
            ),
          ),
        ],
      ),

      // Bottom CTA bar
      bottomNavigationBar: _DetailBottomBar(
        product: product,
        inCart: inCart,
        quantity: quantity,
        selectedColor: selectedColor,
        selectedSize: selectedSize,
        onAddToCart: () {
          cartNotifier.addToCart(
            product,
            quantity: quantity,
            color: selectedColor,
            size: selectedSize,
          );
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: const Text('Added to cart!'),
              action: SnackBarAction(
                label: 'View Cart',
                onPressed: () => context.push('/cart'),
              ),
              behavior: SnackBarBehavior.floating,
            ),
          );
        },
      ),
    );
  }
}

// ─── Image gallery sliver app bar ─────────────────────────────────────────

class _ImageSliverAppBar extends StatelessWidget {
  const _ImageSliverAppBar({
    required this.product,
    required this.selectedIndex,
    required this.onImageSelect,
  });
  final Product product;
  final int selectedIndex;
  final ValueChanged<int> onImageSelect;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final images = product.images;

    return SliverAppBar(
      expandedHeight: 320,
      pinned: true,
      backgroundColor: cs.surface,
      leading: GestureDetector(
        onTap: () => context.popOrGo('/shop'),
        child: Container(
          margin: const EdgeInsets.all(AppSpacing.sm),
          decoration: BoxDecoration(
            color: Colors.white.withAlpha(220),
            shape: BoxShape.circle,
          ),
          child: const Center(
            child: HugeIcon(
              icon: HugeIcons.strokeRoundedArrowLeft01,
              size: AppSpacing.iconSizeSM,
              color: AppColors.onBackground,
            ),
          ),
        ),
      ),
      actions: [
        Container(
          margin: const EdgeInsets.all(AppSpacing.sm),
          decoration: BoxDecoration(
            color: Colors.white.withAlpha(220),
            shape: BoxShape.circle,
          ),
          child: const Center(
            child: Padding(
              padding: EdgeInsets.all(6),
              child: HugeIcon(
                icon: HugeIcons.strokeRoundedShare01,
                size: AppSpacing.iconSizeSM,
                color: AppColors.onBackground,
              ),
            ),
          ),
        ),
      ],
      flexibleSpace: FlexibleSpaceBar(
        background: Stack(
          fit: StackFit.expand,
          children: [
            AppNetworkImage.product(
              imageUrl: images.isNotEmpty ? images[selectedIndex] : null,
              fit: BoxFit.cover,
            ),

            // Thumbnail strip
            if (images.length > 1)
              Positioned(
                bottom: AppSpacing.md,
                left: 0,
                right: 0,
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: List.generate(
                    images.length,
                    (i) => GestureDetector(
                      onTap: () => onImageSelect(i),
                      child: AnimatedContainer(
                        duration: AppSpacing.animationFast,
                        margin: const EdgeInsets.symmetric(
                          horizontal: AppSpacing.xs / 2,
                        ),
                        width: selectedIndex == i ? 24 : 8,
                        height: 8,
                        decoration: BoxDecoration(
                          color: selectedIndex == i
                              ? cs.primary
                              : Colors.white.withAlpha(180),
                          borderRadius: AppSpacing.avatarRadius,
                        ),
                      ),
                    ),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

// ─── Option selector ──────────────────────────────────────────────────────

class _SelectorRow extends StatelessWidget {
  const _SelectorRow({
    required this.title,
    required this.selected,
    required this.options,
    required this.onSelect,
  });
  final String title;
  final String? selected;
  final List<String> options;
  final ValueChanged<String?> onSelect;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Text(
              title,
              style: AppTypography.bodyMedium.copyWith(
                fontWeight: FontWeight.w700,
              ),
            ),
            if (selected != null) ...[
              const SizedBox(width: AppSpacing.xs),
              Text(
                ': $selected',
                style: AppTypography.bodySmall.copyWith(
                  color: isDark ? AppColors.secondary : cs.primary,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ],
        ),
        const SizedBox(height: AppSpacing.sm),
        Wrap(
          spacing: AppSpacing.xs,
          runSpacing: AppSpacing.xs,
          children: options.map((opt) {
            final isSel = opt == selected;
            return GestureDetector(
              onTap: () => onSelect(isSel ? null : opt),
              child: AnimatedContainer(
                duration: AppSpacing.animationFast,
                padding: const EdgeInsets.symmetric(
                  horizontal: AppSpacing.md,
                  vertical: AppSpacing.xs + 2,
                ),
                decoration: BoxDecoration(
                  color: isSel
                      ? (isDark ? AppColors.secondary : cs.primary)
                      : Colors.transparent,
                  borderRadius: AppSpacing.borderRadiusSM,
                  border: Border.all(
                    color: isSel
                        ? (isDark ? AppColors.secondary : cs.primary)
                        : cs.outline.withAlpha(100),
                    width: 1.5,
                  ),
                ),
                child: Text(
                  opt,
                  style: AppTypography.bodySmall.copyWith(
                    color: isSel
                        ? (isDark ? cs.surface : Colors.white)
                        : cs.onSurface,
                    fontWeight: isSel ? FontWeight.w700 : FontWeight.w500,
                  ),
                ),
              ),
            );
          }).toList(),
        ),
      ],
    );
  }
}

// ─── Quantity selector ────────────────────────────────────────────────────

class _QuantitySelector extends StatelessWidget {
  const _QuantitySelector({required this.quantity, required this.onChanged});
  final int quantity;
  final ValueChanged<int> onChanged;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Container(
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF2A2A2A) : cs.surfaceContainerHighest,
        borderRadius: AppSpacing.borderRadiusSM,
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          _QtyButton(
            icon: HugeIcons.strokeRoundedMinusSign,
            onTap: quantity > 1 ? () => onChanged(quantity - 1) : null,
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
            child: Text(
              '$quantity',
              style: AppTypography.bodyMedium.copyWith(
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
          _QtyButton(
            icon: HugeIcons.strokeRoundedPlusSign,
            onTap: () => onChanged(quantity + 1),
          ),
        ],
      ),
    );
  }
}

class _QtyButton extends StatelessWidget {
  const _QtyButton({required this.icon, this.onTap});
  final List<List<dynamic>> icon;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return GestureDetector(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.sm),
        child: HugeIcon(
          icon: icon,
          size: AppSpacing.iconSizeSM,
          color: onTap != null
              ? (isDark ? AppColors.secondary : cs.primary)
              : AppColors.grey,
        ),
      ),
    );
  }
}

// ─── Bottom CTA bar ───────────────────────────────────────────────────────

class _DetailBottomBar extends StatelessWidget {
  const _DetailBottomBar({
    required this.product,
    required this.inCart,
    required this.quantity,
    required this.selectedColor,
    required this.selectedSize,
    required this.onAddToCart,
  });

  final Product product;
  final bool inCart;
  final int quantity;
  final String? selectedColor;
  final String? selectedSize;
  final VoidCallback onAddToCart;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      padding: EdgeInsets.fromLTRB(
        AppSpacing.md,
        AppSpacing.sm,
        AppSpacing.md,
        AppSpacing.md + MediaQuery.of(context).padding.bottom,
      ),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1E1E1E) : Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(isDark ? 60 : 15),
            blurRadius: 16,
            offset: const Offset(0, -4),
          ),
        ],
      ),
      child: Row(
        children: [
          // Wishlist button
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              border: Border.all(color: cs.outline.withAlpha(80), width: 1.5),
              borderRadius: AppSpacing.borderRadiusMD,
            ),
            child: const Center(
              child: HugeIcon(
                icon: HugeIcons.strokeRoundedFavourite,
                size: AppSpacing.iconSizeSM,
                color: AppColors.error,
              ),
            ),
          ),
          const SizedBox(width: AppSpacing.sm),

          // Add to cart / view cart button
          Expanded(
            child: FilledButton.icon(
              onPressed: product.inStock
                  ? (inCart ? () => context.push('/cart') : onAddToCart)
                  : null,
              icon: HugeIcon(
                icon: inCart
                    ? HugeIcons.strokeRoundedShoppingCart01
                    : HugeIcons.strokeRoundedShoppingBag01,
                size: AppSpacing.iconSizeSM,
                color: Colors.white,
              ),
              label: Text(
                product.inStock
                    ? (inCart ? 'View Cart' : 'Add to Cart')
                    : 'Out of Stock',
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ─── Related Products Rail ──────────────────────────────────────────────────

class _RelatedProductsRail extends ConsumerWidget {
  const _RelatedProductsRail({
    required this.currentProductId,
    required this.category,
  });

  final String currentProductId;
  final String category;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final catAsync = ref.watch(shopCatalogueProvider);

    return catAsync.maybeWhen(
      data: (catalogue) {
        final related = catalogue.products
            .where((p) => p.category == category && p.id != currentProductId)
            .take(6)
            .toList();

        if (related.isEmpty) {
          return const Text('No related products found.');
        }

        return SizedBox(
          height: 240,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            itemCount: related.length,
            separatorBuilder: (_, __) => const SizedBox(width: AppSpacing.md),
            itemBuilder: (context, i) {
              final p = related[i];
              return SizedBox(
                width: 140,
                child: GestureDetector(
                  onTap: () {
                    // Navigate to product detail
                    context.push('/product/${p.id}');
                  },
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: AppNetworkImage.product(
                          imageUrl: p.imageUrl,
                          fit: BoxFit.cover,
                          width: double.infinity,
                          borderRadius: AppSpacing.borderRadiusMD,
                        ),
                      ),
                      const SizedBox(height: AppSpacing.xs),
                      Text(
                        p.name,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: AppTypography.label.copyWith(
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        formatNaira(p.discountedPrice),
                        style: AppTypography.label.copyWith(
                          color: AppColors.primary,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        );
      },
      orElse: () => const SizedBox.shrink(),
    );
  }
}

// ─── About Seller Tab ───────────────────────────────────────────────────────

class _AboutSellerTab extends StatelessWidget {
  const _AboutSellerTab({super.key, required this.merchantName});

  final String merchantName;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final color = isDark ? AppColors.secondary : cs.primary;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Seller Info
        Row(
          children: [
            Container(
              width: 56,
              height: 56,
              decoration: BoxDecoration(
                color: cs.surfaceContainerHighest,
                shape: BoxShape.circle,
                border: Border.all(color: AppColors.border),
              ),
              child: Center(
                child: HugeIcon(
                  icon: HugeIcons.strokeRoundedStore01,
                  size: 28,
                  color: cs.onSurfaceVariant,
                ),
              ),
            ),
            const SizedBox(width: AppSpacing.md),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    merchantName,
                    style: AppTypography.h6.copyWith(
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    '99.9% positive feedback • 5.7K items sold',
                    style: AppTypography.bodySmall.copyWith(
                      color: cs.onSurfaceVariant,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),

        const SizedBox(height: AppSpacing.md),

        // Joined Date
        Row(
          children: [
            HugeIcon(
              icon: HugeIcons.strokeRoundedCalendar01,
              size: 16,
              color: cs.onSurfaceVariant,
            ),
            const SizedBox(width: AppSpacing.xs),
            Text(
              'Joined Oct 2025',
              style: AppTypography.bodySmall.copyWith(
                color: cs.onSurfaceVariant,
              ),
            ),
          ],
        ),

        const SizedBox(height: AppSpacing.lg),

        // Actions
        SizedBox(
          width: double.infinity,
          child: FilledButton(
            onPressed: () {},
            style: FilledButton.styleFrom(
              backgroundColor: color,
              foregroundColor: isDark ? cs.onPrimary : Colors.white,
            ),
            child: const Text('Visit store'),
          ),
        ),
        const SizedBox(height: AppSpacing.sm),
        SizedBox(
          width: double.infinity,
          child: OutlinedButton.icon(
            onPressed: () {},
            icon: HugeIcon(
              icon: HugeIcons.strokeRoundedMessage01,
              size: 18,
              color: color,
            ),
            label: Text('Message seller', style: TextStyle(color: color)),
            style: OutlinedButton.styleFrom(
              side: BorderSide(color: color.withAlpha(50)),
            ),
          ),
        ),
        const SizedBox(height: AppSpacing.sm),
        SizedBox(
          width: double.infinity,
          child: OutlinedButton.icon(
            onPressed: () {},
            icon: HugeIcon(
              icon: HugeIcons.strokeRoundedFavourite,
              size: 18,
              color: color,
            ),
            label: Text('Save seller', style: TextStyle(color: color)),
            style: OutlinedButton.styleFrom(
              side: BorderSide(color: color.withAlpha(50)),
            ),
          ),
        ),

        const SizedBox(height: AppSpacing.xl),
        const Divider(),
        const SizedBox(height: AppSpacing.xl),

        // Detailed seller ratings
        Text(
          'Detailed seller ratings',
          style: AppTypography.bodyMedium.copyWith(fontWeight: FontWeight.w700),
        ),
        const SizedBox(height: AppSpacing.md),
        const _SellerRatingBar(
          label: 'Accurate description',
          score: 4.6,
          percentage: 92,
        ),
        const SizedBox(height: AppSpacing.sm),
        const _SellerRatingBar(
          label: 'Reasonable shipping cost',
          score: 4.4,
          percentage: 88,
        ),
        const SizedBox(height: AppSpacing.sm),
        const _SellerRatingBar(
          label: 'Shipping speed',
          score: 4.9,
          percentage: 98,
        ),
        const SizedBox(height: AppSpacing.sm),
        const _SellerRatingBar(
          label: 'Communication',
          score: 4.9,
          percentage: 98,
        ),

        const SizedBox(height: AppSpacing.xs),
        Text(
          'Average for the last 12 months',
          style: AppTypography.label.copyWith(color: cs.onSurfaceVariant),
        ),

        const SizedBox(height: AppSpacing.xl),
        const Divider(),
        const SizedBox(height: AppSpacing.xl),

        // Popular categories
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Text(
              'Popular categories',
              style: AppTypography.bodyMedium.copyWith(
                fontWeight: FontWeight.w700,
              ),
            ),
            Text(
              'See all',
              style: AppTypography.label.copyWith(
                color: color,
                decoration: TextDecoration.underline,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
        const SizedBox(height: AppSpacing.sm),
        Wrap(
          spacing: AppSpacing.xs,
          runSpacing: AppSpacing.xs,
          children: [
            Chip(
              label: const Text('Consumer Electronics'),
              labelStyle: AppTypography.label,
              backgroundColor: cs.surfaceContainerHighest.withAlpha(100),
              side: const BorderSide(color: AppColors.border),
            ),
            Chip(
              label: const Text('Fashion & Apparel'),
              labelStyle: AppTypography.label,
              backgroundColor: cs.surfaceContainerHighest.withAlpha(100),
              side: const BorderSide(color: AppColors.border),
            ),
          ],
        ),

        const SizedBox(height: AppSpacing.xl),
        const Divider(),
        const SizedBox(height: AppSpacing.xl),

        // Referral Network
        Text(
          'Referral Network',
          style: AppTypography.bodyMedium.copyWith(fontWeight: FontWeight.w700),
        ),
        const SizedBox(height: AppSpacing.sm),
        Container(
          padding: const EdgeInsets.all(AppSpacing.md),
          decoration: BoxDecoration(
            color: color.withAlpha(20),
            borderRadius: AppSpacing.borderRadiusLG,
            border: Border.all(color: color.withAlpha(50)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'This merchant is part of the BuyNaija referral network. You can earn commissions by referring their products!',
                style: AppTypography.bodySmall.copyWith(color: color),
              ),
              const SizedBox(height: AppSpacing.md),
              SizedBox(
                width: double.infinity,
                child: OutlinedButton(
                  onPressed: () {},
                  style: OutlinedButton.styleFrom(
                    foregroundColor: color,
                    side: BorderSide(color: color.withAlpha(100)),
                    backgroundColor: Theme.of(context).scaffoldBackgroundColor,
                  ),
                  child: const Text('Join their network'),
                ),
              ),
            ],
          ),
        ),

        const SizedBox(height: AppSpacing.xl),
        const Divider(),
        const SizedBox(height: AppSpacing.xl),

        // Seller feedback (placeholder for reviews)
        Row(
          crossAxisAlignment: CrossAxisAlignment.baseline,
          textBaseline: TextBaseline.alphabetic,
          children: [
            Text(
              'Seller feedback',
              style: AppTypography.h6.copyWith(fontWeight: FontWeight.w700),
            ),
            const SizedBox(width: AppSpacing.sm),
            Text(
              '(0)',
              style: AppTypography.bodyMedium.copyWith(
                color: cs.onSurfaceVariant,
              ),
            ),
          ],
        ),
        const SizedBox(height: AppSpacing.md),
        const Center(
          child: Padding(
            padding: EdgeInsets.all(AppSpacing.xl),
            child: Text('Reviews will be displayed here.'),
          ),
        ),
      ],
    );
  }
}

class _SellerRatingBar extends StatelessWidget {
  const _SellerRatingBar({
    required this.label,
    required this.score,
    required this.percentage,
  });

  final String label;
  final double score;
  final int percentage;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;

    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Expanded(
          child: Text(
            label,
            style: AppTypography.bodySmall.copyWith(color: cs.onSurfaceVariant),
          ),
        ),
        Row(
          children: [
            SizedBox(
              width: 100,
              height: 4,
              child: ClipRRect(
                borderRadius: AppSpacing.borderRadiusXS,
                child: LinearProgressIndicator(
                  value: percentage / 100,
                  backgroundColor: cs.surfaceContainerHighest,
                  valueColor: AlwaysStoppedAnimation<Color>(cs.onSurface),
                ),
              ),
            ),
            const SizedBox(width: AppSpacing.md),
            SizedBox(
              width: 24,
              child: Text(
                score.toStringAsFixed(1),
                style: AppTypography.bodySmall.copyWith(
                  fontWeight: FontWeight.w600,
                  color: cs.onSurface,
                ),
                textAlign: TextAlign.right,
              ),
            ),
          ],
        ),
      ],
    );
  }
}

// ─── Product Info Tabs ──────────────────────────────────────────────────

enum _InfoTab { description, specifications, delivery }

class _ProductInfoTabs extends StatefulWidget {
  const _ProductInfoTabs({super.key, required this.product});
  final Product product;

  @override
  State<_ProductInfoTabs> createState() => _ProductInfoTabsState();
}

class _ProductInfoTabsState extends State<_ProductInfoTabs> {
  _InfoTab _activeTab = _InfoTab.description;

  void setTab(_InfoTab tab) {
    setState(() => _activeTab = tab);
  }

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final color = isDark ? AppColors.secondary : cs.primary;

    return Container(
      decoration: BoxDecoration(
        color: cs.surface,
        borderRadius: AppSpacing.borderRadiusLG,
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Tab Headers
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                _buildTab(
                  icon: HugeIcons.strokeRoundedFile01,
                  label: 'Product Description',
                  tab: _InfoTab.description,
                  color: color,
                ),
                _buildTab(
                  icon: HugeIcons.strokeRoundedListView,
                  label: 'Specifications',
                  tab: _InfoTab.specifications,
                  color: color,
                ),
                _buildTab(
                  icon: HugeIcons.strokeRoundedTruckDelivery,
                  label: 'Delivery & Returns',
                  tab: _InfoTab.delivery,
                  color: color,
                ),
              ],
            ),
          ),
          const Divider(height: 1),
          // Tab Content
          Padding(
            padding: const EdgeInsets.all(AppSpacing.md),
            child: AnimatedSwitcher(
              duration: const Duration(milliseconds: 300),
              child: _buildContent(color),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTab({
    required dynamic icon,
    required String label,
    required _InfoTab tab,
    required Color color,
  }) {
    final isActive = _activeTab == tab;
    final cs = Theme.of(context).colorScheme;

    return InkWell(
      onTap: () => setState(() => _activeTab = tab),
      child: Container(
        padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.md,
          vertical: AppSpacing.md,
        ),
        decoration: BoxDecoration(
          border: Border(
            bottom: BorderSide(
              color: isActive ? color : Colors.transparent,
              width: 2,
            ),
          ),
        ),
        child: Row(
          children: [
            HugeIcon(
              icon: icon,
              size: 16,
              color: isActive ? color : cs.onSurfaceVariant,
            ),
            const SizedBox(width: AppSpacing.sm),
            Text(
              label,
              style: AppTypography.bodySmall.copyWith(
                fontWeight: FontWeight.w600,
                color: isActive ? color : cs.onSurfaceVariant,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildContent(Color color) {
    switch (_activeTab) {
      case _InfoTab.description:
        return _buildDescriptionTab(color);
      case _InfoTab.specifications:
        return _buildSpecificationsTab();
      case _InfoTab.delivery:
        return _buildDeliveryTab(color);
    }
  }

  Widget _buildDescriptionTab(Color color) {
    final cs = Theme.of(context).colorScheme;
    return Column(
      key: const ValueKey('desc'),
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'About this product',
          style: AppTypography.h6.copyWith(fontWeight: FontWeight.w700),
        ),
        const SizedBox(height: AppSpacing.sm),
        Text(
          widget.product.description ??
              'No detailed description provided by the seller.',
          style: AppTypography.bodyMedium.copyWith(
            color: widget.product.description != null
                ? cs.onSurface
                : cs.onSurfaceVariant,
            fontStyle: widget.product.description != null
                ? FontStyle.normal
                : FontStyle.italic,
          ),
        ),
        const SizedBox(height: AppSpacing.xl),
        // Value Props
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: Container(
                padding: const EdgeInsets.all(AppSpacing.sm),
                decoration: BoxDecoration(
                  color: color.withAlpha(20),
                  border: Border.all(color: color.withAlpha(50)),
                  borderRadius: AppSpacing.borderRadiusSM,
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    HugeIcon(
                      icon: HugeIcons.strokeRoundedShieldCheck,
                      size: 20,
                      color: color,
                    ),
                    const SizedBox(width: AppSpacing.sm),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Quality Assured',
                            style: AppTypography.bodySmall.copyWith(
                              fontWeight: FontWeight.w700,
                              color: color,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            'This product meets our strict quality standards.',
                            style: AppTypography.label.copyWith(
                              color: color.withAlpha(200),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(width: AppSpacing.sm),
            Expanded(
              child: Container(
                padding: const EdgeInsets.all(AppSpacing.sm),
                decoration: BoxDecoration(
                  color: cs.surfaceContainerHighest,
                  border: Border.all(color: AppColors.border),
                  borderRadius: AppSpacing.borderRadiusSM,
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    HugeIcon(
                      icon: HugeIcons.strokeRoundedTruckDelivery,
                      size: 20,
                      color: cs.onSurface,
                    ),
                    const SizedBox(width: AppSpacing.sm),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Fast Dispatch',
                            style: AppTypography.bodySmall.copyWith(
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            'Usually ships within 24 hours of payment.',
                            style: AppTypography.label.copyWith(
                              color: cs.onSurfaceVariant,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildSpecificationsTab() {
    final cs = Theme.of(context).colorScheme;
    return Column(
      key: const ValueKey('spec'),
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Technical Specifications',
          style: AppTypography.h6.copyWith(fontWeight: FontWeight.w700),
        ),
        const SizedBox(height: AppSpacing.md),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(AppSpacing.xl),
          decoration: BoxDecoration(
            color: cs.surfaceContainerHighest.withAlpha(100),
            borderRadius: AppSpacing.borderRadiusSM,
            border: Border.all(
              color: AppColors.border,
              style: BorderStyle.solid,
            ),
          ),
          child: Column(
            children: [
              HugeIcon(
                icon: HugeIcons.strokeRoundedListView,
                size: 32,
                color: cs.onSurfaceVariant.withAlpha(100),
              ),
              const SizedBox(height: AppSpacing.sm),
              Text(
                'No technical specifications available for this item.',
                style: AppTypography.bodyMedium.copyWith(
                  color: cs.onSurfaceVariant,
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildDeliveryTab(Color color) {
    final cs = Theme.of(context).colorScheme;
    return Column(
      key: const ValueKey('deliv'),
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Shipping & Returns Information',
          style: AppTypography.h6.copyWith(fontWeight: FontWeight.w700),
        ),
        const SizedBox(height: AppSpacing.xl),

        Row(
          children: [
            HugeIcon(
              icon: HugeIcons.strokeRoundedTruckDelivery,
              size: 20,
              color: color,
            ),
            const SizedBox(width: AppSpacing.sm),
            Text(
              'Delivery Options',
              style: AppTypography.bodyMedium.copyWith(
                fontWeight: FontWeight.w700,
              ),
            ),
          ],
        ),
        const SizedBox(height: AppSpacing.sm),
        Container(
          padding: const EdgeInsets.all(AppSpacing.md),
          decoration: BoxDecoration(
            color: cs.surfaceContainerHighest.withAlpha(100),
            borderRadius: AppSpacing.borderRadiusSM,
            border: Border.all(color: AppColors.border),
          ),
          child: Column(
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Standard Delivery',
                          style: AppTypography.bodySmall.copyWith(
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        Text(
                          'Estimated 2-5 working days',
                          style: AppTypography.label.copyWith(
                            color: cs.onSurfaceVariant,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Text(
                    'Calculated at checkout',
                    style: AppTypography.bodySmall.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
              const Padding(
                padding: EdgeInsets.symmetric(vertical: AppSpacing.sm),
                child: Divider(height: 1),
              ),
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Express Delivery',
                          style: AppTypography.bodySmall.copyWith(
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        Text(
                          'Estimated 1-2 working days',
                          style: AppTypography.label.copyWith(
                            color: cs.onSurfaceVariant,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Text(
                    'Calculated at checkout',
                    style: AppTypography.bodySmall.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),

        const SizedBox(height: AppSpacing.xl),

        Row(
          children: [
            HugeIcon(
              icon: HugeIcons.strokeRoundedShieldCheck,
              size: 20,
              color: color,
            ),
            const SizedBox(width: AppSpacing.sm),
            Text(
              'Return Policy',
              style: AppTypography.bodyMedium.copyWith(
                fontWeight: FontWeight.w700,
              ),
            ),
          ],
        ),
        const SizedBox(height: AppSpacing.sm),
        Container(
          padding: const EdgeInsets.all(AppSpacing.md),
          decoration: BoxDecoration(
            color: cs.surfaceContainerHighest.withAlpha(100),
            borderRadius: AppSpacing.borderRadiusSM,
            border: Border.all(color: AppColors.border),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              RichText(
                text: TextSpan(
                  style: AppTypography.bodySmall.copyWith(
                    color: cs.onSurfaceVariant,
                  ),
                  children: [
                    const TextSpan(
                      text:
                          'We want you to be completely satisfied with your purchase. If you change your mind, you can return the item within ',
                    ),
                    TextSpan(
                      text: '14 days',
                      style: AppTypography.bodySmall.copyWith(
                        fontWeight: FontWeight.w700,
                        color: cs.onSurface,
                      ),
                    ),
                    const TextSpan(text: ' of receiving it.'),
                  ],
                ),
              ),
              const SizedBox(height: AppSpacing.sm),
              _buildBullet(
                'Item must be in its original condition and packaging.',
                color,
                cs.onSurfaceVariant,
              ),
              _buildBullet(
                'Buyer is responsible for return shipping costs unless the item is defective.',
                color,
                cs.onSurfaceVariant,
              ),
              _buildBullet(
                'Refunds are processed within 3-5 business days of receiving the return.',
                color,
                cs.onSurfaceVariant,
              ),
              const SizedBox(height: AppSpacing.md),
              InkWell(
                onTap: () {},
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      'Read full return policy',
                      style: AppTypography.bodySmall.copyWith(
                        color: color,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(width: 4),
                    HugeIcon(
                      icon: HugeIcons.strokeRoundedArrowRight01,
                      size: 14,
                      color: color,
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildBullet(String text, Color color, Color onSurfaceVariant) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.only(top: 2),
            child: HugeIcon(
              icon: HugeIcons.strokeRoundedArrowRight01,
              size: 14,
              color: color,
            ),
          ),
          const SizedBox(width: AppSpacing.xs),
          Expanded(
            child: Text(
              text,
              style: AppTypography.bodySmall.copyWith(color: onSurfaceVariant),
            ),
          ),
        ],
      ),
    );
  }
}
