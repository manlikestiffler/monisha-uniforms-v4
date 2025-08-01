import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import firebaseService from '../services/firebase';
import Alert from '../components/ui/Alert';

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alert, setAlert] = useState(null);
  const navigate = useNavigate();

  // Fetch wishlist items on component mount
  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        setLoading(true);
        const items = await firebaseService.getWishlist();
        setWishlistItems(items);
        setError(null);
      } catch (err) {
        console.error('Error fetching wishlist:', err);
        setError('Failed to load your wishlist. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();

    // Listen for storage events (when wishlist is updated in another component)
    const handleStorageChange = () => {
      fetchWishlist();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleRemoveFromWishlist = async (productId) => {
    const originalWishlist = [...wishlistItems];
    // Optimistically update the UI
    setWishlistItems(prevItems => prevItems.filter(item => item.id !== productId));
    setAlert({ message: 'Item removed from wishlist', type: 'success' });
    
    try {
      const success = await firebaseService.removeFromWishlist(productId);
      
      if (!success) {
        // If removal fails, revert the change
        setWishlistItems(originalWishlist);
        setAlert({ message: 'Failed to remove item. Please try again.', type: 'error' });
      }
    } catch (err) {
      console.error('Error removing from wishlist:', err);
      setWishlistItems(originalWishlist);
      setAlert({ message: 'Failed to remove item. Please try again.', type: 'error' });
    }
  };

  const handleAddToCart = async (product) => {
    try {
      // Create a cart item (using the first available size)
    const cartItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        size: product.sizes && product.sizes.length > 0 ? product.sizes[0] : 'One Size',
        quantity: 1,
        schoolName: product.schoolName || 'School Uniform',
        addedAt: new Date()
      };
      
      const success = await firebaseService.addToCart(cartItem);
      
      if (success) {
        setAlert({ message: 'Item added to cart', type: 'success' });
      } else {
        setAlert({ message: 'Failed to add item to cart. Please try again.', type: 'error' });
      }
    } catch (err) {
      console.error('Error adding to cart:', err);
      setAlert({ message: 'Failed to add item to cart. Please try again.', type: 'error' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-16">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
            My Wishlist
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
            {wishlistItems.length > 0
              ? `You have ${wishlistItems.length} item${wishlistItems.length > 1 ? 's' : ''} saved.`
              : 'Items you save will appear here.'}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-20 px-4">
            <p className="text-red-500">{error}</p>
          </div>
        ) : wishlistItems.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white rounded-2xl shadow-sm border border-gray-100">
            <Heart className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-5 text-xl font-semibold text-gray-900">Your wishlist is empty</h3>
            <p className="mt-2 text-base text-gray-500">
              Add your favorite items to your wishlist to see them here.
            </p>
            <div className="mt-6">
              <button
                onClick={() => navigate('/collections')}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Explore Products
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
            {wishlistItems.map((item, index) => (
              <motion.div
                key={item.id}
                className="group relative bg-white border border-gray-200 rounded-2xl flex flex-col overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
              >
                <div className="relative aspect-w-1 aspect-h-1 bg-gray-200 overflow-hidden">
                  <Link to={`/products/${item.id}`}>
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-center object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = 'https://placehold.co/400x400?text=Product';
                      }}
                    />
                  </Link>
                </div>
                <div className="flex-1 p-4 space-y-2 flex flex-col">
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="text-base font-medium text-gray-900 flex-1 pr-2">
                        <Link to={`/products/${item.id}`} className="hover:text-primary-600 transition-colors">
                          {item.name}
                        </Link>
                      </h3>
                      <button
                        onClick={() => handleRemoveFromWishlist(item.id)}
                        className="p-1 -mr-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                        title="Remove from wishlist"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <p className="text-sm text-gray-500">{item.schoolName}</p>
                  </div>
                  <div className="flex-1 flex flex-col justify-end">
                    <p className="text-lg font-bold text-gray-900">${item.price}</p>
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="w-full bg-primary-600 text-white py-2 px-4 mt-4 rounded-lg font-semibold hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <ShoppingBag size={16} />
                      Add to Cart
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {alert && (
        <Alert
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert(null)}
        />
      )}
    </div>
  );
};

export default Wishlist; 