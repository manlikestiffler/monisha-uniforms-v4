import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, User, Tag, Layers, AlertCircle } from 'lucide-react';
import firebaseService from '../services/firebase';
import AnimatedImage from './AnimatedImage';
import { useCart } from '../contexts/CartContext';
import Alert from './ui/Alert';

export default function ProductCard({ product, schoolData }) {
  const { addToCart: addToCartContext } = useCart();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [selectedSize, setSelectedSize] = useState(null);
  const [addedToCart, setAddedToCart] = useState(false);
  const [sizeError, setSizeError] = useState(false);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (!product?.id) return;
      const status = await firebaseService.isInWishlist(product.id);
      setIsInWishlist(status);
    };
    checkWishlistStatus();
  }, [product.id]);

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const newWishlistStatus = !isInWishlist;
    setIsInWishlist(newWishlistStatus);

    try {
      if (newWishlistStatus) {
        await firebaseService.addToWishlist({
          id: product.id,
          name: product.name,
          price: product.variants[0]?.sizes[0]?.price || 0,
          image: product.media?.[0]?.url || '',
          addedAt: new Date(),
        });
        setAlert({ message: 'Added to wishlist!', type: 'success' });
      } else {
        await firebaseService.removeFromWishlist(product.id);
        setAlert({ message: 'Removed from wishlist', type: 'info' });
      }
    } catch (error) {
      console.error("Failed to toggle wishlist", error);
      setIsInWishlist(!newWishlistStatus); // Revert on error
      setAlert({ message: 'Failed to update wishlist', type: 'error' });
    }
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!selectedSize) {
      setSizeError(true);
      setTimeout(() => setSizeError(false), 3000);
      return;
    }
    
    try {
      // Get the correct price from the variant
      let price = product.price || 0;
      if (product.variants && product.variants.length > 0) {
        const variant = product.variants[0];
        if (variant.sizes && variant.sizes.length > 0) {
          const sizeObj = variant.sizes.find(s => 
            (s.size === selectedSize || s.name === selectedSize || s.value === selectedSize)
          );
          if (sizeObj && sizeObj.price) {
            price = sizeObj.price;
          }
        }
      }
      
      const cartItem = {
        id: product.id,
        name: product.name,
        price: price,
        image: product.media?.[0]?.url || '',
        size: selectedSize,
        quantity: 1,
        schoolName: getSchoolName(),
        addedAt: new Date()
      };
      
      console.log("ProductCard: Adding item to cart:", cartItem);
      await addToCartContext(cartItem);
      
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 3000);
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = `https://placehold.co/600x600/e2e8f0/64748b?text=${encodeURIComponent(product.name || 'Uniform')}`;
  };

  const getSchoolName = () => {
    if (schoolData && schoolData.name) {
      return schoolData.name;
    }
    return product.schoolName || "School Uniform";
  };
  
  const getVariantTypes = () => {
    if (!product.variants) return [];
    const types = new Set();
    product.variants.forEach(item => {
      if (item && typeof item === 'object' && item.variant) {
        types.add(item.variant);
      }
    });
    return [...types];
  };

  const imageUrl = product.media?.[0]?.url;
  const placeholderUrl = `https://placehold.co/600x600/e2e8f0/64748b?text=${encodeURIComponent(product.name || 'Uniform')}`;

  const allSizes = product.variants?.flatMap(v => v.sizes?.map(s => s.size)) || [];
  const uniqueSizes = [...new Set(allSizes)].filter(Boolean);
  
  const variantTypes = getVariantTypes();
  
  const firstVariant = product.variants?.[0] || {};
  const firstSize = firstVariant.sizes?.[0] || {};
  const displayPrice = parseFloat(firstSize.price || product.price || 0);

  return (
    <motion.div
      className="group relative bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col h-full font-sans"
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative z-10 flex flex-col h-full">
        <Link to={`/products/${product.id}`} className="block">
          <div className="relative aspect-square overflow-hidden">
            <AnimatedImage
              src={imageUrl || placeholderUrl}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={handleImageError}
            />
            <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-neutral-700">
              {getSchoolName()}
            </div>
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="bg-white text-neutral-800 font-bold py-2 px-4 rounded-full shadow-lg">
                  View Details
              </div>
            </div>
          </div>
        </Link>

        <div className="p-5 flex-grow flex flex-col">
          <Link to={`/products/${product.id}`} className="block">
            <h3 className="font-display text-xl font-medium text-neutral-800 group-hover:text-primary-600 transition-colors duration-300 truncate">
              {product.name}
            </h3>
          </Link>
          <div className="flex-grow pt-3">
            <div className="flex items-center gap-x-4 gap-y-2 text-sm text-neutral-600 flex-wrap mb-3">
              <div className="flex items-center gap-2">
                <Layers size={16} className="text-neutral-400" />
                <span className="font-medium capitalize">
                  {product.category && product.category.toLowerCase() !== 'school uniform' ? product.category : product.name.split(' ')[0]}
                </span>
              </div>
              {product.gender && (
                <div className="flex items-center gap-2">
                  <User size={16} className="text-neutral-400" />
                  <span className="font-medium">{product.gender}</span>
                </div>
              )}
              {variantTypes.length > 0 && (
                <div className="flex items-center gap-2">
                  <Tag size={16} className="text-neutral-400" />
                  <span className="font-medium">{variantTypes.join(', ')}</span>
                </div>
              )}
            </div>
            
            {uniqueSizes.length > 0 && (
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-medium text-neutral-500">Select Size</span>
                  {sizeError && (
                    <span className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle size={12} />
                      Please select a size
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {uniqueSizes.map((size) => (
                    <button
                      key={size}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedSize(size);
                      }}
                      className={`px-2 py-1 text-xs font-medium rounded-full border transition-colors
                        ${selectedSize === size 
                          ? 'bg-primary-600 text-white border-primary-600' 
                          : 'bg-neutral-100 text-neutral-700 border-neutral-200 hover:border-primary-300'}`
                      }
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-auto flex items-end justify-between pt-4">
            <div className="flex flex-col">
              <span className="text-xs text-neutral-500">Starts from</span>
              <p className="font-display text-2xl font-bold text-primary-700">
                ${displayPrice.toFixed(2)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <motion.button
                onClick={handleWishlistToggle}
                whileTap={{ scale: 0.9 }}
                className={`p-3 rounded-full transition-colors duration-300
                  ${isInWishlist ? 'bg-red-500 text-white' : 'bg-neutral-100 text-neutral-500 hover:bg-red-100 hover:text-red-500'}`
                }
                aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <Heart className={`w-6 h-6 ${isInWishlist ? 'fill-current' : ''}`} />
              </motion.button>
              <motion.button
                onClick={handleAddToCart}
                whileTap={{ scale: 0.95 }}
                className="btn btn-secondary flex items-center gap-2"
                aria-label="Add to cart"
              >
                <ShoppingCart size={20} />
                <span>{addedToCart ? 'Added!' : 'Add to Cart'}</span>
              </motion.button>
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
    </motion.div>
  );
} 