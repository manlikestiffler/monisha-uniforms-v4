import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';

const CartIcon = () => {
  const { cartItems, loading } = useCart();

  const totalQuantity = cartItems.length;
  const subtotal = cartItems.reduce((total, item) => total + ((item.price || 0) * (item.quantity || 1)), 0);

  return (
    <div className="relative group">
      <Link to="/cart" className="relative p-2 block rounded-full hover:bg-primary-50 transition-colors">
        <ShoppingBag className="h-5 w-5 text-gray-600 group-hover:text-primary-600" />
        {totalQuantity > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full bg-primary-600 text-white text-xs font-medium">
            {totalQuantity > 99 ? '99+' : totalQuantity}
          </span>
        )}
      </Link>
      
      {/* Cart Preview */}
      <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 opacity-0 invisible translate-y-2 
                    group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-200 z-50">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900">Shopping Cart</h3>
            <span className="text-sm text-gray-500">{totalQuantity} {totalQuantity === 1 ? 'item' : 'items'}</span>
          </div>

          {loading ? (
            <div className="py-8 flex justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-gray-500">Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {cartItems.slice(0, 3).map((item) => (
                <div key={item.docId || item.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-12 h-12 rounded-md object-cover bg-gray-100" 
                    onError={(e) => { e.target.src = 'https://placehold.co/100x100/e2e8f0/64748b?text=Product'; }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                    <p className="text-sm text-gray-500">{item.quantity} × ${parseFloat(item.price).toFixed(2)}</p>
                  </div>
                </div>
              ))}
              {cartItems.length > 3 && (
                <div className="text-center text-sm text-gray-500 py-1">
                  +{cartItems.length - 3} more items
                </div>
              )}
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-500">Subtotal</span>
              <span className="text-sm font-medium text-gray-900">${subtotal.toFixed(2)}</span>
            </div>
            
            <div className="space-y-2">
              <Link 
                to="/cart"
                className="block w-full py-2 px-4 rounded-lg bg-primary-600 text-white text-center font-medium hover:bg-primary-700 transition-colors"
              >
                View Cart
              </Link>
              <Link 
                to="/checkout"
                className="block w-full py-2 px-4 rounded-lg bg-gray-900 text-white text-center font-medium hover:bg-gray-800 transition-colors"
              >
                Checkout
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartIcon; 