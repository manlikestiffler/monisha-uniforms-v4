import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import firebaseService from '../services/firebase';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signIn = async (email, password) => {
    const result = await firebaseService.signIn(email, password);
    if (result.success) {
      // The onAuthStateChanged listener will update the currentUser state
      await firebaseService.syncCartAndWishlist();
    }
    return result;
  };

  const signUp = async (email, password, name) => {
    const result = await firebaseService.signUp(email, password, name);
    if (result.success) {
      // The onAuthStateChanged listener will update the currentUser state
    }
    return result;
  };

  const signOut = async () => {
    await firebaseSignOut(getAuth());
    setCurrentUser(null);
  };
  
  const sendPasswordReset = async (email) => {
    return await firebaseService.sendPasswordReset(email);
  };
  
  const value = {
    currentUser,
    loading,
    signIn,
    signUp,
    signOut,
    sendPasswordReset,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 