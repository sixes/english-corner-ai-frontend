'use client'

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { track } from '@vercel/analytics';
import { supabase } from '../../lib/supabase';

const getNavigatorSnapshot = () => {
  if (typeof navigator === 'undefined') {
    return null;
  }

  return {
    userAgent: navigator.userAgent,
    language: navigator.language,
    online: navigator.onLine,
  };
};

const sendDebugLog = async (event, details = {}) => {
  if (typeof window === 'undefined' || typeof fetch === 'undefined') {
    return;
  }

  try {
    await fetch('/api/debug/log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event,
        details,
        timestamp: new Date().toISOString(),
      }),
    });
  } catch (logError) {
    console.warn('Failed to send debug log', logError);
  }
};

function AuthPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSignUp, setIsSignUp] = useState(false);
  const [step, setStep] = useState('form'); // 'form' or 'verify'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    gender: ''
  });
  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const getNetworkErrorMessage = () => 'Network error. Please check your connection.';

  // Check for signup query parameter
  useEffect(() => {
    if (searchParams.get('signup') === 'true') {
      setIsSignUp(true);
    }
  }, [searchParams]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError('');
  };

  const validateForm = () => {
    if (isSignUp && !formData.name.trim()) {
      setError('Please enter your name');
      return false;
    }

    if (isSignUp && !formData.gender) {
      setError('Please select your gender');
      return false;
    }

    if (!formData.email) {
      setError(isSignUp ? 'Please enter your email' : 'Please enter your email or name');
      return false;
    }

    // Only validate email format during signup
    if (isSignUp) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError('Please enter a valid email address');
        return false;
      }
    }

    if (!formData.password) {
      setError('Please enter your password');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }

    return true;
  };

  const getFriendlyAuthError = (error) => {
    if (!error) {
      return 'An error occurred. Please try again.';
    }

    const message = error?.message?.toLowerCase() || '';

    if (message.includes('already registered')) {
      return 'This email is already registered. Please sign in instead.';
    }
    if (message.includes('email not confirmed')) {
      return 'Please verify your email first. Check your inbox for the verification code.';
    }
    if (message.includes('session')) {
      return 'We could not find an active session. Please try again.';
    }
    if (error?.status === 429) {
      return 'Too many attempts. Please try again later.';
    }
    if (message.includes('network')) {
      return getNetworkErrorMessage();
    }

    return error?.message || 'An error occurred. Please try again.';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    sendDebugLog('auth_submit_start', {
      mode: isSignUp ? 'signup' : 'signin',
      emailProvided: Boolean(formData.email),
      navigator: getNavigatorSnapshot(),
    });

    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        try {
          const response = await fetch('/api/auth/check-user', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: formData.email,
              name: formData.name,
            }),
          });

          if (!response.ok) {
            const payload = await response.json().catch(() => ({}));
            throw new Error(payload?.error || 'Failed to validate existing accounts.');
          }

          const { emailExists, nameExists } = await response.json();

          if (emailExists) {
            setError('This email already has an account. Please sign in instead.');
            setLoading(false);
            return;
          }

          if (nameExists) {
            setError('This name is already in use. Please choose a different name or sign in.');
            setLoading(false);
            return;
          }
        } catch (checkError) {
          console.error('User uniqueness check failed:', checkError);
          throw checkError;
        }

        setOtpCode('');
        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.name.trim(),
              gender: formData.gender
            },
          },
        });

        if (error) {
          throw error;
        }
        
        setStep('verify');
        setResendTimer(60); // 60 seconds cooldown
        
        const interval = setInterval(() => {
          setResendTimer((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        track('user_signed_up', { method: 'email_otp' });
      } else {
        // Sign in - support both email and name
        let emailToUse = formData.email;

        // Check if input is a name (doesn't contain @)
        if (!formData.email.includes('@')) {
          try {
            const response = await fetch('/api/auth/get-email-by-name', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                name: formData.email,
              }),
            });

            if (!response.ok) {
              const payload = await response.json().catch(() => ({}));
              if (response.status === 404) {
                setError('No account found with this name. Please check your name or use your email.');
              } else {
                setError(payload?.error || 'Failed to find account.');
              }
              setLoading(false);
              return;
            }

            const { email } = await response.json();
            emailToUse = email;
          } catch (lookupError) {
            console.error('Name lookup failed:', lookupError);
            setError('Failed to find account. Please try using your email address.');
            setLoading(false);
            return;
          }
        }

        const { data, error } = await supabase.auth.signInWithPassword({
          email: emailToUse,
          password: formData.password,
        });

        if (error) {
          throw error;
        }

        if (data?.user && !data.user.email_confirmed_at) {
          setError('Please verify your email first. Check your inbox for the verification code.');
          await supabase.auth.signOut();
          setLoading(false);
          return;
        }

        track('user_signed_in', { method: 'email' });
        router.push('/');
      }
    } catch (error) {
      console.error('Auth error:', error);
      sendDebugLog('auth_submit_error', {
        mode: isSignUp ? 'signup' : 'signin',
        status: error?.status || error?.code,
        message: error?.message,
        navigator: getNavigatorSnapshot(),
      });
      
      setError(getFriendlyAuthError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (resendTimer > 0) return;

    if (!formData.email) {
      setError('Please enter your email so we can resend the verification code.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.resend({
        type: 'email',
        email: formData.email,
        options: {
          shouldCreateUser: true,
        },
      });

      if (error) {
        throw error;
      }

      setResendTimer(60);
      sendDebugLog('resend_verification_success', {
        emailDomain: formData.email.includes('@') ? formData.email.split('@')[1] : null,
        navigator: getNavigatorSnapshot(),
      });
      
      const interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      alert('Verification code sent! Please check your inbox.');
    } catch (error) {
      console.error('Resend error:', error);
      sendDebugLog('resend_verification_error', {
        status: error?.status || error?.code,
        message: error?.message,
        navigator: getNavigatorSnapshot(),
      });
      setError(getFriendlyAuthError(error));
    } finally {
      setLoading(false);
    }
  };

  const checkEmailVerified = async () => {
    setLoading(true);
    try {
      if (!otpCode.trim()) {
        setError('Please enter the 6-digit code from your email.');
        return;
      }

      const { data, error } = await supabase.auth.verifyOtp({
        email: formData.email,
        token: otpCode.trim(),
        type: 'signup',
      });

      if (error) {
        throw error;
      }

      if (data?.session) {
        track('email_verified');
        router.push('/');
      } else {
        setError('Invalid or expired code. Please try again.');
      }
    } catch (error) {
      console.error('Verification check error:', error);
      setError(getFriendlyAuthError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        padding: '40px',
        maxWidth: '450px',
        width: '100%'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ 
            fontSize: '28px', 
            fontWeight: 'bold',
            color: '#333',
            marginBottom: '10px'
          }}>
            Forever English Corner
          </h1>
          <p style={{ color: '#666', fontSize: '14px' }}>
            {step === 'verify' 
              ? 'Verify your email' 
              : (isSignUp ? 'Create your account' : 'Welcome back!')
            }
          </p>
        </div>

        {step === 'verify' ? (
          // Email Verification Step
          <div>
            <div style={{
              background: '#e8f5e9',
              border: '1px solid #4caf50',
              borderRadius: '8px',
              padding: '20px',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '10px' }}>📧</div>
              <h3 style={{ color: '#2e7d32', marginBottom: '10px' }}>Check Your Email!</h3>
              <p style={{ color: '#555', fontSize: '14px', lineHeight: '1.6' }}>
                We've sent a 6-digit verification code to:<br/>
                <strong>{formData.email}</strong>
              </p>
            </div>

            <div style={{ 
              background: '#f5f5f5', 
              borderRadius: '8px', 
              padding: '15px',
              marginBottom: '20px'
            }}>
              <p style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
                <strong>Next steps:</strong>
              </p>
              <ol style={{ fontSize: '14px', color: '#666', paddingLeft: '20px', lineHeight: '1.8' }}>
                <li>Open your email inbox</li>
                <li>Find the email from Supabase (Forever English Corner)</li>
                <li>Copy the 6-digit code</li>
                <li>Enter it below and confirm</li>
              </ol>
            </div>

            {error && (
              <div style={{
                background: '#fee',
                border: '1px solid #fcc',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '20px',
                color: '#c33',
                fontSize: '14px'
              }}>
                {error}
              </div>
            )}

            <div style={{ marginBottom: '15px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px',
                color: '#333',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                Verification Code
              </label>
              <input
                type="text"
                name="otp"
                value={otpCode}
                onChange={(e) => {
                  setOtpCode(e.target.value);
                  setError('');
                }}
                placeholder="Enter the 6-digit code"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  transition: 'border-color 0.3s',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
              />
            </div>

            <button
              type="button"
              onClick={checkEmailVerified}
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                background: loading ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                marginBottom: '15px'
              }}
            >
              {loading ? 'Checking...' : '✓ Verify and Continue'}
            </button>

            <button
              type="button"
              onClick={handleResendVerification}
              disabled={loading || resendTimer > 0}
              style={{
                width: '100%',
                padding: '12px',
                background: (loading || resendTimer > 0) ? '#e0e0e0' : '#fff',
                color: (loading || resendTimer > 0) ? '#999' : '#667eea',
                border: '2px solid #667eea',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: (loading || resendTimer > 0) ? 'not-allowed' : 'pointer',
                marginBottom: '20px'
              }}
            >
              {resendTimer > 0 
                ? `Resend in ${resendTimer}s` 
                : '↻ Resend Verification Email'
              }
            </button>

            <div style={{ 
              textAlign: 'center',
              paddingTop: '20px',
              borderTop: '1px solid #e0e0e0'
            }}>
              <button
                type="button"
                onClick={() => {
                  setStep('form');
                  setOtpCode('');
                  setFormData({ name: '', email: '', password: '', gender: '' });
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#666',
                  fontSize: '14px',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                ← Back to Sign Up
              </button>
            </div>
          </div>
        ) : (
          // Sign Up / Sign In Form
          <form onSubmit={handleSubmit}>
          {isSignUp && (
            <>
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  color: '#333',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="What should we call you?"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    transition: 'border-color 0.3s',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  color: '#333',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  Gender
                </label>
                <div style={{
                  display: 'flex',
                  gap: '10px',
                  flexWrap: 'wrap'
                }}>
                  {[
                    { value: 'male', label: 'Male', emoji: '👨' },
                    { value: 'female', label: 'Female', emoji: '👩' },
                    { value: 'undisclosed', label: 'Prefer not to say', emoji: '🤫' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, gender: option.value }))}
                      style={{
                        flex: '1',
                        minWidth: '100px',
                        padding: '12px 16px',
                        border: formData.gender === option.value
                          ? '2px solid #667eea'
                          : '2px solid #e0e0e0',
                        borderRadius: '8px',
                        background: formData.gender === option.value
                          ? 'linear-gradient(135deg, #667eea20 0%, #764ba220 100%)'
                          : 'white',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        fontSize: '14px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <span style={{ fontSize: '20px' }}>{option.emoji}</span>
                      <span style={{
                        color: formData.gender === option.value ? '#667eea' : '#666',
                        fontWeight: formData.gender === option.value ? '600' : '400'
                      }}>
                        {option.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: '#333',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              {isSignUp ? 'Email' : 'Email or Name'}
            </label>
            <input
              type={isSignUp ? "email" : "text"}
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder={isSignUp ? "Enter your email" : "Enter your email or name"}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '14px',
                transition: 'border-color 0.3s',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: '#333',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '14px',
                transition: 'border-color 0.3s',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
            />
          </div>

          {error && (
            <div style={{
              background: '#fee',
              border: '1px solid #fcc',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '20px',
              color: '#c33',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: loading ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'transform 0.2s',
              marginBottom: '20px'
            }}
            onMouseEnter={(e) => !loading && (e.target.style.transform = 'translateY(-2px)')}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
          >
            {loading ? 'Please wait...' : (isSignUp ? 'Send Verification Code' : 'Sign In')}
          </button>

          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
                setFormData({ name: '', email: '', password: '', gender: '' });
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#667eea',
                fontSize: '14px',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              {isSignUp ? 'Already have an account? Sign In' : 'Don\'t have an account? Sign Up'}
            </button>
          </div>

          <div style={{ 
            textAlign: 'center',
            paddingTop: '20px',
            borderTop: '1px solid #e0e0e0'
          }}>
            <Link 
              href="/chat" 
              style={{
                color: '#666',
                fontSize: '14px',
                textDecoration: 'none'
              }}
            >
              ← Back to Chat
            </Link>
          </div>
        </form>
        )}
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{ color: 'white', fontSize: '18px' }}>Loading...</div>
      </div>
    }>
      <AuthPageContent />
    </Suspense>
  );
}
