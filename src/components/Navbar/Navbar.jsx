import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Search, X, User, Settings, Heart, Package, LogOut, HelpCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import CartIcon from './CartIcon';
import { getAuth, updateProfile } from 'firebase/auth';
import { doc, getDoc, getFirestore } from 'firebase/firestore';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { currentUser, signOut } = useAuth();
  const { cartItems, totalItems } = useCart();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim() !== '') {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isProfileOpen && !event.target.closest('.profile-dropdown')) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileOpen]);

  // Fetch user data from Firestore
  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser && currentUser.uid) {
        try {
          console.log("Current user from auth:", currentUser);
          console.log("Display name:", currentUser.displayName);
          console.log("Email:", currentUser.email);
          
          // Try to get user data from Firestore
          const db = getFirestore();
          const userDocRef = doc(db, "ecom users", currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log("User data from Firestore:", userData);
            setUserData(userData);
          } else {
            console.log("No user document found in Firestore");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };
    
    fetchUserData();
  }, [currentUser]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  // Get the name to display
  const getDisplayName = () => {
    if (userData && userData.displayName) {
      return userData.displayName;
    }
    if (currentUser && currentUser.displayName) {
      return currentUser.displayName;
    }
    return 'User';
  };

  return (
    <nav className="fixed w-full top-0 z-50">
      {/* Top Bar */}
      <div className="bg-primary-600 text-white py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-center font-medium">
            Free Delivery for Orders Above $299
          </p>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0">
              <h1 className="flex items-center space-x-2">
                <span className="text-3xl font-display font-bold bg-primary-600 text-white px-3 py-1 rounded-lg">
                  M
                </span>
                <span className="text-2xl font-display font-bold text-gray-900">
                  Monisha
                  <span className="text-sm text-primary-600 block -mt-1">
                    School Uniforms
                  </span>
                </span>
              </h1>
            </Link>

            {/* Main Navigation - Desktop */}
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className="nav-link">Home</Link>
              <Link to="/collections" className="nav-link">Collections</Link>
              <Link 
                to="/order" 
                className="px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-full 
                          font-medium text-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200
                          flex items-center gap-2"
              >
                <Package className="h-4 w-4" />
                Order Now
              </Link>
            </div>

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-xs mx-4">
              <form onSubmit={handleSearch} className="relative w-full">
                <input
                  type="text"
                  placeholder="Search by school or uniform..."
                  className="w-full pl-10 pr-4 py-1.5 text-sm rounded-full border border-gray-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </form>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-4">
              {/* Cart Icon with Counter */}
              <CartIcon />
              
              <div className="h-4 w-px bg-gray-200"></div>
              
              {currentUser ? (
                /* Profile Dropdown - Show when user is logged in */
                <div className="relative profile-dropdown">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-2 focus:outline-none"
                  >
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium text-lg overflow-hidden">
                      {currentUser && currentUser.image ? (
                        <img 
                          src={currentUser.image} 
                          alt={getDisplayName()}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                          {getInitials(getDisplayName())}
                        </div>
                      )}
                    </div>
                  </button>

                  {/* Dropdown Menu */}
                  {isProfileOpen && currentUser && (
                    <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-gray-100 py-2 animate-fade-down">
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{getDisplayName()}</p>
                        <p className="text-xs text-gray-500">{currentUser.email || ''}</p>
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        <Link to="/orders" className="dropdown-item">
                          <Package className="h-4 w-4" />
                          <span>My Orders</span>
                        </Link>
                        <Link to="/wishlist" className="dropdown-item">
                          <Heart className="h-4 w-4" />
                          <span>Wishlist</span>
                        </Link>
                        <Link to="/settings" className="dropdown-item">
                          <Settings className="h-4 w-4" />
                          <span>Settings</span>
                        </Link>
                        <Link to="/help" className="dropdown-item">
                          <HelpCircle className="h-4 w-4" />
                          <span>Help Center</span>
                        </Link>
                        <Link to="/school-orders" className="dropdown-item">
                          <Package className="h-4 w-4" />
                          <span>School Orders</span>
                        </Link>
                        <Link to="/parent-orders" className="dropdown-item">
                          <Package className="h-4 w-4" />
                          <span>Parent Orders</span>
                        </Link>
                      </div>

                      {/* Logout */}
                      <div className="border-t border-gray-100 mt-2">
                        <button className="dropdown-item text-red-600 hover:bg-red-50" onClick={handleSignOut}>
                          <LogOut className="h-4 w-4" />
                          <span>Sign out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Login/Register buttons - Show when user is not logged in */
                <div className="flex items-center space-x-2">
                  <Link 
                    to="/login" 
                    className="text-sm font-medium text-gray-600 hover:text-primary-600"
                  >
                    Login
                  </Link>
                  <span className="text-gray-300">|</span>
                  <Link 
                    to="/signup" 
                    className="text-sm font-medium text-primary-600 hover:text-primary-700"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute w-full bg-white border-b border-gray-200">
          <div className="px-4 py-3 space-y-3">
            <form onSubmit={handleSearch} className="relative w-full">
              <input
                type="text"
                placeholder="Search uniforms..."
                className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-gray-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </form>
            <Link to="/" className="block py-2">Home</Link>
            <Link to="/collections" className="block py-2">Collections</Link>
            <Link 
              to="/order" 
              className="block py-2 px-4 bg-primary-50 text-primary-600 rounded-lg font-medium"
            >
              Order Now
            </Link>
            <Link to="/cart" className="block py-2">Cart ({totalItems})</Link>
            
            {currentUser ? (
              <>
                <Link to="/wishlist" className="block py-2">Wishlist</Link>
                <Link to="/orders" className="block py-2">My Orders</Link>
                <Link to="/settings" className="block py-2">Settings</Link>
                <button 
                  onClick={handleSignOut}
                  className="block w-full text-left py-2 text-red-600"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block py-2 text-primary-600">Login</Link>
                <Link to="/signup" className="block py-2 text-primary-600 font-medium">Register</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

// Add these styles to your globals.css
const styles = `
.nav-link {
  @apply text-gray-600 hover:text-primary-600 text-sm font-medium transition-colors;
}

.dropdown-item {
  @apply flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full transition-colors;
}

@keyframes fade-down {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-down {
  animation: fade-down 0.2s ease-out;
}
`;

if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default Navbar; 
