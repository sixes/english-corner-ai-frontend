'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile,
  sendEmailVerification
} from 'firebase/auth';
import { auth } from '../../lib/firebase';
import Link from 'next/link';
import { track } from '@vercel/analytics';

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

export default function AuthPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [step, setStep] = useState('form'); // 'form' or 'verify'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [firebaseConnectivity, setFirebaseConnectivity] = useState('unknown'); // 'unknown' | 'reachable' | 'unreachable'

  useEffect(() => {
    if (typeof window === 'undefined' || typeof fetch === 'undefined') {
      return;
    }

    let cancelled = false;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);

    const checkConnectivity = async () => {
      try {
        await fetch('https://www.googleapis.com/generate_204', {
          mode: 'no-cors',
          signal: controller.signal,
        });
        if (!cancelled) {
          setFirebaseConnectivity('reachable');
        }
      } catch (connectivityError) {
        console.error('Firebase connectivity check failed:', connectivityError);
        sendDebugLog('firebase_connectivity_error', {
          message: connectivityError?.message,
          stack: connectivityError?.stack,
          navigator: getNavigatorSnapshot(),
        });
        if (!cancelled) {
          setFirebaseConnectivity('unreachable');
        }
      } finally {
        clearTimeout(timeoutId);
      }
    };

    checkConnectivity();

    return () => {
      cancelled = true;
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, []);

  const getNetworkErrorMessage = () => {
    if (firebaseConnectivity === 'unreachable') {
      return 'We cannot reach Google authentication services from this network. This often happens if Google domains are blocked. Please try a VPN or different network and let us know if the issue persists.';
    }
    return 'Network error. Please check your connection.';
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const validateForm = () => {
    if (isSignUp && !formData.name.trim()) {
      setError('Please enter your name');
      return false;
    }

    if (!formData.email) {
      setError('Please enter your email');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    if (!formData.password) {
      setError('Please enter your password');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }

    if (isSignUp && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    sendDebugLog('auth_submit_start', {
      mode: isSignUp ? 'signup' : 'signin',
      firebaseConnectivity,
      emailProvided: Boolean(formData.email),
      navigator: getNavigatorSnapshot(),
    });

    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        // Sign up
        const userCredential = await createUserWithEmailAndPassword(
          auth, 
          formData.email, 
          formData.password
        );
        
        // Update profile with name
        await updateProfile(userCredential.user, {
          displayName: formData.name
        });

        // Send verification email
        await sendEmailVerification(userCredential.user);
        
        setVerificationSent(true);
        setStep('verify');
        setResendTimer(60); // 60 seconds cooldown
        
        // Start countdown timer
        const interval = setInterval(() => {
          setResendTimer((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        track('user_signed_up', { method: 'email' });
      } else {
        // Sign in
        const userCredential = await signInWithEmailAndPassword(
          auth, 
          formData.email, 
          formData.password
        );

        // Check if email is verified
        if (!userCredential.user.emailVerified) {
          setError('Please verify your email first. Check your inbox for the verification link.');
          await auth.signOut(); // Sign out unverified user
          setLoading(false);
          return;
        }
        
        track('user_signed_in', { method: 'email' });
        router.push('/chat');
      }
    } catch (error) {
      console.error('Auth error:', error);
      sendDebugLog('auth_submit_error', {
        mode: isSignUp ? 'signup' : 'signin',
        code: error?.code,
        message: error?.message,
        firebaseConnectivity,
        navigator: getNavigatorSnapshot(),
      });
      
      // Provide user-friendly error messages
      switch (error.code) {
        case 'auth/email-already-in-use':
          setError('This email is already registered. Please sign in instead.');
          break;
        case 'auth/weak-password':
          setError('Password is too weak. Please use a stronger password.');
          break;
        case 'auth/invalid-email':
          setError('Invalid email address.');
          break;
        case 'auth/user-not-found':
          setError('No account found with this email. Please sign up.');
          break;
        case 'auth/wrong-password':
          setError('Incorrect password. Please try again.');
          break;
        case 'auth/too-many-requests':
          setError('Too many failed attempts. Please try again later.');
          break;
        case 'auth/network-request-failed':
          setError(getNetworkErrorMessage());
          break;
        default:
          setError(error.message || 'An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (resendTimer > 0) return;

    setLoading(true);
    setError('');

    try {
      const user = auth.currentUser;
      if (user) {
        await sendEmailVerification(user);
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

        alert('Verification email sent! Please check your inbox.');
      }
    } catch (error) {
      console.error('Resend error:', error);
      sendDebugLog('resend_verification_error', {
        code: error?.code,
        message: error?.message,
        navigator: getNavigatorSnapshot(),
      });
      setError('Failed to resend verification email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const checkEmailVerified = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (user) {
        await user.reload(); // Refresh user data
        if (user.emailVerified) {
          track('email_verified');
          router.push('/chat');
        } else {
          setError('Email not verified yet. Please check your inbox and click the verification link.');
        }
      }
    } catch (error) {
      console.error('Verification check error:', error);
      setError('Failed to check verification status. Please try again.');
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

        {firebaseConnectivity === 'unreachable' && (
          <div style={{
            background: '#fff8e1',
            border: '1px solid #fbc02d',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '20px',
            color: '#5d4037',
            fontSize: '14px',
            lineHeight: 1.5
          }}>
            <strong>Heads up:</strong> This network cannot reach Google Firebase services right now.
            This usually means Google domains are blocked locally. Please try a VPN, another network,
            or share your console logs so we can investigate further.
          </div>
        )}

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
                We've sent a verification link to:<br/>
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
                <li>Find the email from Firebase</li>
                <li>Click the verification link</li>
                <li>Come back and click "I've Verified My Email"</li>
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
              {loading ? 'Checking...' : '✓ I\'ve Verified My Email'}
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
                  auth.signOut();
                  setStep('form');
                  setVerificationSent(false);
                  setFormData({ name: '', email: '', password: '', confirmPassword: '' });
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
                placeholder="Enter your name"
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
          )}

          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px',
              color: '#333',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
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

          {isSignUp && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px',
                color: '#333',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
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
          )}

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
            {loading ? 'Please wait...' : (isSignUp ? 'Sign Up' : 'Sign In')}
          </button>

          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
                setFormData({ name: '', email: '', password: '', confirmPassword: '' });
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
