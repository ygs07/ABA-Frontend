import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:hugeicons/hugeicons.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/widgets/app_widgets.dart';
import '../application/shop_providers.dart';
import '../domain/shop_entities.dart';
import 'widgets/category_chip_bar.dart';
import 'widgets/product_card.dart';
import 'widgets/shop_filter_sheet.dart';
import 'widgets/shop_search_bar.dart';
import 'widgets/sort_bottom_sheet.dart';

class ShopScreen extends ConsumerWidget {
  const ShopScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final catalogueAsync = ref.watch(shopCatalogueProvider);

    return catalogueAsync.when(
      loading: () =>
          const Scaffold(body: LoadingState(message: 'Loading shop…')),
      error: (e, _) => Scaffold(
        body: ErrorState(
          message: 'Could not load shop.\n${e.toString()}',
          onRetry: () => ref.invalidate(shopCatalogueProvider),
        ),
      ),
      data: (catalogue) => const _ShopBody(),
    );
  }
}

// ─── Main shop body ───────────────────────────────────────────────────────

class _ShopBody extends ConsumerWidget {
  const _ShopBody();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final shopState = ref.watch(shopNotifierProvider);
    final paginatedState = ref.watch(paginatedProductsNotifierProvider);
    final products = paginatedState.items;
    final catalogueAsync = ref.watch(shopCatalogueProvider);
    final categoriesAsync = ref.watch(productCategoriesProvider);
    final categories =
        categoriesAsync.valueOrNull ??
        catalogueAsync.valueOrNull?.categories ??
        const <ShopCategory>[];
    final cartCount = ref.watch(cartProvider).valueOrNull?.itemCount ?? 0;

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      body: InfiniteScrollListener(
        onLoadMore: () =>
            ref.read(paginatedProductsNotifierProvider.notifier).loadMore(),
        hasMore: paginatedState.hasMore,
        isLoading: paginatedState.isLoading,
        isLoadingMore: paginatedState.isLoadingMore,
        prefetchDistance: 250.0,
        child: RefreshIndicator(
          onRefresh: () => ref
              .read(paginatedProductsNotifierProvider.notifier)
              .fetchFirstPage(),
          child: CustomScrollView(
            slivers: [
              // ── App bar
              _ShopSliverAppBar(cartCount: cartCount),

              // ── Search bar
              SliverPadding(
                padding: const EdgeInsets.fromLTRB(
                  AppSpacing.md,
                  AppSpacing.sm,
                  AppSpacing.md,
                  0,
                ),
                sliver: SliverToBoxAdapter(
                  child: ShopSearchBar(
                    initialValue: shopState.searchQuery,
                    onChanged: (q) =>
                        ref.read(shopNotifierProvider.notifier).setSearch(q),
                  ),
                ),
              ),

              // ── Category chips
              SliverToBoxAdapter(
                child: CategoryChipBar(
                  categories: categories,
                  selected: shopState.selectedCategory,
                  isLoading: categoriesAsync.isLoading && categories.isEmpty,
                  onSelect: (cat) =>
                      ref.read(shopNotifierProvider.notifier).setCategory(cat),
                ),
              ),

              // ── Sort / filter / view mode bar
              SliverPadding(
                padding: const EdgeInsets.symmetric(
                  horizontal: AppSpacing.md,
                  vertical: AppSpacing.xs,
                ),
                sliver: SliverToBoxAdapter(
                  child: _ShopToolbar(
                    sort: shopState.sort,
                    viewMode: shopState.viewMode,
                    filterActive: shopState.filter.isActive,
                    productCount: paginatedState.totalCount > 0
                        ? paginatedState.totalCount
                        : products.length,
                  ),
                ),
              ),

              // ── Ads Banner
              const SliverPadding(
                padding: EdgeInsets.fromLTRB(
                  AppSpacing.md,
                  AppSpacing.sm,
                  AppSpacing.md,
                  AppSpacing.sm,
                ),
                sliver: SliverToBoxAdapter(child: _AdsBanner()),
              ),

              // ── Product grid / list
              if (paginatedState.isInitialLoading)
                const SliverToBoxAdapter(
                  child: Padding(
                    padding: EdgeInsets.all(AppSpacing.xxl),
                    child: Center(child: CircularProgressIndicator.adaptive()),
                  ),
                )
              else if (products.isEmpty)
                const SliverFillRemaining(child: _EmptyProducts())
              else if (shopState.viewMode == ViewMode.grid)
                SliverPadding(
                  padding: const EdgeInsets.fromLTRB(
                    AppSpacing.md,
                    0,
                    AppSpacing.md,
                    AppSpacing.md,
                  ),
                  sliver: SliverGrid(
                    delegate: SliverChildBuilderDelegate(
                      (context, i) => ProductCard(product: products[i]),
                      childCount: products.length,
                    ),
                    gridDelegate:
                        const SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: 2,
                          crossAxisSpacing: AppSpacing.sm,
                          mainAxisSpacing: AppSpacing.sm,
                          childAspectRatio: 0.68,
                        ),
                  ),
                )
              else
                SliverPadding(
                  padding: const EdgeInsets.fromLTRB(
                    AppSpacing.md,
                    0,
                    AppSpacing.md,
                    AppSpacing.md,
                  ),
                  sliver: SliverList(
                    delegate: SliverChildBuilderDelegate(
                      (context, i) =>
                          ProductCard(product: products[i], listMode: true),
                      childCount: products.length,
                    ),
                  ),
                ),

              // ── Bottom Loading Indicator
              if (paginatedState.isLoadingMore)
                const SliverToBoxAdapter(
                  child: Padding(
                    padding: EdgeInsets.symmetric(vertical: AppSpacing.md),
                    child: Center(
                      child: SizedBox(
                        width: 24,
                        height: 24,
                        child: CircularProgressIndicator.adaptive(
                          strokeWidth: 2.5,
                        ),
                      ),
                    ),
                  ),
                ),

              // ── Bottom Sections
              const SliverToBoxAdapter(
                child: Padding(
                  padding: EdgeInsets.only(top: AppSpacing.xl),
                  child: _PopularBrands(),
                ),
              ),
              const SliverToBoxAdapter(
                child: Padding(
                  padding: EdgeInsets.symmetric(vertical: AppSpacing.xl),
                  child: _RelatedSearches(),
                ),
              ),
              const SliverToBoxAdapter(
                child: SizedBox(height: 120), // Clearance for floating nav bar
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ─── Sliver app bar ───────────────────────────────────────────────────────

class _ShopSliverAppBar extends StatelessWidget {
  const _ShopSliverAppBar({required this.cartCount});
  final int cartCount;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return SliverAppBar(
      pinned: true,
      backgroundColor: cs.primary,
      title: Text(
        'Shop',
        style: AppTypography.h6.copyWith(
          color: Colors.white,
          fontWeight: FontWeight.w700,
        ),
      ),
      actions: [
        Stack(
          clipBehavior: Clip.none,
          children: [
            IconButton(
              icon: const HugeIcon(
                icon: HugeIcons.strokeRoundedShoppingCart01,
                color: Colors.white,
                size: AppSpacing.iconSizeMD,
              ),
              onPressed: () => context.push('/cart'),
            ),
            if (cartCount > 0)
              Positioned(
                top: 6,
                right: 6,
                child: Container(
                  width: 16,
                  height: 16,
                  decoration: const BoxDecoration(
                    color: AppColors.error,
                    shape: BoxShape.circle,
                  ),
                  child: Center(
                    child: Text(
                      cartCount > 9 ? '9+' : '$cartCount',
                      style: AppTypography.label.copyWith(
                        color: Colors.white,
                        fontSize: 9,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                ),
              ),
          ],
        ),
        const SizedBox(width: AppSpacing.xs),
      ],
    );
  }
}

// ─── Toolbar (sort + filter + view toggle) ─────────────────────────────────

class _ShopToolbar extends ConsumerWidget {
  const _ShopToolbar({
    required this.sort,
    required this.viewMode,
    required this.filterActive,
    required this.productCount,
  });
  final SortOrder sort;
  final ViewMode viewMode;
  final bool filterActive;
  final int productCount;

  String get _sortLabel {
    switch (sort) {
      case SortOrder.featured:
        return 'Featured';
      case SortOrder.nameAsc:
        return 'A–Z';
      case SortOrder.nameDesc:
        return 'Z–A';
      case SortOrder.priceLow:
        return 'Price ↑';
      case SortOrder.priceHigh:
        return 'Price ↓';
      case SortOrder.newest:
        return 'Newest';
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final cs = Theme.of(context).colorScheme;
    final notifier = ref.read(shopNotifierProvider.notifier);

    return Row(
      children: [
        Text(
          '$productCount items',
          style: AppTypography.bodySmall.copyWith(
            color: cs.onSurface.withAlpha(153),
          ),
        ),
        const Spacer(),

        // Sort button
        _ToolbarButton(
          icon: HugeIcons.strokeRoundedSorting01,
          label: _sortLabel,
          onTap: () => showSortSheet(context, sort, (s) => notifier.setSort(s)),
        ),
        const SizedBox(width: AppSpacing.sm),

        // Filter button
        _ToolbarButton(
          icon: HugeIcons.strokeRoundedFilterHorizontal,
          label: 'Filter',
          active: filterActive,
          onTap: () => showShopFilterSheet(context),
        ),
        const SizedBox(width: AppSpacing.sm),

        // Grid/List toggle
        GestureDetector(
          onTap: () => notifier.setViewMode(
            viewMode == ViewMode.grid ? ViewMode.list : ViewMode.grid,
          ),
          child: Container(
            padding: const EdgeInsets.all(AppSpacing.xs),
            decoration: BoxDecoration(
              color: cs.surfaceContainerHighest,
              borderRadius: AppSpacing.borderRadiusSM,
            ),
            child: HugeIcon(
              icon: viewMode == ViewMode.grid
                  ? HugeIcons.strokeRoundedGridView
                  : HugeIcons.strokeRoundedListView,
              size: AppSpacing.iconSizeSM,
              color: cs.onSurface,
            ),
          ),
        ),
      ],
    );
  }
}

class _ToolbarButton extends StatelessWidget {
  const _ToolbarButton({
    required this.icon,
    required this.label,
    required this.onTap,
    this.active = false,
  });
  final List<List<dynamic>> icon;
  final String label;
  final VoidCallback onTap;
  final bool active;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final primaryColor = isDark ? cs.secondary : cs.primary;
    final color = active ? primaryColor : cs.onSurface;

    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.sm,
          vertical: AppSpacing.xs,
        ),
        decoration: BoxDecoration(
          color: active
              ? primaryColor.withAlpha(20)
              : cs.surfaceContainerHighest,
          borderRadius: AppSpacing.borderRadiusSM,
          border: active
              ? Border.all(color: primaryColor.withAlpha(80), width: 1)
              : null,
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            HugeIcon(icon: icon, size: 14, color: color),
            const SizedBox(width: 4),
            Text(label, style: AppTypography.label.copyWith(color: color)),
          ],
        ),
      ),
    );
  }
}

// ─── Empty state ──────────────────────────────────────────────────────────

class _EmptyProducts extends ConsumerWidget {
  const _EmptyProducts();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const HugeIcon(
            icon: HugeIcons.strokeRoundedSearchList01,
            size: AppSpacing.iconSizeXXL,
            color: AppColors.grey,
          ),
          AppSpacing.verticalSpaceMD,
          Text(
            'No products found',
            style: AppTypography.h6.copyWith(color: AppColors.grey),
          ),
          AppSpacing.verticalSpaceXS,
          Text(
            'Try adjusting your filters',
            style: AppTypography.bodySmall.copyWith(color: AppColors.grey),
          ),
          AppSpacing.verticalSpaceMD,
          TextButton(
            onPressed: () =>
                ref.read(shopNotifierProvider.notifier).resetFilters(),
            child: const Text('Clear filters'),
          ),
        ],
      ),
    );
  }
}

class _AdsBanner extends StatefulWidget {
  const _AdsBanner();

  @override
  State<_AdsBanner> createState() => _AdsBannerState();
}

class _AdsBannerState extends State<_AdsBanner> {
  final PageController _controller = PageController();
  Timer? _autoSlideTimer;
  int _currentPage = 0;

  final List<String> _banners = const [
    'assets/images/banners/BuyNaija_ Shop Local, Shop Aba.png',
    'assets/images/banners/AbaOnline_ Shop Local, Grow Together.png',
    'assets/images/banners/Shop Local, Support Aba.png',
  ];

  @override
  void initState() {
    super.initState();
    _startAutoSlide();
  }

  void _startAutoSlide() {
    _autoSlideTimer?.cancel();
    _autoSlideTimer = Timer.periodic(const Duration(seconds: 4), (_) {
      if (!mounted || !_controller.hasClients) return;
      final nextPage = (_currentPage + 1) % _banners.length;
      _controller.animateToPage(
        nextPage,
        duration: const Duration(milliseconds: 600),
        curve: Curves.easeInOutCubic,
      );
    });
  }

  @override
  void dispose() {
    _autoSlideTimer?.cancel();
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        SizedBox(
          height: 140,
          child: PageView.builder(
            controller: _controller,
            onPageChanged: (i) {
              setState(() => _currentPage = i);
              _startAutoSlide();
            },
            itemCount: _banners.length,
            itemBuilder: (context, i) {
              return ClipRRect(
                borderRadius: AppSpacing.borderRadiusLG,
                child: Image.asset(_banners[i], fit: BoxFit.cover),
              );
            },
          ),
        ),
        const SizedBox(height: AppSpacing.sm),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: List.generate(
            _banners.length,
            (i) => AnimatedContainer(
              duration: AppSpacing.animationFast,
              margin: const EdgeInsets.symmetric(horizontal: 4),
              width: _currentPage == i ? 16 : 8,
              height: 8,
              decoration: BoxDecoration(
                color: _currentPage == i
                    ? AppColors.primary
                    : AppColors.grey.withAlpha(100),
                borderRadius: BorderRadius.circular(4),
              ),
            ),
          ),
        ),
      ],
    );
  }
}

class _PopularBrands extends ConsumerWidget {
  const _PopularBrands();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final brandsAsync = ref.watch(popularBrandsProvider);
    final brands =
        brandsAsync.valueOrNull?.map((b) => b.name).toList() ??
        const ['Nike', 'Adidas', 'Gucci', 'Aba Artisans', 'Puma', 'Zara'];
    if (brands.isEmpty) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
          child: Text(
            'Popular Brands',
            style: AppTypography.h6.copyWith(fontWeight: FontWeight.bold),
          ),
        ),
        const SizedBox(height: AppSpacing.sm),
        SizedBox(
          height: 40,
          child: ListView.separated(
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
            scrollDirection: Axis.horizontal,
            itemCount: brands.length,
            separatorBuilder: (_, __) => const SizedBox(width: AppSpacing.sm),
            itemBuilder: (context, i) => ActionChip(
              label: Text(brands[i]),
              backgroundColor: Theme.of(
                context,
              ).colorScheme.surfaceContainerHighest,
              onPressed: () {
                ref.read(shopNotifierProvider.notifier).setSearch(brands[i]);
              },
              side: BorderSide.none,
              shape: const RoundedRectangleBorder(
                borderRadius: AppSpacing.borderRadiusSM,
              ),
            ),
          ),
        ),
      ],
    );
  }
}

class _RelatedSearches extends StatelessWidget {
  const _RelatedSearches();

  @override
  Widget build(BuildContext context) {
    final searches = [
      'Leather bags',
      'Men shoes',
      'Traditional wear',
      'Accessories',
      'Wholesale fabrics',
    ];
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Related Searches',
            style: AppTypography.h6.copyWith(fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: AppSpacing.sm),
          Wrap(
            spacing: AppSpacing.sm,
            runSpacing: AppSpacing.xs,
            children: searches
                .map(
                  (s) => ActionChip(
                    label: Text(s),
                    onPressed: () {},
                    side: BorderSide(color: AppColors.outline.withAlpha(100)),
                    backgroundColor: Colors.transparent,
                    shape: const RoundedRectangleBorder(
                      borderRadius: AppSpacing.borderRadiusSM,
                    ),
                  ),
                )
                .toList(),
          ),
        ],
      ),
    );
  }
}
