/**
 * Login Modal Component
 * Handles OTP-based login for users
 */

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import OTPInput from './OTPInput';

type Step = 'identifier' | 'otp';

export default function LoginModal() {
  const { isLoginModalOpen, closeLoginModal, login } = useAuth();
  const [step, setStep] = useState<Step>('identifier');
  const [identifier, setIdentifier] = useState('');
  const [name, setName] = useState('');
  const [otp, setOTP] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [canResendAt, setCanResendAt] = useState<Date | null>(null);
  const [resendTimer, setResendTimer] = useState(0);

  // Reset state when modal closes
  React.useEffect(() => {
    if (!isLoginModalOpen) {
      setTimeout(() => {
        setStep('identifier');
        setIdentifier('');
        setName('');
        setOTP('');
        setError('');
        setSuccessMessage('');
        setCanResendAt(null);
        setResendTimer(0);
      }, 300);
    }
  }, [isLoginModalOpen]);

  // Countdown timer for resend
  React.useEffect(() => {
    if (!canResendAt) return;

    const interval = setInterval(() => {
      const now = new Date();
      const diff = Math.ceil((canResendAt.getTime() - now.getTime()) / 1000);
      if (diff <= 0) {
        setCanResendAt(null);
        setResendTimer(0);
      } else {
        setResendTimer(diff);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [canResendAt]);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/user/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage('OTP sent successfully! Check your email.');
        setStep('otp');
        setCanResendAt(null);
      } else {
        setError(data.message || 'Failed to send OTP');
        if (data.canResendAt) {
          setCanResendAt(new Date(data.canResendAt));
        }
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await login(identifier.trim(), otp, name.trim() || undefined);

      if (!result.success) {
        setError(result.error || 'Invalid OTP');
      }
      // Success is handled by AuthContext
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/user/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage('OTP resent successfully!');
        setOTP('');
        setCanResendAt(null);
      } else {
        setError(data.message || 'Failed to resend OTP');
        if (data.canResendAt) {
          setCanResendAt(new Date(data.canResendAt));
        }
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoginModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
        {/* Close Button */}
        <button
          onClick={closeLoginModal}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            {step === 'identifier' ? 'Welcome! 👋' : 'Enter OTP'}
          </h2>
          <p className="text-gray-600">
            {step === 'identifier'
              ? 'Login or create an account to continue'
              : `We sent a code to ${identifier}`}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            {successMessage}
          </div>
        )}

        {/* Step 1: Enter Email */}
        {step === 'identifier' && (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Your Name (Optional)
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
              />
            </div>

            <div>
              <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                id="identifier"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
              />
              <p className="mt-1 text-xs text-gray-500">
                Phone login coming soon!
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading || !identifier}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg"
            >
              {isLoading ? 'Sending...' : 'Send OTP'}
            </button>
          </form>
        )}

        {/* Step 2: Enter OTP */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                Enter 6-Digit Code
              </label>
              <OTPInput
                length={6}
                value={otp}
                onChange={setOTP}
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || otp.length !== 6}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg"
            >
              {isLoading ? 'Verifying...' : 'Verify & Login'}
            </button>

            <div className="text-center space-y-2">
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={isLoading || !!canResendAt}
                className="text-purple-600 hover:text-purple-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {canResendAt
                  ? `Resend in ${resendTimer}s`
                  : 'Resend OTP'}
              </button>

              <div>
                <button
                  type="button"
                  onClick={() => setStep('identifier')}
                  className="text-gray-600 hover:text-gray-700 text-sm"
                >
                  Change email
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Footer */}
        <p className="text-xs text-gray-500 text-center mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}

