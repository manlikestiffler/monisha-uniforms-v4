// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, collection, getDocs, getDoc, doc, query, orderBy, limit, where, addDoc, updateDoc, deleteDoc, setDoc, arrayUnion, arrayRemove, serverTimestamp, onSnapshot } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail, onAuthStateChanged, sendEmailVerification, updateProfile } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDHkE3k09XUzW1ONjN914fWgAHRPDTtsms",
  authDomain: "monisha-databse.firebaseapp.com",
  projectId: "monisha-databse",
  storageBucket: "monisha-databse.firebasestorage.app",
  messagingSenderId: "10224835048",
  appId: "1:10224835048:web:41ebdf9453a559c97fec5d",
  measurementId: "G-J8J31DHXBZ"
};

// IMPORTANT: The configuration above is now hardcoded with the provided values.
// If you need to switch back to using environment variables, you can revert this change.

let app;
let analytics;
let db;
let auth;
let storage;

try {
  // Initialize Firebase
  app = initializeApp(firebaseConfig);
  analytics = getAnalytics(app);
  db = getFirestore(app);
  auth = getAuth(app);
  storage = getStorage(app);
  console.log("Firebase initialized successfully");
} catch (error) {
  console.error("Error initializing Firebase:", error);
  
  // Create mock implementations if Firebase fails to initialize
  db = {
    collection: () => ({
      // Mock implementation
    })
  };
  
  auth = {
    currentUser: null,
    onAuthStateChanged: (callback) => {
      callback(null);
      return () => {};
    }
  };
  
  storage = {
    ref: () => ({
      // Mock implementation
    })
  };
}

// Helper function to generate a unique user ID or get existing one
const getUserId = () => {
  let userId = localStorage.getItem('userId');
  if (!userId) {
    userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
    localStorage.setItem('userId', userId);
  }
  return userId;
};

// Firebase service functions
const firebaseService = {
  // Get all uniforms
  getAllUniforms: async () => {
    try {
      const uniformsRef = collection(db, "uniforms");
      const q = query(uniformsRef, orderBy("createdAt", "desc"));
      const uniformsSnapshot = await getDocs(q);
      return uniformsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Error getting uniforms:", error);
      throw error;
    }
  },

  // Get recent uniforms with real-time listener
  getRecentUniforms: (callback, limitCount = 3) => {
    try {
      const uniformsRef = collection(db, "uniforms");
      const q = query(uniformsRef, orderBy("createdAt", "desc"), limit(limitCount));
      
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const uniforms = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        callback(uniforms);
      });

      return unsubscribe; // Return the unsubscribe function to be called on cleanup
    } catch (error) {
      console.error("Error setting up real-time listener for recent uniforms:", error);
      throw error;
    }
  },

  // Get top rated uniforms with real-time listener
  getTopRatedUniformsWithListener: (callback, limitCount = 4) => {
    try {
      const uniformsRef = collection(db, "uniforms");
      const q = query(uniformsRef, orderBy("rating", "desc"), limit(limitCount));

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const uniforms = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        callback(uniforms);
      }, (error) => {
        console.error("Error with top-rated uniforms listener: ", error);
        // Fallback to recent uniforms if rating index is missing
        return firebaseService.getRecentUniforms(callback, limitCount);
      });

      return unsubscribe;
    } catch (error) {
      console.error("Error setting up real-time listener for top-rated uniforms:", error);
      throw error;
    }
  },

  // Get uniform by ID
  getUniformById: async (id) => {
    try {
      const uniformRef = doc(db, "uniforms", id);
      const uniformSnapshot = await getDoc(uniformRef);
      
      if (uniformSnapshot.exists()) {
        return {
          id: uniformSnapshot.id,
          ...uniformSnapshot.data()
        };
      } else {
        throw new Error("Uniform not found");
      }
    } catch (error) {
      console.error("Error getting uniform:", error);
      throw error;
    }
  },

  // Get uniforms by category
  getUniformsByCategory: async (category) => {
    try {
      const uniformsRef = collection(db, "uniforms");
      const q = query(uniformsRef, where("category", "==", category));
      const uniformsSnapshot = await getDocs(q);
      return uniformsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Error getting uniforms by category:", error);
      throw error;
    }
  },

  // Get uniforms by school
  getUniformsBySchool: async (schoolId) => {
    try {
      const uniformsRef = collection(db, "uniforms");
      const q = query(uniformsRef, where("school", "==", schoolId));
      const uniformsSnapshot = await getDocs(q);
      return uniformsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Error getting uniforms by school:", error);
      throw error;
    }
  },

  // Get all schools
  getAllSchools: async () => {
    try {
      const schoolsRef = collection(db, "schools");
      const schoolsSnapshot = await getDocs(schoolsRef);
      return schoolsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Error getting schools:", error);
      throw error;
    }
  },

  // Get school by ID
  getSchoolById: async (id) => {
    try {
      const schoolRef = doc(db, "schools", id);
      const schoolSnapshot = await getDoc(schoolRef);
      
      if (schoolSnapshot.exists()) {
        return {
          id: schoolSnapshot.id,
          ...schoolSnapshot.data()
        };
      } else {
        throw new Error("School not found");
      }
    } catch (error) {
      console.error("Error getting school:", error);
      throw error;
    }
  },

  // CART FUNCTIONS
  // Get cart items
  getCart: async () => {
    try {
      const user = auth.currentUser;
      console.log('getCart - User:', user ? user.uid : 'No user logged in');
      
      if (!user) {
        // Return localStorage cart if not logged in
        console.log('getCart - Using localStorage');
        const localCart = JSON.parse(localStorage.getItem('cart')) || [];
        console.log('getCart - Local cart items:', localCart);
        return localCart;
      }
      
      // Get cart from Firebase
      console.log('getCart - Using Firestore');
      const cartRef = collection(db, "ecom users", user.uid, "cart");
      const snapshot = await getDocs(cartRef);
      console.log('getCart - Snapshot size:', snapshot.size);
      
      const cart = snapshot.docs.map(doc => {
        const data = doc.data();
        console.log('getCart - Document ID:', doc.id);
        console.log('getCart - Document data:', data);
        return {
          docId: doc.id, // Store the document ID separately
          ...data
        };
      });
      
      console.log('getCart - Processed cart items:', cart);
      return cart;
    } catch (error) {
      console.error("Error getting cart:", error);
      return [];
    }
  },

  // Add item to cart
  addToCart: async (cartItem) => {
    try {
      const user = auth.currentUser;
      console.log('addToCart - User:', user ? user.uid : 'No user logged in');
      console.log('addToCart - Item:', cartItem);
      
      if (!user) {
        // Store in localStorage if not logged in
        console.log('addToCart - Using localStorage');
        const currentCart = JSON.parse(localStorage.getItem('cart')) || [];
        
        // Make sure the item has the required properties
        const normalizedItem = {
          ...cartItem,
          id: cartItem.id || `item_${Date.now()}`,
          quantity: cartItem.quantity || 1,
          price: parseFloat(cartItem.price) || 0,
          addedAt: cartItem.addedAt || new Date()
        };
        
        const existingItemIndex = currentCart.findIndex(item => item.id === normalizedItem.id);
        
        if (existingItemIndex >= 0) {
          // If item exists, update quantity
          currentCart[existingItemIndex].quantity += normalizedItem.quantity;
        } else {
          // Add new item
          currentCart.push(normalizedItem);
        }
        
        localStorage.setItem('cart', JSON.stringify(currentCart));
        
        // Dispatch a custom event to notify components
        window.dispatchEvent(new CustomEvent('cartUpdated', { 
          detail: { items: currentCart }
        }));
        
        return true;
      }
      
      // Check if item already exists in cart
      const cartRef = collection(db, "ecom users", user.uid, "cart");
      const q = query(cartRef, where("id", "==", cartItem.id), where("size", "==", cartItem.size));
      const snapshot = await getDocs(q);
      
      // Make sure the item has the required properties
      const normalizedItem = {
        ...cartItem,
        id: cartItem.id || `item_${Date.now()}`,
        quantity: cartItem.quantity || 1,
        price: parseFloat(cartItem.price) || 0,
        addedAt: cartItem.addedAt || new Date()
      };
      
      if (snapshot.empty) {
        // Add new item to cart
        console.log('addToCart - Adding new item to Firestore');
        await addDoc(cartRef, {
          ...normalizedItem,
          addedAt: serverTimestamp()
        });
      } else {
        // Update quantity of existing item
        console.log('addToCart - Updating existing item in Firestore');
        const existingCartItem = snapshot.docs[0];
        const existingQuantity = existingCartItem.data().quantity || 0;
        await updateDoc(existingCartItem.ref, {
          quantity: existingQuantity + (normalizedItem.quantity || 1)
        });
      }
      
      return true;
    } catch (error) {
      console.error("Error adding to cart:", error);
      return false;
    }
  },

  // Remove item from cart
  removeFromCart: async (cartItemId) => {
    try {
      const user = auth.currentUser;
      console.log('removeFromCart - User:', user ? user.uid : 'No user logged in');
      console.log('removeFromCart - Item ID:', cartItemId);
      
      if (!user) {
        // Remove from localStorage if not logged in
        console.log('removeFromCart - Using localStorage');
        const currentCart = JSON.parse(localStorage.getItem('cart')) || [];
        console.log('removeFromCart - Current cart items:', currentCart.length);
        const updatedCart = currentCart.filter(item => item.id !== cartItemId);
        console.log('removeFromCart - Updated cart items:', updatedCart.length);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
        
        // Dispatch a custom event to notify components
        window.dispatchEvent(new CustomEvent('cartUpdated', { 
          detail: { items: updatedCart }
        }));
        
        return true;
      }
      
      // Remove from Firestore
      // First, we need to get the document ID for the item with the given product ID
      const cartRef = collection(db, "ecom users", user.uid, "cart");
      
      // Check if cartItemId is a document ID or a product ID
      if (cartItemId.includes('/')) {
        // It's likely a document path, extract the document ID
        const parts = cartItemId.split('/');
        cartItemId = parts[parts.length - 1];
        console.log('removeFromCart - Extracted document ID:', cartItemId);
        await deleteDoc(doc(db, "ecom users", user.uid, "cart", cartItemId));
      } else {
        // Try to find the document with this product ID
        console.log('removeFromCart - Looking for product with ID:', cartItemId);
        const q = query(cartRef, where("id", "==", cartItemId));
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
          const docToDelete = snapshot.docs[0];
          console.log('removeFromCart - Found document to delete:', docToDelete.id);
          await deleteDoc(docToDelete.ref);
        } else {
          // If not found by product ID, try as document ID directly
          console.log('removeFromCart - Using as document ID:', cartItemId);
          await deleteDoc(doc(db, "ecom users", user.uid, "cart", cartItemId));
        }
      }
      
      return true;
    } catch (error) {
      console.error("Error removing from cart:", error);
      return false;
    }
  },

  // Update cart item quantity
  updateCartItemQuantity: async (cartItemId, quantity) => {
    try {
      const user = auth.currentUser;
      console.log('updateCartItemQuantity - User:', user ? user.uid : 'No user logged in');
      console.log('updateCartItemQuantity - Item ID:', cartItemId);
      console.log('updateCartItemQuantity - New quantity:', quantity);
      
      if (!user) {
        // Update in localStorage if not logged in
        console.log('updateCartItemQuantity - Using localStorage');
        const currentCart = JSON.parse(localStorage.getItem('cart')) || [];
        const updatedCart = currentCart.map(item => {
          if (item.id === cartItemId) {
            return { ...item, quantity };
          }
          return item;
        });
        localStorage.setItem('cart', JSON.stringify(updatedCart));
        
        // Dispatch a custom event to notify components
        window.dispatchEvent(new CustomEvent('cartUpdated', { 
          detail: { items: updatedCart }
        }));
        
        return true;
      }
      
      // Update in Firestore
      // First, we need to get the document ID for the item with the given product ID
      const cartRef = collection(db, "ecom users", user.uid, "cart");
      
      // Check if cartItemId is a document ID or a product ID
      if (cartItemId.includes('/')) {
        // It's likely a document path, extract the document ID
        const parts = cartItemId.split('/');
        cartItemId = parts[parts.length - 1];
        console.log('updateCartItemQuantity - Extracted document ID:', cartItemId);
        await updateDoc(doc(db, "ecom users", user.uid, "cart", cartItemId), {
          quantity,
          updatedAt: serverTimestamp()
        });
      } else {
        // Try to find the document with this product ID
        console.log('updateCartItemQuantity - Looking for product with ID:', cartItemId);
        const q = query(cartRef, where("id", "==", cartItemId));
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
          const docToUpdate = snapshot.docs[0];
          console.log('updateCartItemQuantity - Found document to update:', docToUpdate.id);
          await updateDoc(docToUpdate.ref, {
            quantity,
            updatedAt: serverTimestamp()
          });
        } else {
          // If not found by product ID, try as document ID directly
          console.log('updateCartItemQuantity - Using as document ID:', cartItemId);
          await updateDoc(doc(db, "ecom users", user.uid, "cart", cartItemId), {
            quantity,
            updatedAt: serverTimestamp()
          });
        }
      }
      
      return true;
    } catch (error) {
      console.error("Error updating cart item quantity:", error);
      return false;
    }
  },

  // Check if item is in cart
  isInCart: async (productId) => {
    try {
      const user = auth.currentUser;
      
      if (!user) {
        // Check localStorage if not logged in
        const currentCart = JSON.parse(localStorage.getItem('cart')) || [];
        return currentCart.some(item => item.id === productId);
      }
      
      // Check Firestore
      const cartRef = collection(db, "ecom users", user.uid, "cart");
      const q = query(cartRef, where("id", "==", productId));
      const snapshot = await getDocs(q);
      
      return !snapshot.empty;
    } catch (error) {
      console.error("Error checking if in cart:", error);
      return false;
    }
  },

  // WISHLIST FUNCTIONS
  // Get user's wishlist
  getWishlist: async () => {
    try {
      const user = auth.currentUser;
      
      if (!user) {
        // Return localStorage wishlist if not logged in
        const localWishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
        return localWishlist;
      }
      
      // Get wishlist from Firebase
      const wishlistRef = collection(db, "ecom users", user.uid, "wishlist");
      const snapshot = await getDocs(wishlistRef);
      const wishlist = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      return wishlist;
    } catch (error) {
      console.error("Error getting wishlist:", error);
      return [];
    }
  },

  // Add item to wishlist
  addToWishlist: async (wishlistItem) => {
    try {
      const user = auth.currentUser;
      
      if (!user) {
        // Store in localStorage if not logged in
        const currentWishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
        if (!currentWishlist.some(item => item.id === wishlistItem.id)) {
          currentWishlist.push(wishlistItem);
          localStorage.setItem('wishlist', JSON.stringify(currentWishlist));
        }
        return true;
      }
      
      // Check if item already exists in wishlist
      const wishlistRef = collection(db, "ecom users", user.uid, "wishlist");
      const q = query(wishlistRef, where("id", "==", wishlistItem.id));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        // Add new item to wishlist
        await addDoc(wishlistRef, {
          ...wishlistItem,
          addedAt: serverTimestamp()
        });
      }
      
      return true;
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      return false;
    }
  },

  // Remove item from wishlist
  removeFromWishlist: async (itemId) => {
    try {
      const user = auth.currentUser;
      
      if (!user) {
        // Remove from localStorage if not logged in
        const currentWishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
        const updatedWishlist = currentWishlist.filter(item => item.id !== itemId);
        localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
        return true;
      }
      
      // Find and remove item from Firebase wishlist
      const wishlistRef = collection(db, "ecom users", user.uid, "wishlist");
      const q = query(wishlistRef, where("id", "==", itemId));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const docToDelete = snapshot.docs[0];
        await deleteDoc(docToDelete.ref);
      }
      
      return true;
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      return false;
    }
  },

  // Check if item is in wishlist
  isInWishlist: async (itemId) => {
    try {
      const user = auth.currentUser;
      
      if (!user) {
        // Check localStorage if not logged in
        const currentWishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
        return currentWishlist.some(item => item.id === itemId);
      }
      
      // Check Firebase wishlist
      const wishlistRef = collection(db, "ecom users", user.uid, "wishlist");
      const q = query(wishlistRef, where("id", "==", itemId));
      const snapshot = await getDocs(q);
      
      return !snapshot.empty;
    } catch (error) {
      console.error("Error checking wishlist:", error);
      return false;
    }
  },

  // Toggle wishlist (add if not present, remove if present)
  toggleWishlist: async (item) => {
    try {
      const isInWishlist = await firebaseService.isInWishlist(item.id);
      
      if (isInWishlist) {
        return await firebaseService.removeFromWishlist(item.id);
      } else {
        return await firebaseService.addToWishlist(item);
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
      return false;
    }
  },

  // Sync localStorage cart and wishlist with Firebase
  syncCartAndWishlist: async () => {
    try {
      const user = auth.currentUser;
      if (!user) return { success: false, error: "No user logged in" };
      
      // Sync cart
      const localCart = JSON.parse(localStorage.getItem('cart')) || [];
      if (localCart.length > 0) {
        const cartRef = collection(db, "ecom users", user.uid, "cart");
        
        // Get existing cart items
        const snapshot = await getDocs(cartRef);
        const existingCartItems = snapshot.docs.map(doc => ({
          docId: doc.id,
          ...doc.data()
        }));
        
        // Add or update items from localStorage
        for (const item of localCart) {
          const existingItem = existingCartItems.find(cartItem => 
            cartItem.id === item.id
          );
          
          if (existingItem) {
            // Update quantity
            await updateDoc(doc(db, "ecom users", user.uid, "cart", existingItem.docId), {
              quantity: (existingItem.quantity || 0) + (item.quantity || 1),
              updatedAt: serverTimestamp()
            });
          } else {
            // Add new item
            await addDoc(cartRef, {
              ...item,
              addedAt: serverTimestamp()
            });
          }
        }
        
        // Clear localStorage cart
        localStorage.setItem('cart', JSON.stringify([]));
      }
      
      // Sync wishlist
      const localWishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
      if (localWishlist.length > 0) {
        const wishlistRef = collection(db, "ecom users", user.uid, "wishlist");
        
        // Get existing wishlist items
        const snapshot = await getDocs(wishlistRef);
        const existingWishlistItems = snapshot.docs.map(doc => ({
          docId: doc.id,
          ...doc.data()
        }));
        
        // Add items from localStorage that don't exist in Firebase
        for (const item of localWishlist) {
          const existingItem = existingWishlistItems.find(wishlistItem => 
            wishlistItem.id === item.id
          );
          
          if (!existingItem) {
            // Add new item
            await addDoc(wishlistRef, {
              ...item,
              addedAt: serverTimestamp()
            });
          }
        }
        
        // Clear localStorage wishlist
        localStorage.setItem('wishlist', JSON.stringify([]));
      }
      
      return { success: true };
    } catch (error) {
      console.error("Error syncing cart and wishlist:", error);
      return { success: false, error: error.message };
    }
  },

  // Sign up new user
  signUp: async (email, password, name) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update user profile with name
      await updateProfile(user, {
        displayName: name
      });

      // Store the user in "ecom users" collection to separate from inventory app users
      await setDoc(doc(db, "ecom users", user.uid), {
        uid: user.uid,
        displayName: name,
        email: email,
        emailVerified: user.emailVerified,
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
        userType: 'ecommerce'
      });

      // Send verification email using Firebase's built-in method
      await sendEmailVerification(user, {
        url: `${window.location.origin}/login`, // Redirect to login after verification
        handleCodeInApp: true,
      });

      return { success: true, user };
    } catch (error) {
      console.error("Error signing up:", error);
      return { success: false, error: error.message };
    }
  },

  // Sign in user
  signIn: async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Force a reload of the user's profile to get the latest emailVerified status
      await user.reload();
      const freshUser = auth.currentUser;
      
      const userDocRef = doc(db, "ecom users", freshUser.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        // Check if the user is an ecommerce user
        if (userDoc.data().userType !== 'ecommerce') {
          await signOut(auth); // Sign out the user immediately
          return { success: false, error: "Access denied. This account is not authorized for the website." };
        }
        // Update existing ecom user's last login time
        await updateDoc(userDocRef, {
          lastLoginAt: serverTimestamp()
        });
      } else {
        // If user exists in auth but not in our collection, they are not an ecom user.
        // This case can happen if an inventory user tries to log in.
        await signOut(auth);
        return { success: false, error: "Access denied. Please use a valid website account." };
      }
      
      return { success: true, user: freshUser };
    } catch (error) {
      console.error("Error signing in:", error);
      return { success: false, error: error.message };
    }
  },

  // Sign out user
  signOut: async () => {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      console.error("Error signing out:", error);
      return { success: false, error: error.message };
    }
  },

  // Send password reset email
  sendPasswordReset: async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      console.error("Error sending password reset:", error);
      return { success: false, error: error.message };
    }
  },

  resendVerificationEmail: async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        return { success: false, error: "No user logged in" };
      }
      
      // Resend verification email using Firebase's built-in method
      await sendEmailVerification(user, {
        url: `${window.location.origin}/login`, // Redirect to login after verification
        handleCodeInApp: true,
      });
      
      return { success: true };
    } catch (error) {
      console.error("Error resending verification email:", error);
      return { success: false, error: error.message };
    }
  },

  // Get stock for a product variant
  getStockByVariant: async (productId, variantId, size) => {
    try {
      if (!productId) {
        console.log("Missing productId for stock check");
        return 10; // Default stock value if productId is missing
      }
      
      // If variantId is missing, try to get stock by product ID only
      if (!variantId) {
        console.log("Missing variantId for stock check, using product ID only");
        const inventoryRef = collection(db, "batchInventory");
        const q = query(
          inventoryRef,
          where("items", "array-contains", {
            uniformId: productId
          })
        );
        
        const snapshot = await getDocs(q);
        if (snapshot.empty) {
          return 10; // Default stock if no inventory found
        }
        
        let totalStock = 0;
        snapshot.docs.forEach((doc) => {
          const batch = doc.data();
          batch.items.forEach((item) => {
            if (item.uniformId === productId) {
              if (size && item.sizes) {
                item.sizes.forEach((s) => {
                  if (s.size === size) {
                    totalStock += (s.quantity || 0);
                  }
                });
              } else if (item.quantity) {
                totalStock += item.quantity;
              }
            }
          });
        });
        
        return totalStock > 0 ? totalStock : 10; // Return at least 10 if no stock found
      }

      const inventoryRef = collection(db, "batchInventory");
      const q = query(
        inventoryRef,
        where("items", "array-contains", {
          uniformId: productId,
          variantId: variantId,
          sizes: [
            {
              size: size,
            },
          ],
        })
      );

      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        return 10; // Default stock if no inventory found
      }

      let totalStock = 0;
      snapshot.docs.forEach((doc) => {
        const batch = doc.data();
        batch.items.forEach((item) => {
          if (item.uniformId === productId && item.variantId === variantId) {
            item.sizes.forEach((s) => {
              if (s.size === size) {
                totalStock += (s.quantity || 0);
              }
            });
          }
        });
      });
      
      return totalStock > 0 ? totalStock : 10; // Return at least 10 if no stock found
    } catch (error) {
      console.error("Error getting stock by variant:", error);
      return 10; // Default stock on error
    }
  },

  // Get current user
  getCurrentUser: () => {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe();
        resolve(user);
      });
    });
  },

  // REVIEW FUNCTIONS
  // Add a review
  addReview: async (productId, review) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        return { success: false, error: "User must be logged in to review" };
      }

      const reviewRef = collection(db, "products", productId, "reviews");
      const reviewData = {
        ...review,
        userId: user.uid,
        userName: user.displayName,
        userEmail: user.email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await addDoc(reviewRef, reviewData);

      // Update product rating
      const productRef = doc(db, "products", productId);
      const productDoc = await getDoc(productRef);
      const productData = productDoc.data();
      
      const currentReviews = await getDocs(reviewRef);
      const totalRating = currentReviews.docs.reduce((sum, doc) => sum + doc.data().rating, 0);
      const averageRating = totalRating / currentReviews.size;

      await updateDoc(productRef, {
        rating: averageRating,
        totalReviews: currentReviews.size
      });

      return { success: true };
    } catch (error) {
      console.error("Error adding review:", error);
      return { success: false, error: error.message };
    }
  },

  // Get reviews for a product
  getReviews: async (productId) => {
    try {
      const reviewRef = collection(db, "products", productId, "reviews");
      const snapshot = await getDocs(reviewRef);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Error getting reviews:", error);
      return [];
    }
  },
  
  // Alias for getReviews to fix compatibility with ProductDetails component
  getProductReviews: async (productId) => {
    return firebaseService.getReviews(productId);
  },
  
  // Alias for addReview to fix compatibility with ProductDetails component
  addProductReview: async (productId, review) => {
    return firebaseService.addReview(productId, review);
  },
  
  // Vote on a review (helpful or not helpful)
  voteOnReview: async (productId, reviewId, voteType) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        return { success: false, error: "User must be logged in to vote" };
      }

      const reviewRef = doc(db, "products", productId, "reviews", reviewId);
      const reviewDoc = await getDoc(reviewRef);
      
      if (!reviewDoc.exists()) {
        return { success: false, error: "Review not found" };
      }

      const reviewData = reviewDoc.data();
      const userId = user.uid;
      
      // Initialize vote arrays if they don't exist
      const helpfulVotes = reviewData.helpfulVotes || [];
      const notHelpfulVotes = reviewData.notHelpfulVotes || [];
      
      // Check if user has already voted
      const hasHelpfulVote = helpfulVotes.includes(userId);
      const hasNotHelpfulVote = notHelpfulVotes.includes(userId);
      
      if (voteType === 'helpful') {
        // If already voted helpful, remove vote (toggle)
        if (hasHelpfulVote) {
          await updateDoc(reviewRef, {
            helpfulVotes: arrayRemove(userId)
          });
        } 
        // If voted not helpful before, switch vote
        else if (hasNotHelpfulVote) {
          await updateDoc(reviewRef, {
            helpfulVotes: arrayUnion(userId),
            notHelpfulVotes: arrayRemove(userId)
          });
        }
        // New vote
        else {
          await updateDoc(reviewRef, {
            helpfulVotes: arrayUnion(userId)
          });
        }
      } else if (voteType === 'not-helpful') {
        // If already voted not helpful, remove vote (toggle)
        if (hasNotHelpfulVote) {
          await updateDoc(reviewRef, {
            notHelpfulVotes: arrayRemove(userId)
          });
        }
        // If voted helpful before, switch vote
        else if (hasHelpfulVote) {
          await updateDoc(reviewRef, {
            notHelpfulVotes: arrayUnion(userId),
            helpfulVotes: arrayRemove(userId)
          });
        }
        // New vote
        else {
          await updateDoc(reviewRef, {
            notHelpfulVotes: arrayUnion(userId)
          });
        }
      }

      return { success: true };
    } catch (error) {
      console.error("Error voting on review:", error);
      return { success: false, error: error.message };
    }
  },

  // Update a review
  updateReview: async (productId, reviewId, updatedReview) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        return { success: false, error: "User must be logged in to update review" };
      }

      const reviewRef = doc(db, "products", productId, "reviews", reviewId);
      const reviewDoc = await getDoc(reviewRef);
      
      if (!reviewDoc.exists()) {
        return { success: false, error: "Review not found" };
      }

      if (reviewDoc.data().userId !== user.uid) {
        return { success: false, error: "User can only update their own reviews" };
      }

      await updateDoc(reviewRef, {
        ...updatedReview,
        updatedAt: serverTimestamp()
      });

      return { success: true };
    } catch (error) {
      console.error("Error updating review:", error);
      return { success: false, error: error.message };
    }
  },

  // Delete a review
  deleteReview: async (productId, reviewId) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        return { success: false, error: "User must be logged in to delete review" };
      }

      const reviewRef = doc(db, "products", productId, "reviews", reviewId);
      const reviewDoc = await getDoc(reviewRef);
      
      if (!reviewDoc.exists()) {
        return { success: false, error: "Review not found" };
      }

      if (reviewDoc.data().userId !== user.uid) {
        return { success: false, error: "User can only delete their own reviews" };
      }

      await deleteDoc(reviewRef);

      // Update product rating
      const productRef = doc(db, "products", productId);
      const reviewCollection = collection(db, "products", productId, "reviews");
      const currentReviews = await getDocs(reviewCollection);
      
      if (currentReviews.empty) {
        await updateDoc(productRef, {
          rating: 0,
          totalReviews: 0
        });
      } else {
        const totalRating = currentReviews.docs.reduce((sum, doc) => sum + doc.data().rating, 0);
        const averageRating = totalRating / currentReviews.size;
        
        await updateDoc(productRef, {
          rating: averageRating,
          totalReviews: currentReviews.size
        });
      }

      return { success: true };
    } catch (error) {
      console.error("Error deleting review:", error);
      return { success: false, error: error.message };
    }
  }
};

export default firebaseService; 