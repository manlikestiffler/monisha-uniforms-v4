import React, { createContext, useState, useEffect, useContext } from 'react';
import firebaseService from '../services/firebase';
import { useAuth } from './AuthContext';
import { getFirestore, collection, onSnapshot, getDocs, deleteDoc } from 'firebase/firestore';

const CartContext = createContext();

export const useCart = () => {
  return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartLoading, setCartLoading] = useState(true);
  const { currentUser, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) {
      return; // Wait for authentication to initialize
    }

    let unsubscribe = () => {};
    
    const loadCart = async () => {
      try {
        console.log("CartContext: Loading cart data");
        const items = await firebaseService.getCart(currentUser); // Pass user to getCart
        console.log("CartContext: Loaded items:", items);
        setCartItems(items);
      } catch (err) {
        console.error("CartContext: Error loading cart:", err);
      } finally {
        setCartLoading(false);
      }
    };

    loadCart();

    if (currentUser) {
      const db = getFirestore();
      const cartRef = collection(db, "ecom users", currentUser.uid, "cart");
      unsubscribe = onSnapshot(cartRef, (snapshot) => {
        const items = snapshot.docs.map(doc => ({
          docId: doc.id,
          ...doc.data()
        }));
        setCartItems(items);
        setCartLoading(false);
      });
    } else {
      const handleStorageChange = () => {
        const localCart = JSON.parse(localStorage.getItem('cart')) || [];
        setCartItems(localCart);
      };
      
      window.addEventListener('storage', handleStorageChange);
      
      unsubscribe = () => {
        window.removeEventListener('storage', handleStorageChange);
      };
    }

    return () => unsubscribe();
  }, [currentUser, authLoading]);

  const addToCart = async (cartItem) => {
    try {
      console.log("CartContext: Adding to cart:", cartItem);
      
      const normalizedItem = {
        ...cartItem,
        id: cartItem.id || `item_${Date.now()}`,
        quantity: cartItem.quantity || 1,
        price: parseFloat(cartItem.price) || 0,
        addedAt: cartItem.addedAt || new Date()
      };
      
      if (!currentUser) {
        const currentCart = JSON.parse(localStorage.getItem('cart')) || [];
        const existingItemIndex = currentCart.findIndex(item => item.id === normalizedItem.id && item.size === normalizedItem.size);
        
        let updatedCart;
        if (existingItemIndex >= 0) {
          updatedCart = [...currentCart];
          updatedCart[existingItemIndex] = {
            ...updatedCart[existingItemIndex],
            quantity: (updatedCart[existingItemIndex].quantity || 0) + (normalizedItem.quantity || 1)
          };
        } else {
          updatedCart = [...currentCart, normalizedItem];
        }
        
        setCartItems(updatedCart);
      } else {
        const existingItem = cartItems.find(item => item.id === normalizedItem.id && item.size === normalizedItem.size);
        
        if (existingItem) {
          const updatedItems = cartItems.map(item => 
            item.id === normalizedItem.id 
              ? { ...item, quantity: (item.quantity || 0) + (normalizedItem.quantity || 1) }
              : item
          );
          setCartItems(updatedItems);
        } else {
          setCartItems([...cartItems, { ...normalizedItem, docId: `temp_${Date.now()}` }]);
        }
      }
      
      await firebaseService.addToCart(normalizedItem, currentUser);
      
      return true;
    } catch (error) {
      console.error("CartContext: Error adding to cart:", error);
      throw error;
    }
  };

  const removeFromCart = async (cartItemId) => {
    try {
      console.log("CartContext: Removing from cart, id:", cartItemId);
      const item = cartItems.find(item => item.id === cartItemId || item.docId === cartItemId);
      if (!item) {
        console.warn("CartContext: Item not found for removal:", cartItemId);
        return false;
      }

      setCartItems(cartItems.filter(item => 
        item.id !== cartItemId && item.docId !== cartItemId
      ));

      const idToRemove = item.docId || item.id;
      console.log("CartContext: Using ID for removal:", idToRemove);
      await firebaseService.removeFromCart(idToRemove, currentUser);
      
      return true;
    } catch (error) {
      console.error("CartContext: Error removing from cart:", error);
      throw error;
    }
  };

  const updateCartItemQuantity = async (cartItemId, newQuantity) => {
    try {
      console.log("CartContext: Updating quantity, id:", cartItemId, "quantity:", newQuantity);
      const item = cartItems.find(item => item.id === cartItemId || item.docId === cartItemId);
      if (!item) {
        console.warn("CartContext: Item not found for update:", cartItemId);
        return false;
      }
      
      setCartItems(cartItems.map(item => 
        (item.id === cartItemId || item.docId === cartItemId)
          ? { ...item, quantity: newQuantity }
          : item
      ));
      
      const idToUpdate = item.docId || item.id;
      console.log("CartContext: Using ID for update:", idToUpdate);
      await firebaseService.updateCartItemQuantity(idToUpdate, newQuantity, currentUser);
      
      return true;
    } catch (error) {
      console.error("CartContext: Error updating cart quantity:", error);
      throw error;
    }
  };

  const totalItems = cartItems.reduce((total, item) => total + (parseInt(item.quantity) || 1), 0);
  const subtotal = cartItems.reduce((total, item) => total + ((parseFloat(item.price) || 0) * (parseInt(item.quantity) || 1)), 0);

  const clearCart = async () => {
    const originalCart = [...cartItems];
    setCartItems([]);
    
    localStorage.removeItem('cart');
    
    if (currentUser) {
      try {
        const db = getFirestore();
        const cartRef = collection(db, "ecom users", currentUser.uid, "cart");
        const snapshot = await getDocs(cartRef);
        for (const doc of snapshot.docs) {
          await deleteDoc(doc.ref);
        }
      } catch (error) {
        console.error("Error clearing Firestore cart:", error);
        setCartItems(originalCart); // Revert on error
      }
    }
  };

  const value = {
    cartItems,
    loading: cartLoading,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    totalItems,
    subtotal
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}; 