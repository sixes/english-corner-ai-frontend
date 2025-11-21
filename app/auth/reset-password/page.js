'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { track } from '@vercel/analytics';
import { supabase } from '../../../lib/supabase';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);

  useEffect(() => {
    // Check if there's a valid session from the email link
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsValidToken(true);
      } else {
        setError('Invalid or expired reset link. Please request a new password reset.');
      }
    };

    checkSession();
  }, []);

  const validateForm = () => {
    if (!newPassword) {
      setError('Please enter a new password');
      return false;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }

    if (newPassword !== confirmPassword) {
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

    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        throw error;
      }

      track('password_reset_completed');

      alert('Password successfully updated! You can now sign in with your new password.');

      // Sign out and redirect to sign in
      await supabase.auth.signOut();
      router.push('/auth');
    } catch (error) {
      console.error('Password update error:', error);
      setError(error?.message || 'Failed to update password. Please try again.');
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
            Set your new password
          </p>
        </div>

        {isValidToken ? (
          <form onSubmit={handleSubmit}>
            <div style={{
              background: '#e3f2fd',
              border: '1px solid #2196f3',
              borderRadius: '8px',
              padding: '20px',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '10px' }}>🔐</div>
              <h3 style={{ color: '#1565c0', marginBottom: '10px' }}>Reset Your Password</h3>
              <p style={{ color: '#555', fontSize: '14px', lineHeight: '1.6' }}>
                Choose a strong password with at least 6 characters.
              </p>
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

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: '#333',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setError('');
                }}
                placeholder="Enter your new password"
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
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setError('');
                }}
                placeholder="Confirm your new password"
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
                marginBottom: '15px'
              }}
            >
              {loading ? 'Updating Password...' : 'Update Password'}
            </button>

            <div style={{
              textAlign: 'center',
              paddingTop: '20px',
              borderTop: '1px solid #e0e0e0'
            }}>
              <button
                type="button"
                onClick={() => router.push('/auth')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#666',
                  fontSize: '14px',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                ← Back to Sign In
              </button>
            </div>
          </form>
        ) : (
          <div>
            <div style={{
              background: '#fee',
              border: '1px solid #fcc',
              borderRadius: '8px',
              padding: '20px',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '10px' }}>⚠️</div>
              <h3 style={{ color: '#c33', marginBottom: '10px' }}>Invalid Reset Link</h3>
              <p style={{ color: '#555', fontSize: '14px', lineHeight: '1.6' }}>
                {error || 'This password reset link is invalid or has expired.'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => router.push('/auth')}
              style={{
                width: '100%',
                padding: '14px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Go to Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
