import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem } from './types';
import { API_MODE } from '@/lib/api';
import * as cartApi from './api';

interface CartState {
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  isSyncing: boolean;
  
  // Actions
  addToCart: (item: Omit<CartItem, 'id'>) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  syncWithServer: () => Promise<void>;
  getTotalItems: () => number;
}

const calculateTotals = (items: CartItem[]) => {
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = API_MODE === 'mock' && items.length > 0 ? 150000 : 0;
  const total = subtotal + deliveryFee;
  return { subtotal, deliveryFee, total };
};

const setCart = (set: (state: Partial<CartState>) => void, cart: { data: import('./types').Cart }) => {
  set({
    items: cart.data.items,
    subtotal: cart.data.subtotal,
    deliveryFee: cart.data.deliveryFee,
    total: cart.data.total,
  });
};

type PendingQuantityUpdate = {
  timeoutId: ReturnType<typeof setTimeout>;
  quantity: number;
  resolvers: Array<() => void>;
  rejecters: Array<(error: unknown) => void>;
};

const pendingQuantityUpdates = new Map<string, PendingQuantityUpdate>();
const QUANTITY_DEBOUNCE_MS = 400;

const applyServerCart = (
  set: (state: Partial<CartState>) => void,
  cart: { data: import('./types').Cart }
) => {
  if (pendingQuantityUpdates.size === 0) {
    setCart(set, cart);
    return;
  }
  const mergedItems = cart.data.items.map((item) => {
    const pending = pendingQuantityUpdates.get(item.id);
    return pending ? { ...item, quantity: pending.quantity } : item;
  });
  set({
    items: mergedItems,
    ...calculateTotals(mergedItems),
  });
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      subtotal: 0,
      deliveryFee: 0,
      total: 0,
      isSyncing: false,

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      addToCart: async (newItem) => {
        set({ isSyncing: true });
        try {
          // Optimistic local update
          const { items } = get();
          const existingItemIndex = items.findIndex(
            i => i.productId === newItem.productId && 
                 JSON.stringify(i.attributes) === JSON.stringify(newItem.attributes)
          );
          
          const updatedItems = [...items];
          if (existingItemIndex >= 0) {
            updatedItems[existingItemIndex].quantity += newItem.quantity;
          } else {
            updatedItems.push({
              ...newItem,
              id: `cart-item-${Date.now()}` // Mock local ID
            });
          }
          
          const totals = calculateTotals(updatedItems);
          set({ items: updatedItems, ...totals });

          const cart = await cartApi.addToCart(newItem);
          applyServerCart(set, cart);
        } catch (error) {
          console.error('Failed to add cart item:', error);
          await get().syncWithServer();
        } finally {
          set({ isSyncing: false });
        }
      },

      removeFromCart: async (itemId) => {
        const pending = pendingQuantityUpdates.get(itemId);
        if (pending) {
          clearTimeout(pending.timeoutId);
          pendingQuantityUpdates.delete(itemId);
          pending.resolvers.forEach(r => r());
        }

        set({ isSyncing: true });
        try {
          const updatedItems = get().items.filter(i => i.id !== itemId);
          set({ items: updatedItems, ...calculateTotals(updatedItems) });
          const cart = await cartApi.removeFromCart(itemId);
          applyServerCart(set, cart);
        } catch (error) {
          console.error('Failed to remove cart item:', error);
          await get().syncWithServer();
        } finally {
          set({ isSyncing: false });
        }
      },

      updateQuantity: async (itemId, quantity) => {
        const safeQuantity = Math.max(1, quantity);

        // Optimistic local update
        const updatedItems = get().items.map((i) =>
          i.id === itemId ? { ...i, quantity: safeQuantity } : i
        );
        set({ items: updatedItems, ...calculateTotals(updatedItems) });

        // Cancel previous pending debounced call for this item
        const existing = pendingQuantityUpdates.get(itemId);
        if (existing) {
          clearTimeout(existing.timeoutId);
        }

        return new Promise<void>((resolve, reject) => {
          const resolvers = existing ? [...existing.resolvers, resolve] : [resolve];
          const rejecters = existing ? [...existing.rejecters, reject] : [reject];

          const timeoutId = setTimeout(async () => {
            pendingQuantityUpdates.delete(itemId);
            set({ isSyncing: true });
            try {
              const cart = await cartApi.updateCartItemQuantity(itemId, safeQuantity);
              applyServerCart(set, cart);
              resolvers.forEach((r) => r());
            } catch (error) {
              console.error('Failed to update cart item:', error);
              await get().syncWithServer();
              rejecters.forEach((r) => r(error));
            } finally {
              set({ isSyncing: false });
            }
          }, QUANTITY_DEBOUNCE_MS);

          pendingQuantityUpdates.set(itemId, {
            timeoutId,
            quantity: safeQuantity,
            resolvers,
            rejecters,
          });
        });
      },

      clearCart: async () => {
        pendingQuantityUpdates.forEach((pending) => {
          clearTimeout(pending.timeoutId);
          pending.resolvers.forEach((r) => r());
        });
        pendingQuantityUpdates.clear();

        set({ isSyncing: true });
        try {
          set({ items: [], subtotal: 0, deliveryFee: 0, total: 0 });
          const cart = await cartApi.clearCart();
          setCart(set, cart);
        } catch (error) {
          console.error('Failed to clear cart:', error);
          await get().syncWithServer();
        } finally {
          set({ isSyncing: false });
        }
      },

      syncWithServer: async () => {
        set({ isSyncing: true });
        try {
          const { data } = await cartApi.getCart();
          applyServerCart(set, { data });
        } catch (error) {
          console.error('Failed to sync cart:', error);
        } finally {
          set({ isSyncing: false });
        }
      }
    }),
    {
      name: 'aba-cart-storage',
    }
  )
);
