import React, { useEffect, useState } from 'react';
import api from './api';

export default function StudentDashboard({ user }) {
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [submissionFile, setSubmissionFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await api.get('/tasks/my');
      setTasks(res.data);
    } catch (e) {
      console.error('Error fetching tasks:', e);
    }
    setLoading(false);
  };

  const submitTask = async (e) => {
    e.preventDefault();
    if (!submissionFile) return;

    const formData = new FormData();
    formData.append('file', submissionFile);

    try {
      await api.post(`/tasks/${selectedTask.id}/submit`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSubmissionFile(null);
      setSelectedTask(null);
      fetchTasks();
    } catch (e) {
      alert('Greška pri predaji zadatka');
    }
  };

  const stats = {
    total: tasks.length,
    submitted: tasks.filter(t => t.submission !== null).length,
    graded: tasks.filter(t => t.submission?.grade !== null).length,
    pending: tasks.filter(t => t.submission === null).length
  };

  const avgGrade = () => {
    const gradedTasks = tasks.filter(t => t.submission?.grade !== null);
    if (gradedTasks.length === 0) return '-';
    const sum = gradedTasks.reduce((acc, t) => acc + t.submission.grade, 0);
    return (sum / gradedTasks.length).toFixed(1);
  };

  return (
    <div>
      {/* Stats Cards */}
      <div className="stat-cards">
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon blue">📝</div>
          </div>
          <div className="stat-card-value">{stats.total}</div>
          <div className="stat-card-label">Ukupno zadataka</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon green">✓</div>
          </div>
          <div className="stat-card-value">{stats.submitted}</div>
          <div className="stat-card-label">Predatih</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon orange">⏳</div>
          </div>
          <div className="stat-card-value">{stats.pending}</div>
          <div className="stat-card-label">Za predaju</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon purple">📊</div>
          </div>
          <div className="stat-card-value">{avgGrade()}</div>
          <div className="stat-card-label">Prosek ocena</div>
        </div>
      </div>

      {/* Tasks Section */}
      <div style={{
        background: 'var(--gray-900)',
        border: '1px solid var(--gray-800)',
        borderRadius: '16px',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--gray-800)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '600', color: 'var(--gray-50)' }}>
            Moji zadaci
          </h3>
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--gray-400)' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
            Učitavanje zadataka...
          </div>
        ) : tasks.length === 0 ? (
          <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.3 }}>📝</div>
            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', fontWeight: '600', color: 'var(--gray-300)' }}>
              Nemate zadataka
            </h4>
            <p style={{ color: 'var(--gray-500)', fontSize: '0.9375rem' }}>
              Vaši zadaci će se pojaviti ovde kada ih profesor dodeli
            </p>
          </div>
        ) : (
          <div style={{ padding: '1rem' }}>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {tasks.map(task => {
                const isSubmitted = task.submission !== null;
                const isGraded = isSubmitted && task.submission.grade !== null;
                const deadline = new Date(task.deadline);
                const isOverdue = deadline < new Date() && !isSubmitted;

                let borderColor = 'var(--gray-800)';
                if (isOverdue) borderColor = 'var(--error-500)';
                else if (isGraded) borderColor = 'var(--success-500)';
                else if (isSubmitted) borderColor = 'var(--primary-500)';

                return (
                  <div
                    key={task.id}
                    style={{
                      background: 'var(--gray-800)',
                      borderRadius: '12px',
                      border: `2px solid ${borderColor}`,
                      overflow: 'hidden'
                    }}
                  >
                    <div style={{ padding: '1.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                        <div style={{ flex: 1 }}>
                          {/* Course Badge */}
                          <span style={{
                            display: 'inline-flex',
                            padding: '0.25rem 0.75rem',
                            fontSize: '0.6875rem',
                            fontWeight: '500',
                            borderRadius: '100px',
                            background: 'rgba(59, 130, 246, 0.1)',
                            color: 'var(--primary-400)',
                            marginBottom: '0.75rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.025em'
                          }}>
                            {task.course_name}
                          </span>

                          {/* Title */}
                          <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.125rem', fontWeight: '600', color: 'var(--gray-50)' }}>
                            {task.title}
                          </h4>

                          {/* Description */}
                          <p style={{ margin: '0 0 1rem 0', fontSize: '0.9375rem', color: 'var(--gray-400)', lineHeight: '1.6' }}>
                            {task.description}
                          </p>

                          {/* Deadline */}
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.5rem 0.75rem',
                            background: isOverdue ? 'rgba(239, 68, 68, 0.1)' : 'var(--gray-900)',
                            borderRadius: '8px',
                            fontSize: '0.8125rem',
                            color: isOverdue ? '#ef4444' : 'var(--gray-400)'
                          }}>
                            <span>🕐</span>
                            <span>Rok: {deadline.toLocaleString('sr-RS')}</span>
                            {isOverdue && <span style={{ fontWeight: '600', marginLeft: '0.5rem' }}>PREKORAČEN</span>}
                          </div>
                        </div>

                        {/* Action Button */}
                        {!isSubmitted && !isOverdue && (
                          <button
                            onClick={() => setSelectedTask(selectedTask?.id === task.id ? null : task)}
                            className={`btn ${selectedTask?.id === task.id ? 'btn-secondary' : 'btn-primary'}`}
                          >
                            {selectedTask?.id === task.id ? 'Otkaži' : '📤 Predaj'}
                          </button>
                        )}
                      </div>

                      {/* Submission Status */}
                      {isSubmitted && (
                        <div style={{
                          marginTop: '1rem',
                          padding: '1rem',
                          background: isGraded ? 'rgba(16, 185, 129, 0.1)' : 'var(--gray-900)',
                          borderRadius: '8px',
                          border: `1px solid ${isGraded ? 'rgba(16, 185, 129, 0.2)' : 'var(--gray-700)'}`
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: isGraded ? '0.75rem' : 0 }}>
                            <span style={{ color: '#10b981' }}>✓</span>
                            <span style={{ fontSize: '0.875rem', color: '#10b981', fontWeight: '500' }}>
                              Predato: {new Date(task.submission.submitted_at).toLocaleString('sr-RS')}
                            </span>
                          </div>

                          {isGraded ? (
                            <div>
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem'
                              }}>
                                <div style={{
                                  width: '48px',
                                  height: '48px',
                                  borderRadius: '12px',
                                  background: 'linear-gradient(135deg, #10b981, #059669)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '1.25rem',
                                  fontWeight: '700',
                                  color: 'white'
                                }}>
                                  {task.submission.grade}
                                </div>
                                <div>
                                  <div style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--gray-100)' }}>
                                    Ocena: {task.submission.grade}/10
                                  </div>
                                  {task.submission.feedback && (
                                    <div style={{ fontSize: '0.875rem', color: 'var(--gray-400)', marginTop: '0.25rem' }}>
                                      "{task.submission.feedback}"
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f59e0b', fontSize: '0.875rem' }}>
                              <span>⏳</span>
                              <span>Čeka ocenu profesora...</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Upload Form */}
                      {selectedTask?.id === task.id && (
                        <form onSubmit={submitTask} style={{
                          marginTop: '1rem',
                          padding: '1rem',
                          background: 'var(--gray-900)',
                          borderRadius: '8px',
                          border: '1px solid var(--gray-700)'
                        }}>
                          <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: 'var(--gray-300)' }}>
                              Izaberite .py fajl za predaju
                            </label>
                            <input
                              type="file"
                              accept=".py"
                              onChange={e => setSubmissionFile(e.target.files[0])}
                              required
                              style={{ width: '100%' }}
                            />
                          </div>
                          {submissionFile && (
                            <div style={{
                              padding: '0.75rem',
                              background: 'rgba(59, 130, 246, 0.1)',
                              borderRadius: '8px',
                              marginBottom: '1rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              fontSize: '0.875rem',
                              color: 'var(--primary-400)'
                            }}>
                              <span>📄</span>
                              <span>{submissionFile.name}</span>
                            </div>
                          )}
                          <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button type="submit" className="btn btn-success" disabled={!submissionFile}>
                              📤 Pošalji zadatak
                            </button>
                            <button
                              type="button"
                              className="btn btn-secondary"
                              onClick={() => { setSelectedTask(null); setSubmissionFile(null); }}
                            >
                              Otkaži
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
