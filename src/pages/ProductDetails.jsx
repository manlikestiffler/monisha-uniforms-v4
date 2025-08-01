import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Shield, Package, RefreshCcw } from 'lucide-react';
import Slider from 'react-slick';
import api from '../services/api';
import firebaseService from '../services/firebase';
import { getAuth } from 'firebase/auth';
import { useCart } from '../contexts/CartContext';
import Reviews from '../components/Reviews';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [activeTab, setActiveTab] = useState('description');
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({
    rating: 0,
    comment: '',
    name: ''
  });
  const [reviewError, setReviewError] = useState(null);
  const [reviewSuccess, setReviewSuccess] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [schoolData, setSchoolData] = useState(null);
  const [filteredSizes, setFilteredSizes] = useState([]);
  const [addedToCart, setAddedToCart] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [userReview, setUserReview] = useState(null);
  const [isEditingReview, setIsEditingReview] = useState(false);
  const { addToCart: addToCartContext } = useCart();

  // Helper function to get actual sizes from the database
  const getActualSizesFromDatabase = (productData) => {
    if (!productData) return [];
    
    const actualSizes = [];
    
    // Check if product has variant-specific sizes
    if (productData.variants && Array.isArray(productData.variants)) {
      productData.variants.forEach(variant => {
        if (variant && typeof variant === 'object') {
          // Get sizes from variant's sizes array
          if (variant.sizes && Array.isArray(variant.sizes)) {
            variant.sizes.forEach(size => {
              if (typeof size === 'string') {
                actualSizes.push({ size, inStock: true });
              } else if (typeof size === 'object' && size !== null) {
                if (size.size) actualSizes.push({ size: size.size, inStock: size.inStock !== false });
                else if (size.value) actualSizes.push({ size: size.value, inStock: size.inStock !== false });
                else if (size.name) actualSizes.push({ size: size.name, inStock: size.inStock !== false });
              }
            });
          }
          // Get size from variant's size property
          else if (variant.size) {
            if (typeof variant.size === 'string') {
              actualSizes.push({ size: variant.size, inStock: true });
            } else if (typeof variant.size === 'object' && variant.size !== null) {
              if (variant.size.size) actualSizes.push({ size: variant.size.size, inStock: variant.size.inStock !== false });
              else if (variant.size.value) actualSizes.push({ size: variant.size.value, inStock: variant.size.inStock !== false });
              else if (variant.size.name) actualSizes.push({ size: variant.size.name, inStock: variant.size.inStock !== false });
            }
          }
        }
      });
    }
    
    // Check if product has direct sizes property
    if (productData.sizes && Array.isArray(productData.sizes)) {
      productData.sizes.forEach(size => {
        if (typeof size === 'string') {
          actualSizes.push({ size, inStock: true });
        } else if (typeof size === 'object' && size !== null) {
          if (size.size) actualSizes.push({ size: size.size, inStock: size.inStock !== false });
          else if (size.value) actualSizes.push({ size: size.value, inStock: size.inStock !== false });
          else if (size.name) actualSizes.push({ size: size.name, inStock: size.inStock !== false });
        }
      });
    }
    
    // Filter out duplicate sizes (keeping the first occurrence)
    const uniqueSizesMap = new Map();
    actualSizes.forEach(sizeObj => {
      if (!uniqueSizesMap.has(sizeObj.size)) {
        uniqueSizesMap.set(sizeObj.size, sizeObj);
      }
    });
    const uniqueSizes = Array.from(uniqueSizesMap.values());
    
    // Filter out hardcoded S, M, L if they were added by default and not actually from database
    // Only remove S, M, L if they come from the hardcoded default values, not if they're actually in the database
    const defaultSizes = new Set(['S', 'M', 'L']);
    
    // Special filtering logic for S, M, L 
    // We assume these are hardcoded if:
    // 1. All three (S, M, L) are present
    // 2. They all have the same inStock status (all true or all false)
    // 3. They appear consecutively in the array
    const filterDefaultSizes = uniqueSizes.length >= 3 && 
                            uniqueSizes.some((s, i) => 
                              i <= uniqueSizes.length - 3 &&
                              s.size === 'S' && 
                              uniqueSizes[i+1].size === 'M' && 
                              uniqueSizes[i+2].size === 'L' &&
                              s.inStock === uniqueSizes[i+1].inStock &&
                              s.inStock === uniqueSizes[i+2].inStock);
    
    if (filterDefaultSizes) {
      // Remove the default S, M, L sizes
      return uniqueSizes.filter(sizeObj => !defaultSizes.has(sizeObj.size));
    }
    
    return uniqueSizes;
  };

  useEffect(() => {
    const auth = getAuth();
    setCurrentUser(auth.currentUser);
    
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });
    
    return () => unsubscribe();
  }, []);
  
  const fetchReviews = async () => {
    try {
      const fetchedReviews = await firebaseService.getProductReviews(id);
      setReviews(fetchedReviews);
      
      if (currentUser) {
        const userReviewObj = fetchedReviews.find(review => review.userId === currentUser.uid);
        if (userReviewObj) {
          setUserReview(userReviewObj);
          if (isEditingReview) {
            setNewReview({
              rating: userReviewObj.rating,
              comment: userReviewObj.comment
            });
          }
        }
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
    }
  };
  
  useEffect(() => {
    if (product && id) {
      fetchReviews();
    }
  }, [product, id, currentUser]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const productData = await api.getProductById(id);
        
        if (!productData) {
          throw new Error('Product not found');
        }
        
        if (!productData.images || !productData.images.length) {
          productData.images = [
            'https://placehold.co/600x600/e2e8f0/64748b?text=Image+Not+Found'
          ];
        }
        
        if ((productData.price === 0 || !productData.price) && productData.variants && productData.variants.length > 0) {
          const firstVariant = productData.variants[0];
          if (firstVariant.sizes && firstVariant.sizes.length > 0) {
            const firstSize = firstVariant.sizes[0];
            if (firstSize.price) {
              productData.price = firstSize.price;
            }
          }
        }
        
        const processedSizes = getActualSizesFromDatabase(productData);
        setFilteredSizes(processedSizes);
        
        setProduct(productData);
        
        if (productData.schoolId) {
          try {
            const school = await api.getSchoolById(productData.schoolId);
            setSchoolData(school);
            
            if (!productData.schoolName && school && school.name) {
              setProduct(prev => ({
                ...prev,
                schoolName: school.name
              }));
            }
          } catch (schoolErr) {
            console.error('Error fetching school data:', schoolErr);
          }
        }
        
        setError(null);
      } catch (err) {
        console.error('Error details:', err);
        setError('Failed to load product details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleVote = async (reviewId, voteType) => {
    if (!currentUser) {
      setReviewError('Please log in to vote on reviews');
      return;
    }
    
    try {
      await firebaseService.voteOnReview(id, reviewId, voteType);
      fetchReviews();
    } catch (error) {
      console.error("Error voting on review:", error);
    }
  };
  
  const handleDeleteReview = async (reviewId) => {
    if (!currentUser) return;
    
    if (window.confirm('Are you sure you want to delete your review?')) {
      try {
        await firebaseService.deleteReview(id, reviewId);
        setUserReview(null);
        setNewReview({ rating: 0, comment: '' });
        fetchReviews();
      } catch (error) {
        console.error("Error deleting review:", error);
        setReviewError(error.message || 'Failed to delete review');
      }
    }
  };
  
  const handleEditReview = () => {
    if (userReview) {
      setNewReview({
        rating: userReview.rating,
        comment: userReview.comment
      });
      setIsEditingReview(true);
    }
  };

  const handleAddToCart = async () => {
    if (!selectedSize) return;
    
    let price = product.price;
    if (!price || price === 0) {
      if (product.variants && product.variants.length > 0) {
        const variant = product.variants[0];
        if (variant.sizes && variant.sizes.length > 0) {
          const sizeObj = variant.sizes.find(s => 
            (s.size === selectedSize || s.name === selectedSize || s.value === selectedSize)
          );
          if (sizeObj && sizeObj.price) {
            price = sizeObj.price;
          } else {
            price = variant.sizes[0].price || 0;
          }
        }
      }
    }
    
    const cartItem = {
      id: product.id,
      name: product.name,
      price: price,
      image: product.images && product.images.length > 0 ? product.images[0] : null,
      size: selectedSize,
      quantity: 1,
      schoolName: product.schoolName || (schoolData ? schoolData.name : "School Uniform"),
      addedAt: new Date()
    };
    
    try {
      console.log("ProductDetails: Adding item to cart:", cartItem);
      await addToCartContext(cartItem);
      
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 3000);
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-600 mb-4">{error || 'Product not found'}</p>
        <button
          onClick={() => navigate('/collections')}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Back to Collections
        </button>
      </div>
    );
  }

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    autoplay: true,
    autoplaySpeed: 3000
  };

  return (
    <div className="min-h-screen pt-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            <div className="space-y-4">
              <div className="aspect-[4/3] rounded-xl overflow-hidden bg-gray-100">
                <img
                  src={product.images[selectedImage]}
                  alt={`${product.name} view ${selectedImage + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://placehold.co/600x600/e2e8f0/64748b?text=Image+Not+Found';
                  }}
                />
              </div>

              <div className="flex justify-center gap-4">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all
                      ${selectedImage === index 
                        ? 'border-primary-500 shadow-md' 
                        : 'border-gray-200 hover:border-primary-300'}`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://placehold.co/600x600/e2e8f0/64748b?text=Thumbnail';
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium px-2.5 py-1 bg-primary-50 text-primary-600 rounded-full">
                    {product.type}
                  </span>
                  <span className={`text-sm font-medium px-2.5 py-1 rounded-full
                    ${product.category === 'winter' ? 'bg-blue-50 text-blue-600' : 
                      product.category === 'summer' ? 'bg-orange-50 text-orange-600' : 
                      'bg-gray-50 text-gray-600'}`}>
                    {product.category}
                  </span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                <p className="text-lg text-gray-600">{product.schoolName}</p>
                <p className="text-sm text-gray-500 pt-4">{product.description}</p>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-gray-900">
                  ${product.price}
                </span>
                <span className="text-sm text-gray-500">Inc. tax</span>
              </div>

              {product.stock < 10 ? (
                <div className="text-yellow-600 text-sm font-medium">
                  Only {product.stock} items left in stock
                </div>
              ) : (
                <div className="text-green-600 text-sm font-medium">
                  In stock
                </div>
              )}

              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Select Size
                </label>
                <div className="flex gap-2">
                  {filteredSizes.length > 0 ? (
                    filteredSizes.map((sizeInfo, index) => (
                      <div key={index} className="group/size relative">
                      <button
                        onClick={() => setSelectedSize(sizeInfo.size)}
                        disabled={!sizeInfo.inStock}
                        className={`w-10 h-10 text-sm font-medium rounded-lg transition-colors
                            ${!sizeInfo.inStock
                              ? 'border-2 border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                              : selectedSize === sizeInfo.size
                              ? 'bg-primary-600 text-white'
                                : 'border-2 border-gray-200 hover:border-primary-500 hover:text-primary-600'}`}
                      >
                        {sizeInfo.size}
                      </button>
                      {!sizeInfo.inStock && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded
                                     opacity-0 invisible group-hover/size:opacity-100 group-hover/size:visible transition-all">
                          Out of stock
                        </div>
                      )}
                    </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No sizes available</p>
                  )}
                </div>
              </div>

              <button
                disabled={!selectedSize}
                onClick={handleAddToCart}
                className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-colors
                  ${selectedSize
                    ? 'bg-primary-600 hover:bg-primary-700'
                    : 'bg-gray-300 cursor-not-allowed'}`}
              >
                {addedToCart ? 'Added to Cart!' : 'Add to Cart'}
              </button>

              {addedToCart && (
                <div className="mt-2 text-sm text-green-600 flex items-center justify-center">
                  <span>Added to cart successfully!</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary-50 rounded-lg">
                    <Shield className="h-5 w-5 text-primary-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Quality Guarantee</h4>
                    <p className="text-xs text-gray-500">Premium materials used</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Package className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Free Shipping</h4>
                    <p className="text-xs text-gray-500">On orders over $299</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <RefreshCcw className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Easy Returns</h4>
                    <p className="text-xs text-gray-500">30-day return policy</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Reviews
          product={product}
          reviews={reviews}
          currentUser={currentUser}
          userReview={userReview}
          isEditingReview={isEditingReview}
          handleEditReview={handleEditReview}
          handleDeleteReview={handleDeleteReview}
          handleVote={handleVote}
          fetchReviews={fetchReviews}
          setNewReview={setNewReview}
          newReview={newReview}
          reviewError={reviewError}
          reviewSuccess={reviewSuccess}
          setReviewError={setReviewError}
          setReviewSuccess={setReviewSuccess}
          setIsEditingReview={setIsEditingReview}
          setUserReview={setUserReview}
        />
      </div>
    </div>
  );
};

export default ProductDetails; 