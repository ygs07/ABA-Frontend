import 'dart:async';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/widgets/app_network_image.dart';

/// Interactive Hero Banner Carousel matching Web Storefront (HeroBanner.tsx).
/// Slides through the 3 authentic local banners with page indicator & tap actions.
class HomeHeroBanner extends StatefulWidget {
  const HomeHeroBanner({super.key, this.imageUrl});
  final String? imageUrl;

  @override
  State<HomeHeroBanner> createState() => _HomeHeroBannerState();
}

class _HomeHeroBannerState extends State<HomeHeroBanner> {
  late final PageController _controller;
  int _currentPage = 0;
  Timer? _timer;

  static const List<_BannerItem> _banners = [
    _BannerItem(
      assetPath: 'assets/images/banners/BuyNaija_ Shop Local, Shop Aba.png',
      tag: 'SHOP LOCAL',
      title: 'Shop Local, BuyNaija',
      subtitle: 'Direct from authentic makers & manufacturers',
    ),
    _BannerItem(
      assetPath:
          'assets/images/banners/AbaOnline_ Shop Local, Grow Together.png',
      tag: 'GROW TOGETHER',
      title: 'Support Nigerian Craft',
      subtitle: 'Empowering workshops, artisans & businesses',
    ),
    _BannerItem(
      assetPath: 'assets/images/banners/Shop Local, Support Aba.png',
      tag: 'MADE IN NIGERIA',
      title: 'Pride in Local Production',
      subtitle: 'Quality leather, textiles & footwear delivered nationwide',
    ),
  ];

  @override
  void initState() {
    super.initState();
    _controller = PageController();
    _timer = Timer.periodic(const Duration(seconds: 5), (timer) {
      if (!mounted) return;
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
    _timer?.cancel();
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        SizedBox(
          height: 190,
          child: PageView.builder(
            controller: _controller,
            itemCount: _banners.length,
            onPageChanged: (index) {
              setState(() => _currentPage = index);
            },
            itemBuilder: (context, index) {
              final banner = _banners[index];
              return Padding(
                padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
                child: GestureDetector(
                  onTap: () => context.go('/shop'),
                  child: Container(
                    decoration: BoxDecoration(
                      borderRadius: AppSpacing.borderRadiusXL,
                      color: AppColors.primary,
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withAlpha(20),
                          blurRadius: 12,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    clipBehavior: Clip.antiAlias,
                    child: Stack(
                      fit: StackFit.expand,
                      children: [
                        // Banner background image
                        Image.asset(
                          banner.assetPath,
                          fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) => AppNetworkImage(
                            imageUrl: widget.imageUrl,
                            fit: BoxFit.cover,
                            fallbackType: AppImageFallbackType.banner,
                            errorWidget: (_, __, ___) =>
                                Container(color: AppColors.primary),
                          ),
                        ),

                        // Gradient overlay for contrast
                        Container(
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              begin: Alignment.topCenter,
                              end: Alignment.bottomCenter,
                              colors: [
                                Colors.black.withAlpha(40),
                                Colors.black.withAlpha(180),
                              ],
                            ),
                          ),
                        ),

                        // Banner content text
                        Positioned(
                          bottom: AppSpacing.md,
                          left: AppSpacing.md,
                          right: AppSpacing.md,
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: AppSpacing.sm,
                                  vertical: 3,
                                ),
                                decoration: const BoxDecoration(
                                  color: Color(0xFFC28B38),
                                  borderRadius: AppSpacing.borderRadiusSM,
                                ),
                                child: Text(
                                  banner.tag,
                                  style: AppTypography.caption.copyWith(
                                    color: Colors.white,
                                    fontWeight: FontWeight.w800,
                                    letterSpacing: 0.8,
                                    fontSize: 9,
                                  ),
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                banner.title,
                                style: AppTypography.h4.copyWith(
                                  color: Colors.white,
                                  fontWeight: FontWeight.w900,
                                ),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                banner.subtitle,
                                style: AppTypography.caption.copyWith(
                                  color: Colors.white.withAlpha(220),
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              );
            },
          ),
        ),
        const SizedBox(height: AppSpacing.sm),

        // Indicator dots
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: List.generate(_banners.length, (index) {
            final isActive = index == _currentPage;
            return AnimatedContainer(
              duration: const Duration(milliseconds: 300),
              margin: const EdgeInsets.symmetric(horizontal: 3),
              width: isActive ? 20 : 6,
              height: 6,
              decoration: BoxDecoration(
                color: isActive
                    ? AppColors.primary
                    : AppColors.grey.withAlpha(80),
                borderRadius: BorderRadius.circular(3),
              ),
            );
          }),
        ),
      ],
    );
  }
}

class _BannerItem {
  const _BannerItem({
    required this.assetPath,
    required this.tag,
    required this.title,
    required this.subtitle,
  });

  final String assetPath;
  final String tag;
  final String title;
  final String subtitle;
}
