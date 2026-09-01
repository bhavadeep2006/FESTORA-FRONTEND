import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { CheckCircle2, Sparkles, AlertCircle } from 'lucide-react';
import './AuthPages.css';

export const AuthSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setAuthSession } = useAuth();
  const [status, setStatus] = useState('processing'); // 'processing' | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const handleGoogleCallbackToken = async () => {
      const token = searchParams.get('token');
      if (!token) {
        setStatus('error');
        setErrorMsg('Authentication token missing from Google OAuth response.');
        return;
      }

      try {
        localStorage.setItem('festora_token', token);
        const meRes = await api.getMe();
        if (meRes && meRes.user) {
          setAuthSession(token, meRes.user);
          setStatus('success');
          setTimeout(() => {
            navigate('/', { replace: true });
          }, 1200);
        } else {
          setStatus('error');
          setErrorMsg('Failed to fetch user profile after Google authentication.');
        }
      } catch (err) {
        console.error('[Google OAuth Callback Error]:', err);
        setStatus('error');
        setErrorMsg(err.message || 'Error processing Google sign-in.');
      }
    };

    handleGoogleCallbackToken();
  }, [searchParams, navigate, setAuthSession]);

  return (
    <div className="auth-page-container flex-center" style={{ minHeight: '80vh' }}>
      <div className="auth-card" style={{ maxWidth: '440px', width: '100%', textAlign: 'center', padding: '40px 24px' }}>
        {status === 'processing' && (
          <>
            <div className="loading-spinner-circle" style={{ width: '48px', height: '48px', margin: '0 auto 20px', border: '3px solid var(--border-subtle)', borderTopColor: 'var(--strong-lavender)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px' }}>
              Signing you in...
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Completing Google OAuth authentication. Please wait.
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle2 size={54} color="#22C55E" style={{ margin: '0 auto 16px' }} />
            <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px' }}>
              Welcome to Festora!
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Google authentication successful. Redirecting you to home...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <AlertCircle size={54} color="#EF4444" style={{ margin: '0 auto 16px' }} />
            <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#EF4444', marginBottom: '8px' }}>
              Authentication Failed
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>
              {errorMsg}
            </p>
            <button
              onClick={() => navigate('/signin', { replace: true })}
              className="auth-btn-primary"
              style={{ width: '100%' }}
            >
              Back to Sign In
            </button>
          </>
        )}
      </div>
    </div>
  );
};
