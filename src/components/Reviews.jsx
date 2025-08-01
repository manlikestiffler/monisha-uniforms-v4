import React, { useState } from 'react';
import { Star, ThumbsUp, ThumbsDown, AlertCircle, MessageCircle, Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import firebaseService from '../services/firebase';

const Reviews = ({
  product,
  reviews,
  currentUser,
  userReview,
  isEditingReview,
  handleEditReview,
  handleDeleteReview,
  handleVote,
  fetchReviews,
  setNewReview,
  newReview,
  reviewError,
  reviewSuccess,
  setReviewError,
  setReviewSuccess,
  setIsEditingReview,
  setUserReview
}) => {
  const navigate = useNavigate();
  const { id } = product;
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      setReviewError('Please log in to submit a review');
      return;
    }
    
    if (!newReview.rating || !newReview.comment) {
      setReviewError('Please provide both a rating and a comment');
      return;
    }

    setReviewSubmitting(true);
    setReviewError(null);
    
    try {
      const reviewData = {
        rating: newReview.rating,
        comment: newReview.comment,
        productId: id,
        productName: product.name
      };
      
      await firebaseService.addProductReview(id, reviewData);
      
      setReviewSuccess(userReview ? 'Review updated successfully!' : 'Review submitted successfully!');
      
      if (!userReview || !isEditingReview) {
        setNewReview({ rating: 0, comment: '' });
      }
      
      fetchReviews();
      
      setTimeout(() => {
        setReviewSuccess(null);
      }, 3000);
      
      if (isEditingReview) {
        setIsEditingReview(false);
      }
    } catch (error) {
      setReviewError(error.message || 'Failed to submit review. Please try again.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <div className="mt-8 bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-8">
        <div className="space-y-8">
          {currentUser ? (
            userReview && !isEditingReview ? (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Your Review</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleEditReview}
                      className="p-2 text-gray-600 hover:text-primary-600 rounded-full hover:bg-gray-100"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteReview(userReview.id)}
                      className="p-2 text-gray-600 hover:text-red-600 rounded-full hover:bg-gray-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center mt-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < userReview.rating
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                
                <p className="text-gray-700">{userReview.comment}</p>
                
                <div className="flex items-center mt-3 text-xs text-gray-500">
                  <span>Submitted on {new Date(userReview.createdAt?.toDate()).toLocaleDateString()}</span>
                  {userReview.updatedAt?.toDate() > userReview.createdAt?.toDate() && (
                    <span className="ml-2">(Edited on {new Date(userReview.updatedAt?.toDate()).toLocaleDateString()})</span>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {isEditingReview ? 'Edit Your Review' : 'Write a Review'}
                </h3>
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rating
                    </label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewReview(prev => ({ ...prev, rating: star }))}
                          className="p-1 hover:scale-110 transition-transform"
                        >
                          <Star
                            className={`h-6 w-6 ${
                              star <= newReview.rating
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Your Review
                    </label>
                    <textarea
                      value={newReview.comment}
                      onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                      rows={4}
                      className="w-full rounded-lg border-gray-200 focus:border-primary-500 focus:ring-primary-500"
                      placeholder="Share your experience with this product..."
                    />
                  </div>

                  {reviewError && (
                    <div className="flex items-center gap-2 text-red-600 text-sm">
                      <AlertCircle className="h-4 w-4" />
                      <span>{reviewError}</span>
                    </div>
                  )}
                  
                  {reviewSuccess && (
                    <div className="flex items-center gap-2 text-green-600 text-sm">
                      <MessageCircle className="h-4 w-4" />
                      <span>{reviewSuccess}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    {isEditingReview && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingReview(false);
                          setNewReview({ rating: 0, comment: '' });
                        }}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={reviewSubmitting}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                    >
                      {reviewSubmitting 
                        ? 'Submitting...' 
                        : isEditingReview 
                          ? 'Update Review' 
                          : 'Submit Review'
                      }
                    </button>
                  </div>
                </form>
              </div>
            )
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Sign in to write a review</h3>
                <p className="text-gray-600 mb-4">Share your experience with this product with other customers</p>
                <button
                  onClick={() => navigate('/login')}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Sign In
                </button>
              </div>
            </div>
          )}

          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">
              {reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'}
            </h3>
            
            {reviews.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <p className="text-gray-600">This product doesn't have any reviews yet. Be the first to share your thoughts!</p>
              </div>
            ) : (
              reviews.map((review) => (
                <div key={review.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{review.userName}</span>
                        <span className="text-sm text-gray-500">
                          {review.createdAt && new Date(review.createdAt.toDate()).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    {currentUser && review.userId !== currentUser.uid && (
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => handleVote(review.id, 'helpful')}
                          className={`flex items-center gap-1 text-sm ${
                            review.votes && review.votes[currentUser.uid] === 'helpful'
                              ? 'text-green-600'
                              : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          <ThumbsUp className="h-4 w-4" />
                          <span>{review.helpful || 0}</span>
                        </button>
                        <button 
                          onClick={() => handleVote(review.id, 'notHelpful')}
                          className={`flex items-center gap-1 text-sm ${
                            review.votes && review.votes[currentUser.uid] === 'notHelpful'
                              ? 'text-red-600'
                              : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          <ThumbsDown className="h-4 w-4" />
                          <span>{review.notHelpful || 0}</span>
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reviews; 