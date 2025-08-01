import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Minus, Plus, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import Alert from '../components/ui/Alert';

const Cart = () => {
  const { cartItems, loading, removeFromCart, updateCartItemQuantity, clearCart } = useCart();
  const [error, setError] = useState(null);
  const [alert, setAlert] = useState(null);
  const navigate = useNavigate();

  // Debug logging
  useEffect(() => {
    console.log("Cart component: Cart items:", cartItems);
  }, [cartItems]);

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = parseFloat(item.price) || 0;
      const quantity = parseInt(item.quantity) || 1;
      return total + (price * quantity);
    }, 0);
  };

  const handleQuantityChange = async (cartItemId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveItem(cartItemId);
      return;
    }

    try {
      console.log("Cart: Updating quantity for item:", cartItemId, "to", newQuantity);
      await updateCartItemQuantity(cartItemId, newQuantity);
    } catch (err) {
      console.error('Error updating quantity:', err);
      setError('Failed to update quantity. Please try again.');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleRemoveItem = async (cartItemId) => {
    try {
      console.log("Cart: Removing item:", cartItemId);
      await removeFromCart(cartItemId);
    } catch (err) {
      console.error('Error removing item:', err);
      setError('Failed to remove item. Please try again.');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCart();
    } catch (err) {
      console.error('Error clearing cart:', err);
      setError('Failed to clear cart. Please try again.');
      setTimeout(() => setError(null), 3000);
    }
  };

  const subtotal = calculateTotal();
  const shipping = subtotal > 299 ? 0 : 29.99;
  const total = subtotal + shipping;

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen pt-24 bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="h-8 w-8 text-primary-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Your cart is empty</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Looks like you haven't added any items to your cart yet.
            </p>
            <button
              onClick={() => navigate('/collections')}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Browse Collections
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-3">
                <ShoppingBag className="h-6 w-6 text-primary-600" />
                <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
              </div>
              <p className="text-gray-600 mt-1">
                {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in cart
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleClearCart}
                className="px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              >
                Clear Cart
              </button>
              <button
                onClick={() => navigate('/collections')}
                className="flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
        
        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div key={item.docId || item.id} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-xl transition-all duration-300">
                <div className="flex gap-6">
                  <div className="w-32 h-32 rounded-lg overflow-hidden bg-gray-50">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = 'https://placehold.co/400x400?text=Product';
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-4">
                      <div className="flex-1 pr-4">
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                          <span className="text-lg font-bold text-gray-900">${(parseFloat(item.price)).toFixed(2)}</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{item.schoolName}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-sm px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full">
                            Size: {item.size}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors h-fit"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-3 bg-gray-50 w-fit rounded-lg p-1">
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        className="p-2 rounded-md hover:bg-white transition-colors disabled:opacity-50"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <input
                        type="number"
                        value={item.quantity || 1}
                        onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))}
                        className="w-12 text-center font-medium bg-transparent focus:outline-none"
                        min="1"
                      />
                      <button
                        onClick={() => handleQuantityChange(item.id, (item.quantity || 1) + 1)}
                        className="p-2 rounded-md hover:bg-white transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-xl p-6 shadow-sm h-fit sticky top-24 border border-gray-100">
            <h2 className="text-lg font-medium mb-4">Order Summary</h2>
            <div className="space-y-4">
              <div className="border-b pb-4">
                {cartItems.map((item) => (
                  <div key={`summary-${item.docId || item.id}`} className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">
                      {item.name} × {item.quantity || 1}
                    </span>
                    <span className="font-medium">${((parseFloat(item.price) || 0) * (parseInt(item.quantity) || 1)).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Items ({cartItems.reduce((total, item) => total + (parseInt(item.quantity) || 1), 0)})</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                {shipping === 0 ? (
                  <span className="text-green-600 font-medium">Free</span>
                ) : (
                  <span className="font-medium">${shipping.toFixed(2)}</span>
                )}
              </div>
              {shipping > 0 && (
                <div className="bg-primary-50 p-3 rounded-lg">
                  <p className="text-sm text-primary-600">
                    Add ${(299 - subtotal).toFixed(2)} more for free shipping
                  </p>
                </div>
              )}
              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between font-medium text-lg">
                  <span>Total</span>
                  <span className="text-xl">${total.toFixed(2)}</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">Including VAT</p>
              </div>
              <button
                onClick={() => navigate('/checkout')}
                className="w-full py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors mt-6"
              >
                Proceed to Checkout
              </button>
              <p className="text-xs text-center text-gray-500 mt-4">
                Secure checkout powered by Stripe
              </p>
            </div>
          </div>
        </div>
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

export default Cart; 