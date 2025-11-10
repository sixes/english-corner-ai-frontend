'use client'

import { useState, useEffect } from 'react';
import './Sessions.css';

export default function Sessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    console.log('Sessions component mounted');
    
    const fetchSessions = async () => {
      try {
        console.log('Fetching sessions from /api/sessions');
        const response = await fetch('/api/sessions');
        console.log('Response status:', response.status);
        const data = await response.json();
        console.log('Data received:', data);
        
        if (data.success) {
          console.log('Setting sessions:', data.sessions.length);
          setSessions(data.sessions);
        } else {
          console.error('API returned success=false');
          setError('Failed to load sessions');
        }
      } catch (err) {
        console.error('Error fetching sessions:', err);
        setError('Failed to load sessions: ' + err.message);
      } finally {
        console.log('Setting loading to false');
        setLoading(false);
      }
    };

    // Add a timeout as fallback
    const timeout = setTimeout(() => {
      if (loading) {
        console.error('Fetch timeout');
        setError('Request timed out');
        setLoading(false);
      }
    }, 10000);

    fetchSessions().finally(() => clearTimeout(timeout));

    return () => clearTimeout(timeout);
  }, []);

  const isUpcoming = (dateStr) => {
    const sessionDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return sessionDate >= today;
  };

  const upcomingSessions = sessions.filter(s => isUpcoming(s.date));
  const pastSessions = sessions.filter(s => !isUpcoming(s.date));

  const handleSignUp = (session) => {
    if (!user) {
      alert('Please sign in to register for sessions');
      window.location.href = '/auth';
      return;
    }
    // TODO: Implement signup logic
    alert(`Signup for session on ${session.date} - Coming soon!`);
  };

  if (loading) {
    return <div className="sessions-loading">Loading sessions...</div>;
  }

  if (error) {
    return <div className="sessions-error">{error}</div>;
  }

  return (
    <div className="sessions-container">
      {/* Upcoming Sessions */}
      <section className="sessions-section">
        <h2>📅 Upcoming Sessions</h2>
        {upcomingSessions.length === 0 ? (
          <p className="no-sessions">No upcoming sessions scheduled yet. Check back soon!</p>
        ) : (
          <div className="sessions-grid">
            {upcomingSessions.map((session) => (
              <div key={session.id} className="session-card upcoming">
                <div className="session-header">
                  <h3>{session.topic}</h3>
                </div>
                <div className="session-details">
                  <p><strong>📅 Date:</strong> {session.date}</p>
                  <p><strong>🕐 Time:</strong> {session.time}</p>
                  <p><strong>📍 Location:</strong> {session.location}</p>
                  <p><strong>👥 Participants:</strong> {session.participants.length} registered</p>
                </div>
                <button 
                  className="signup-btn"
                  onClick={() => handleSignUp(session)}
                >
                  {user ? 'Sign Up for This Session' : 'Sign In to Register'}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Past Sessions */}
      <section className="sessions-section">
        <h2>📚 Past Sessions</h2>
        {pastSessions.length === 0 ? (
          <p className="no-sessions">No past sessions to display.</p>
        ) : (
          <div className="sessions-grid">
            {pastSessions.slice(0, 6).map((session) => (
              <div key={session.id} className="session-card past">
                <div className="session-header">
                  <h3>{session.topic}</h3>
                </div>
                <div className="session-details">
                  <p><strong>📅 Date:</strong> {session.date}</p>
                  <p><strong>🕐 Time:</strong> {session.time}</p>
                  <p><strong>📍 Location:</strong> {session.location}</p>
                  <p><strong>👥 Participants:</strong> {session.participants.length} attended</p>
                </div>
              </div>
            ))}
          </div>
        )}
        {pastSessions.length > 6 && (
          <p className="more-sessions">+ {pastSessions.length - 6} more past sessions</p>
        )}
      </section>
    </div>
  );
}
