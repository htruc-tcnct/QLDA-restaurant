import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCartStore = create(
    persist(
        (set, get) => ({
            // State
            items: [],
            isOpen: false,
            appliedPromotion: null,
            promotionCode: '',
            totalAmount: 0,
            discountAmount: 0,
            finalAmount: 0,

            // Actions
            addItem: (menuItem, quantity = 1, notes = '') => {
                set((state) => {
                    const existingItem = state.items.find(item => item.menuItem._id === menuItem._id);

                    let newItems;
                    if (existingItem) {
                        // Update existing item
                        newItems = state.items.map(item =>
                            item.menuItem._id === menuItem._id
                                ? { ...item, quantity: item.quantity + quantity, notes: notes || item.notes }
                                : item
                        );
                    } else {
                        // Add new item
                        newItems = [...state.items, {
                            id: Date.now(), // Unique ID for cart item
                            menuItem,
                            quantity,
                            notes,
                            price: menuItem.price
                        }];
                    }

                    return {
                        ...state,
                        items: newItems,
                        ...get().calculateTotals(newItems, state.appliedPromotion)
                    };
                });
            },

            removeItem: (itemId) => {
                set((state) => {
                    const newItems = state.items.filter(item => item.id !== itemId);
                    return {
                        ...state,
                        items: newItems,
                        ...get().calculateTotals(newItems, state.appliedPromotion)
                    };
                });
            },

            updateQuantity: (itemId, quantity) => {
                set((state) => {
                    if (quantity <= 0) {
                        return get().removeItem(itemId);
                    }

                    const newItems = state.items.map(item =>
                        item.id === itemId ? { ...item, quantity } : item
                    );

                    return {
                        ...state,
                        items: newItems,
                        ...get().calculateTotals(newItems, state.appliedPromotion)
                    };
                });
            },

            updateNotes: (itemId, notes) => {
                set((state) => ({
                    ...state,
                    items: state.items.map(item =>
                        item.id === itemId ? { ...item, notes } : item
                    )
                }));
            },

            clearCart: () => {
                set({
                    items: [],
                    appliedPromotion: null,
                    promotionCode: '',
                    totalAmount: 0,
                    discountAmount: 0,
                    finalAmount: 0
                });
            },

            toggleCart: () => {
                set((state) => ({ isOpen: !state.isOpen }));
            },

            openCart: () => {
                set({ isOpen: true });
            },

            closeCart: () => {
                set({ isOpen: false });
            },

            applyPromotion: (promotion, discountAmount) => {
                set((state) => {
                    const totals = get().calculateTotals(state.items, promotion);
                    return {
                        ...state,
                        appliedPromotion: promotion,
                        promotionCode: promotion.code,
                        discountAmount,
                        ...totals
                    };
                });
            },

            removePromotion: () => {
                set((state) => {
                    const totals = get().calculateTotals(state.items, null);
                    return {
                        ...state,
                        appliedPromotion: null,
                        promotionCode: '',
                        discountAmount: 0,
                        ...totals
                    };
                });
            },

            // Helper function to calculate totals
            calculateTotals: (items, promotion = null) => {
                const subtotal = items.reduce((total, item) => {
                    return total + (item.price * item.quantity);
                }, 0);

                let discountAmount = 0;
                if (promotion) {
                    if (promotion.type === 'percentage') {
                        discountAmount = subtotal * (promotion.value / 100);
                        if (promotion.maxDiscountAmount && discountAmount > promotion.maxDiscountAmount) {
                            discountAmount = promotion.maxDiscountAmount;
                        }
                    } else if (promotion.type === 'fixed_amount') {
                        discountAmount = Math.min(promotion.value, subtotal);
                    }
                }

                const finalAmount = Math.max(0, subtotal - discountAmount);

                return {
                    totalAmount: subtotal,
                    discountAmount,
                    finalAmount
                };
            },

            // Getters
            getCartCount: () => {
                return get().items.reduce((total, item) => total + item.quantity, 0);
            },

            getSubtotal: () => {
                return get().items.reduce((total, item) => total + (item.price * item.quantity), 0);
            }
        }),
        {
            name: 'cart-storage', // Storage key
            partialize: (state) => ({
                items: state.items,
                appliedPromotion: state.appliedPromotion,
                promotionCode: state.promotionCode,
                totalAmount: state.totalAmount,
                discountAmount: state.discountAmount,
                finalAmount: state.finalAmount
            })
        }
    )
);

export default useCartStore; 