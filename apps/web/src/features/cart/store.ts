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
          
          let updatedItems = [...items];
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
          setCart(set, cart);
        } catch (error) {
          console.error('Failed to add cart item:', error);
          await get().syncWithServer();
        } finally {
          set({ isSyncing: false });
        }
      },

      removeFromCart: async (itemId) => {
        set({ isSyncing: true });
        try {
          const updatedItems = get().items.filter(i => i.id !== itemId);
          set({ items: updatedItems, ...calculateTotals(updatedItems) });
          const cart = await cartApi.removeFromCart(itemId);
          setCart(set, cart);
        } catch (error) {
          console.error('Failed to remove cart item:', error);
          await get().syncWithServer();
        } finally {
          set({ isSyncing: false });
        }
      },

      updateQuantity: async (itemId, quantity) => {
        set({ isSyncing: true });
        try {
           const updatedItems = get().items.map(i => i.id === itemId ? { ...i, quantity } : i);
           set({ items: updatedItems, ...calculateTotals(updatedItems) });
           const cart = await cartApi.updateCartItemQuantity(itemId, quantity);
           setCart(set, cart);
        } catch (error) {
           console.error('Failed to update cart item:', error);
           await get().syncWithServer();
           throw error;
        } finally {
           set({ isSyncing: false });
        }
      },

      clearCart: async () => {
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
          setCart(set, { data });
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
