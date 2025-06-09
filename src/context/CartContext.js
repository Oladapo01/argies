import React, { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext();

const cartReducer = (state, action) => {
  console.log('🛒 Cart action:', action.type, action.payload);
  
  switch (action.type) {
    case 'LOAD_CART':
      console.log('📥 Loading cart:', action.payload);
      return { ...state, items: action.payload };
      
    case 'ADD_ITEM':
      console.log('➕ Adding item:', action.payload);
      const existingItem = state.items.find(item => item.id === action.payload.id);
      if (existingItem) {
        console.log('📦 Item exists, updating quantity');
        return {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      }
      console.log('🆕 New item, adding to cart');
      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: 1 }],
      };
    
    case 'REMOVE_ITEM':
      console.log('🗑️ Removing item:', action.payload.id);
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload.id),
      };
    
    case 'UPDATE_QUANTITY':
      console.log('🔢 Updating quantity:', action.payload);
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };
    
    case 'CLEAR_CART':
      console.log('🧹 Clearing cart');
      return { ...state, items: [] };
    
    default:
      console.log('❓ Unknown action:', action.type);
      return state;
  }
};

export const CartProvider = ({ children }) => {
  // Initialize with empty items array
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
  });

  // Load cart from localStorage on initial render
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const savedCart = localStorage.getItem('cart');
        console.log('💾 Loading cart from localStorage:', savedCart);
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart);
          console.log('📋 Parsed cart:', parsedCart);
          dispatch({ type: 'LOAD_CART', payload: parsedCart });
        } else {
          console.log('📭 No saved cart found');
        }
      }
    } catch (error) {
      console.error('❌ Error loading cart from localStorage:', error);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        console.log('💾 Saving cart to localStorage. Items count:', state.items.length);
        console.log('💾 Items:', state.items);
        localStorage.setItem('cart', JSON.stringify(state.items));
      }
    } catch (error) {
      console.error('❌ Error saving cart to localStorage:', error);
    }
  }, [state.items]);

  const addToCart = (product) => {
    console.log('🔄 addToCart called with:', product);
    if (!product || typeof product !== 'object') {
      console.error('❌ Invalid product:', product);
      return;
    }
    if (!product.id) {
      console.error('❌ Product missing ID:', product);
      return;
    }
    if (product.price === undefined || product.price === null) {
      console.error('❌ Product missing price:', product);
      return;
    }
    dispatch({ type: 'ADD_ITEM', payload: product });
  };

  const removeFromCart = (productId) => {
    console.log('🗑️ removeFromCart called with ID:', productId);
    dispatch({ type: 'REMOVE_ITEM', payload: { id: productId } });
  };

  const updateQuantity = (productId, quantity) => {
    console.log('🔢 updateQuantity called:', { productId, quantity });
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }
    dispatch({
      type: 'UPDATE_QUANTITY',
      payload: { id: productId, quantity },
    });
  };

  const clearCart = () => {
    console.log('🧹 clearCart called');
    dispatch({ type: 'CLEAR_CART' });
  };

  // Safe calculation of total with fallbacks
  const cartTotal = state.items.reduce(
    (total, item) => {
      const itemTotal = (item.price || 0) * (item.quantity || 0);
      console.log(`💰 Item ${item.id}: £${item.price} x ${item.quantity} = £${itemTotal}`);
      return total + itemTotal;
    },
    0
  );

  const itemCount = state.items.reduce((count, item) => count + (item.quantity || 0), 0);

  const cartValues = {
    items: state.items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartTotal,
    itemCount,
  };
  
  console.log('🛒 Current cart state:');
  console.log('   📦 Items:', state.items.length);
  console.log('   🔢 Total items:', itemCount);
  console.log('   💰 Total price:', cartTotal);
  console.log('   📋 Full items:', state.items);

  return (
    <CartContext.Provider value={cartValues}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    console.error('❌ useCart must be used within a CartProvider');
    return {
      items: [],
      addToCart: () => console.log('🚫 No cart context - addToCart called'),
      removeFromCart: () => console.log('🚫 No cart context - removeFromCart called'),
      updateQuantity: () => console.log('🚫 No cart context - updateQuantity called'),
      clearCart: () => console.log('🚫 No cart context - clearCart called'),
      cartTotal: 0,
      itemCount: 0
    };
  }
  return context;
};

export default CartContext;