import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, CheckCircle, RefreshCw } from 'lucide-react';
import Alert from '../components/ui/Alert';

const VerifyEmail = () => {
  const [resending, setResending] = useState(false);
  const [alert, setAlert] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user, resendVerificationEmail } = useAuth();

  useEffect(() => {
    if (user && user.emailVerified) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleResendCode = async () => {
    setError('');
    setResending(true);
    
    try {
      const result = await resendVerificationEmail();
      if (result.success) {
        setAlert({
          message: 'Verification email has been resent!',
          type: 'success'
        });
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to resend verification email');
    } finally {
      setResending(false);
    }
  };

  const handleLoginRedirect = () => {
    navigate('/login');
  };
  
  return (
    <div className="min-h-screen pt-24 bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-primary-100 mb-4">
            <Mail className="h-6 w-6 text-primary-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Verify Your Email</h1>
          <p className="mt-2 text-gray-600">
            Thanks for registering for an account on the Monisha Uniforms Website!
          </p>
          <p className="mt-4 text-gray-600">
            A verification link has been sent to your email address. Please click the link to verify your account and then log in.
          </p>
          
          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="mt-8">
            <button
              onClick={handleLoginRedirect}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent 
                       rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 
                       hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 
                       focus:ring-primary-500"
            >
              Go to Login
              <CheckCircle className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 mb-4">
              Didn't receive the email?
            </p>
            <button
              onClick={handleResendCode}
              disabled={resending}
              className="flex items-center gap-2 mx-auto py-2 px-4 border border-gray-300 
                       rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white 
                       hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 
                       focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resending ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Resending...
                </span>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Resend Email
                </>
              )}
            </button>
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

export default VerifyEmail; 
