import React, { useState, useEffect } from 'react';
import ProductGrid from '../components/Collections/ProductGrid';
import { Search, SlidersHorizontal, ArrowDownWideNarrow, Sparkles } from 'lucide-react';
import api from '../services/api';

const Collections = () => {
  // Add loading state management
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    schools: '20+',
    products: '500+',
    satisfaction: '98%'
  });
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        // Simulate API call or add your actual API call here
        const allProducts = await api.getAllProducts();
        setProducts(allProducts);
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to load initial data:', err);
        setError('Failed to load data. Please try again.');
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.schoolName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Loading state UI
  if (isLoading) {
    return (
      <div className="pt-16 min-h-screen bg-white">
        <div className="animate-pulse">
          <div className="h-96 bg-gray-100"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="space-y-8">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-64 bg-gray-100 rounded-xl"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state UI
  if (error) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Oops! Something went wrong</h2>
          <p className="text-gray-600 mb-8">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16">
      {/* Enhanced Hero Section with Dynamic Background */}
      <div className="relative bg-white overflow-hidden min-h-[600px] flex items-center">
        {/* Enhanced Background with Deeper Gradients */}
        <div className="absolute inset-0">
          {/* Deeper Gradient Background with Animation */}
          <div className="absolute inset-0 bg-gradient-to-r from-white via-indigo-50/70 to-primary-100/60 animate-gradient-shift"></div>
          
          {/* Enhanced Colorful Blobs with Glassmorphism */}
          <div className="absolute -top-20 -left-20 w-96 h-96 bg-gradient-to-br from-primary-300/50 to-pink-300/50 rounded-full blur-3xl opacity-70 animate-blob"></div>
          <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-gradient-to-br from-indigo-300/50 to-secondary-300/50 rounded-full blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 -right-20 w-80 h-80 bg-gradient-to-br from-secondary-200/50 to-primary-200/50 rounded-full blur-3xl opacity-60 animate-blob animation-delay-4000"></div>
          
          {/* Enhanced Mesh Pattern with Animation */}
          <div 
            className="absolute inset-0 opacity-[0.07] animate-pulse-slow"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, rgba(99, 102, 241, 0.4) 1px, transparent 0)`,
              backgroundSize: '32px 32px'
            }}
          />

          {/* Enhanced Floating Particles */}
          <div className="absolute top-[15%] left-[5%] w-12 h-12 rounded-full opacity-30 bg-blue-400/40 blur-xl animate-float-slow"></div>
          <div className="absolute top-[25%] left-[17%] w-16 h-16 rounded-full opacity-40 bg-pink-400/40 blur-xl animate-float-medium animation-delay-300"></div>
          <div className="absolute top-[35%] left-[29%] w-20 h-20 rounded-full opacity-35 bg-green-400/40 blur-xl animate-float-fast animation-delay-600"></div>
          <div className="absolute top-[45%] left-[41%] w-24 h-24 rounded-full opacity-40 bg-yellow-400/40 blur-xl animate-float-slow animation-delay-900"></div>
          <div className="absolute top-[55%] left-[53%] w-28 h-28 rounded-full opacity-50 bg-purple-400/40 blur-xl animate-float-medium animation-delay-1200"></div>
          <div className="absolute top-[65%] left-[65%] w-32 h-32 rounded-full opacity-45 bg-blue-400/40 blur-xl animate-float-fast animation-delay-1500"></div>
          <div className="absolute top-[75%] left-[77%] w-24 h-24 rounded-full opacity-40 bg-pink-400/40 blur-xl animate-float-slow animation-delay-2000"></div>
          <div className="absolute top-[85%] left-[89%] w-20 h-20 rounded-full opacity-35 bg-green-400/40 blur-xl animate-float-medium animation-delay-4000"></div>
        </div>

        {/* Hero Content with Enhanced Glass Effect */}
        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center max-w-3xl mx-auto">
            {/* Enhanced Badge with Glassmorphism */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full 
                          bg-white/70 backdrop-blur-md border border-primary-100/80 
                          shadow-lg shadow-primary-500/20 mb-8
                          hover:bg-white/90 hover:scale-105 transition-all duration-300
                          animate-scale-in">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
              </span>
              <span className="text-sm font-medium text-primary-900">Premium School Uniforms</span>
            </div>

            {/* Enhanced Main Heading with Animation */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight text-gray-900 animate-fade-in-up">
              Discover Our
              <span className="relative inline-block px-4 mx-2 group">
                <span className="relative z-10 bg-gradient-to-r from-primary-600 to-indigo-600 bg-clip-text text-transparent
                               hover:from-primary-700 hover:to-indigo-800 transition-all duration-500 animate-text-gradient">
                  Uniform
                </span>
                <div className="absolute bottom-2 left-0 w-full h-3 bg-primary-200 -rotate-1 group-hover:h-4 group-hover:bg-primary-300 transition-all duration-300"></div>
              </span>
              Collection
            </h1>

            {/* Enhanced Subheading with Animation */}
            <p className="text-lg md:text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed
                         animate-fade-in-up opacity-0 animation-delay-300" style={{animationFillMode: "forwards"}}>
              Explore our comprehensive range of high-quality school uniforms, 
              designed for comfort and durability.
            </p>

            {/* Enhanced Search Bar with Glass Effect */}
            <div className="relative max-w-2xl mx-auto animate-fade-in-up opacity-0 animation-delay-600" style={{animationFillMode: "forwards"}}>
              <div className="relative transform hover:scale-[1.02] transition-all duration-300">
                <input
                  type="text"
                  placeholder="Search by school name or uniform type..."
                  className="w-full pl-14 pr-6 py-4 rounded-2xl 
                           bg-white/80 backdrop-blur-sm border-2 border-gray-100
                           focus:border-primary-500 focus:ring-4 focus:ring-primary-100/50 
                           shadow-lg shadow-primary-500/10 hover:shadow-xl hover:shadow-primary-500/15
                           transition-all duration-300 text-gray-900 placeholder-gray-400"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 animate-pulse" />
              </div>

              {/* Enhanced Popular Searches with Hover Effects */}
              <div className="mt-4 flex items-center justify-center gap-2 flex-wrap">
                <span className="text-sm text-gray-500">Popular:</span>
                {['Winter Blazer', 'Summer Shirt', 'Sports Uniform'].map((term, i) => (
                  <button
                    key={term}
                    className="px-3 py-1.5 text-sm bg-white/70 backdrop-blur-sm shadow-md
                             border border-gray-100 rounded-full text-gray-600 
                             hover:border-primary-500 hover:bg-primary-50/90
                             hover:text-primary-600 hover:scale-105 hover:shadow-lg
                             transition-all duration-300 animate-fade-in-up opacity-0"
                    style={{ animationDelay: `${900 + i * 150}ms`, animationFillMode: "forwards" }}
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>

            {/* Enhanced Stats with Animation and Glass Effect */}
            <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto animate-fade-in-up opacity-0 animation-delay-1200" style={{animationFillMode: "forwards"}}>
              {Object.entries(stats).map(([key, value], index) => (
                <div 
                  key={key} 
                  className="text-center p-4 rounded-xl bg-white/70 backdrop-blur-sm 
                           border border-gray-100/80 shadow-lg shadow-primary-500/10
                           hover:shadow-xl hover:bg-white/90 hover:scale-105
                           transition-all duration-300 animate-scale-in opacity-0"
                  style={{ animationDelay: `${1500 + index * 200}ms`, animationFillMode: "forwards" }}
                >
                  <div className="text-3xl font-bold text-gray-900 mb-1 relative">
                    <span className="relative z-10">{value}</span>
                    <span className="absolute inset-0 animate-shimmer"></span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <ProductGrid products={filteredProducts} />
      </div>
    </div>
  );
};

export default Collections; 