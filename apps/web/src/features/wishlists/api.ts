import { fetchApi } from '@/lib/api';

export type WishlistableType = 'product' | 'merchant';

export async function addToWishlist(wishlistableType: WishlistableType, wishlistableId: string | number) {
  return fetchApi('/api/v1/wishlists', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ wishlistableType, wishlistableId: Number(wishlistableId) }),
  });
}
