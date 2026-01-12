'use client'

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import './Sessions.css';

export default function Sessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [expandedSession, setExpandedSession] = useState(null);
  const [newSession, setNewSession] = useState({
    date: '',
    time: '19:30 - 22:00',
    location: '',
    topic: '',
    max_participants: 14
  });

  // Get auth token for API calls
  const getAuthToken = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token;
  };

  useEffect(() => {
    // Get initial user
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    getUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/sessions');
      const data = await response.json();

      if (data.success) {
        setSessions(data.sessions);
      } else {
        setError('Failed to load sessions');
      }
    } catch (err) {
      console.error('Error fetching sessions:', err);
      setError('Failed to load sessions: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const isUpcoming = (dateStr) => {
    const sessionDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return sessionDate >= today;
  };

  const isUserSignedUp = (session) => {
    if (!user) return false;
    return session.participants.some(p => p.user_id === user.id);
  };

  const handleSignUp = async (sessionId) => {
    if (!user) {
      window.location.href = '/auth?signup=true';
      return;
    }

    setActionLoading(sessionId);
    try {
      const token = await getAuthToken();
      const response = await fetch(`/api/sessions/${sessionId}/signup`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        // Add celebration effect
        showCelebration();
        await fetchSessions();
      } else {
        alert(data.error || 'Failed to sign up');
      }
    } catch (err) {
      console.error('Signup error:', err);
      alert('Failed to sign up: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelSignup = async (sessionId) => {
    if (!confirm('Are you sure you want to cancel your signup?')) return;

    setActionLoading(sessionId);
    try {
      const token = await getAuthToken();
      const response = await fetch(`/api/sessions/${sessionId}/signup`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        await fetchSessions();
      } else {
        alert(data.error || 'Failed to cancel signup');
      }
    } catch (err) {
      console.error('Cancel error:', err);
      alert('Failed to cancel: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();

    if (!user) {
      window.location.href = '/auth';
      return;
    }

    setActionLoading('create');
    try {
      const token = await getAuthToken();
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newSession)
      });

      const data = await response.json();

      if (data.success) {
        setShowCreateForm(false);
        setNewSession({
          date: '',
          time: '19:30 - 22:00',
          location: '',
          topic: '',
          max_participants: 14
        });
        showCelebration();
        await fetchSessions();
      } else {
        alert(data.error || 'Failed to create session');
      }
    } catch (err) {
      console.error('Create error:', err);
      alert('Failed to create session: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelSession = async (sessionId) => {
    if (!confirm('Are you sure you want to cancel this session? All signups will be notified.')) return;

    setActionLoading(sessionId);
    try {
      const token = await getAuthToken();
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        await fetchSessions();
      } else {
        alert(data.error || 'Failed to cancel session');
      }
    } catch (err) {
      console.error('Cancel session error:', err);
      alert('Failed to cancel session: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const showCelebration = () => {
    // Create confetti effect
    const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe'];
    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.left = Math.random() * 100 + 'vw';
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.animationDelay = Math.random() * 0.5 + 's';
      document.body.appendChild(confetti);
      setTimeout(() => confetti.remove(), 3000);
    }
  };

  const getGenderEmoji = (gender) => {
    switch (gender) {
      case 'male': return '👨';
      case 'female': return '👩';
      default: return '🧑';
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const upcomingSessions = sessions.filter(s => isUpcoming(s.date));
  const pastSessions = sessions.filter(s => !isUpcoming(s.date));

  if (loading) {
    return (
      <div className="sessions-loading">
        <div className="loading-spinner"></div>
        <p>Loading amazing sessions...</p>
      </div>
    );
  }

  if (error) {
    return <div className="sessions-error">{error}</div>;
  }

  return (
    <div className="sessions-container">
      {/* Create Session Button */}
      {user && (
        <div className="create-session-wrapper">
          <button
            className="create-session-btn"
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            {showCreateForm ? '✕ Cancel' : '✨ Schedule New Session'}
          </button>
        </div>
      )}

      {/* Create Session Form */}
      {showCreateForm && (
        <div className="create-session-form">
          <h3>Create a New Session</h3>
          <form onSubmit={handleCreateSession}>
            <div className="form-row">
              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  value={newSession.date}
                  onChange={(e) => setNewSession(prev => ({ ...prev, date: e.target.value }))}
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="form-group">
                <label>Time</label>
                <input
                  type="text"
                  value={newSession.time}
                  onChange={(e) => setNewSession(prev => ({ ...prev, time: e.target.value }))}
                  placeholder="e.g., 19:30 - 22:00"
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                value={newSession.location}
                onChange={(e) => setNewSession(prev => ({ ...prev, location: e.target.value }))}
                placeholder="e.g., Starbucks Futian"
                required
              />
            </div>
            <div className="form-group">
              <label>Topic</label>
              <input
                type="text"
                value={newSession.topic}
                onChange={(e) => setNewSession(prev => ({ ...prev, topic: e.target.value }))}
                placeholder="What will we discuss?"
                required
              />
            </div>
            <div className="form-group">
              <label>Max Participants</label>
              <input
                type="number"
                value={newSession.max_participants}
                onChange={(e) => setNewSession(prev => ({ ...prev, max_participants: parseInt(e.target.value) }))}
                min="5"
                max="50"
              />
            </div>
            <button
              type="submit"
              className="submit-session-btn"
              disabled={actionLoading === 'create'}
            >
              {actionLoading === 'create' ? 'Creating...' : '🚀 Launch Session'}
            </button>
          </form>
        </div>
      )}

      {/* Upcoming Sessions */}
      <section className="sessions-section">
        <h2>🎯 Upcoming Sessions</h2>
        {upcomingSessions.length === 0 ? (
          <p className="no-sessions">
            No upcoming sessions yet. {user ? 'Be the first to schedule one!' : 'Sign in to create one!'}
          </p>
        ) : (
          <div className="sessions-grid">
            {upcomingSessions.map((session) => {
              const signedUp = isUserSignedUp(session);
              const spotsLeft = session.max_participants - session.participants.length;
              const isExpanded = expandedSession === session.id;

              return (
                <div key={session.id} className={`session-card upcoming ${signedUp ? 'signed-up' : ''}`}>
                  {signedUp && <div className="signed-up-badge">You're In!</div>}
                  <div className="session-header">
                    <h3>{session.topic}</h3>
                    {spotsLeft <= 5 && spotsLeft > 0 && (
                      <span className="spots-warning">Only {spotsLeft} spots left!</span>
                    )}
                    {spotsLeft === 0 && <span className="spots-full">Full!</span>}
                  </div>
                  <div className="session-details">
                    <p><span className="detail-icon">📅</span> {formatDate(session.date)}</p>
                    <p><span className="detail-icon">🕐</span> {session.time}</p>
                    <p><span className="detail-icon">📍</span> {session.location}</p>
                    <p>
                      <span className="detail-icon">👥</span>
                      <span className="participant-count">{session.participants.length}</span>
                      /{session.max_participants} joined
                    </p>
                  </div>

                  {/* Participants Preview */}
                  {session.participants.length > 0 && (
                    <div className="participants-preview">
                      <button
                        className="show-participants-btn"
                        onClick={() => setExpandedSession(isExpanded ? null : session.id)}
                      >
                        {isExpanded ? 'Hide' : 'Show'} who's coming ({session.participants.length})
                      </button>
                      {isExpanded && (
                        <div className="participants-list">
                          {session.participants.map((p, idx) => (
                            <div key={idx} className="participant-item">
                              <span className="participant-emoji">{getGenderEmoji(p.user_gender)}</span>
                              <span className="participant-name">{p.user_name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="session-actions">
                    {signedUp ? (
                      <button
                        className="cancel-signup-btn"
                        onClick={() => handleCancelSignup(session.id)}
                        disabled={actionLoading === session.id}
                      >
                        {actionLoading === session.id ? 'Cancelling...' : '😢 Cancel My Spot'}
                      </button>
                    ) : (
                      <button
                        className="signup-btn"
                        onClick={() => handleSignUp(session.id)}
                        disabled={actionLoading === session.id || spotsLeft === 0}
                      >
                        {actionLoading === session.id ? 'Joining...' :
                         spotsLeft === 0 ? '😞 Session Full' :
                         user ? '🎉 Join This Session!' : '🔐 Sign In to Join'}
                      </button>
                    )}
                    {user && session.created_by === user.id && (
                      <button
                        className="cancel-session-btn"
                        onClick={() => handleCancelSession(session.id)}
                        disabled={actionLoading === session.id}
                      >
                        Cancel Session
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Past Sessions */}
      {pastSessions.length > 0 && (
        <section className="sessions-section past-sessions">
          <h2>📚 Past Sessions</h2>
          <div className="sessions-grid">
            {pastSessions.map((session) => {
              const isExpanded = expandedSession === session.id;
              
              return (
                <div key={session.id} className="session-card past">
                  <div className="session-header">
                    <h3>{session.topic}</h3>
                  </div>
                  <div className="session-details">
                    <p><span className="detail-icon">📅</span> {formatDate(session.date)}</p>
                    <p><span className="detail-icon">📍</span> {session.location}</p>
                    <p><span className="detail-icon">👥</span> {session.participants.length} attended</p>
                  </div>
                  
                  {/* Participants for Past Sessions */}
                  {session.participants.length > 0 && (
                    <div className="participants-preview">
                      <button
                        className="show-participants-btn"
                        onClick={() => setExpandedSession(isExpanded ? null : session.id)}
                      >
                        {isExpanded ? 'Hide' : 'Show'} participants ({session.participants.length})
                      </button>
                      {isExpanded && (
                        <div className="participants-list">
                          {session.participants.map((p, idx) => (
                            <div key={idx} className="participant-item">
                              <span className="participant-emoji">{getGenderEmoji(p.user_gender)}</span>
                              <span className="participant-name">{p.user_name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
