import React, { useEffect, useState } from 'react';
import api from './api';

export default function StudentDashboard({ user, activeView = 'dashboard' }) {
  const [tasks, setTasks] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [submissionFile, setSubmissionFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTasks();
    if (activeView === 'courses') {
      fetchCourses();
    }
  }, [activeView]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await api.get('/courses/enrolled');
      setCourses(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error('Error fetching courses:', e);
      setCourses([]);
    }
    setLoading(false);
  };

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await api.get('/tasks/my');
      // Osiguraj da je res.data niz
      setTasks(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error('Error fetching tasks:', e);
      setTasks([]);
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

  const downloadMaterial = async (courseId) => {
    try {
      const course = courses.find(c => c.id === courseId);
      const fileName = course?.material_name || `materijal_kurs_${courseId}.pdf`;
      
      const response = await api.get(`/courses/${courseId}/material/download`, {
        responseType: 'blob'
      });
      
      // Kreiraj download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Error downloading material:', e);
      alert('Greška pri preuzimanju materijala');
    }
  };

  const stats = {
    total: tasks.length,
    submitted: tasks.filter(t => t.submission != null).length,
    graded: tasks.filter(t => t.submission != null && t.submission.grade != null).length,
    pending: tasks.filter(t => t.submission == null).length
  };

  const avgGrade = () => {
    const gradedTasks = tasks.filter(t => t.submission != null && t.submission.grade != null);
    if (gradedTasks.length === 0) return '-';
    const sum = gradedTasks.reduce((acc, t) => acc + (t.submission?.grade || 0), 0);
    return (sum / gradedTasks.length).toFixed(1);
  };

  // Za 'dashboard' view - samo statistika
  if (activeView === 'dashboard') {
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

        {/* Quick Overview */}
        <div style={{
          background: 'var(--gray-900)',
          border: '1px solid var(--gray-800)',
          borderRadius: '16px',
          padding: '2rem',
          textAlign: 'center',
          marginTop: '1.5rem'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>📊</div>
          <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--gray-100)' }}>Pregled</h3>
          <p style={{ color: 'var(--gray-500)', margin: 0 }}>
            Izaberite "Moji zadaci" ili "Ocene" iz navigacije za detalje
          </p>
        </div>
      </div>
    );
  }

  // Za 'grades' view - samo ocene
  if (activeView === 'grades') {
    const gradedTasks = tasks.filter(t => t.submission != null && t.submission.grade != null);

    return (
      <div>
        {/* Stats Cards */}
        <div className="stat-cards">
          <div className="stat-card">
            <div className="stat-card-header">
              <div className="stat-card-icon green">✓</div>
            </div>
            <div className="stat-card-value">{stats.graded}</div>
            <div className="stat-card-label">Ocenjenih zadataka</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-header">
              <div className="stat-card-icon purple">📊</div>
            </div>
            <div className="stat-card-value">{avgGrade()}</div>
            <div className="stat-card-label">Prosek ocena</div>
          </div>
        </div>

        <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem', fontWeight: '600', color: 'var(--gray-50)' }}>
          Moje ocene
        </h3>

        <div style={{
          background: 'var(--gray-900)',
          border: '1px solid var(--gray-800)',
          borderRadius: '16px',
          overflow: 'hidden'
        }}>
          {gradedTasks.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--gray-500)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }}>📈</div>
              Nemate još ocenjenih zadataka
            </div>
          ) : (
            <div style={{ padding: '1rem' }}>
              <div style={{ display: 'grid', gap: '1rem' }}>
                {gradedTasks.map(task => (
                  <div key={task.id} style={{
                    background: 'var(--gray-800)',
                    borderRadius: '12px',
                    padding: '1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                  }}>
                    <div style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem',
                      fontWeight: '700',
                      color: 'white',
                      flexShrink: 0
                    }}>
                      {task.submission?.grade ?? '-'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <span style={{
                        display: 'inline-flex',
                        padding: '0.2rem 0.5rem',
                        fontSize: '0.625rem',
                        fontWeight: '500',
                        borderRadius: '100px',
                        background: 'rgba(59, 130, 246, 0.1)',
                        color: 'var(--primary-400)',
                        marginBottom: '0.5rem',
                        textTransform: 'uppercase'
                      }}>
                        {task.course_name || 'Kurs'}
                      </span>
                      <div style={{ fontWeight: '600', color: 'var(--gray-100)', marginBottom: '0.25rem' }}>
                        {task.title}
                      </div>
                      {task.submission?.feedback && (
                        <div style={{ fontSize: '0.875rem', color: 'var(--gray-400)' }}>
                          "{task.submission.feedback}"
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Za 'courses' view - prikaz kurseva sa materijalima
  if (activeView === 'courses') {
    return (
      <div>
        <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem', fontWeight: '600', color: 'var(--gray-50)' }}>
          Moji kursevi
        </h3>

        {loading ? (
          <div style={{
            background: 'var(--gray-900)',
            border: '1px solid var(--gray-800)',
            borderRadius: '16px',
            padding: '3rem',
            textAlign: 'center',
            color: 'var(--gray-400)'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
            Učitavanje kurseva...
          </div>
        ) : courses.length === 0 ? (
          <div style={{
            background: 'var(--gray-900)',
            border: '1px solid var(--gray-800)',
            borderRadius: '16px',
            padding: '4rem 2rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.3 }}>📚</div>
            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', fontWeight: '600', color: 'var(--gray-300)' }}>
              Niste upisani ni na jedan kurs
            </h4>
            <p style={{ color: 'var(--gray-500)', fontSize: '0.9375rem' }}>
              Sačekajte da vas profesor upiše na kurs
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {courses.map(course => {
              const courseTasks = tasks.filter(t => t.course_id === course.id);
              const completedTasks = courseTasks.filter(t => t.submission != null).length;
              
              return (
                <div key={course.id} style={{
                  background: 'var(--gray-900)',
                  border: '1px solid var(--gray-800)',
                  borderRadius: '16px',
                  overflow: 'hidden'
                }}>
                  {/* Course Header */}
                  <div style={{
                    padding: '1.5rem',
                    borderBottom: '1px solid var(--gray-800)',
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1))'
                  }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', fontWeight: '600', color: 'var(--gray-50)' }}>
                      📚 {course.name}
                    </h4>
                    <p style={{ margin: '0 0 0.75rem 0', color: 'var(--gray-400)', fontSize: '0.9375rem' }}>
                      {course.description}
                    </p>
                    {course.professor && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gray-500)', fontSize: '0.875rem' }}>
                        <span>👨‍🏫</span>
                        <span>{course.professor.first_name} {course.professor.last_name}</span>
                      </div>
                    )}
                  </div>

                  {/* Course Content */}
                  <div style={{ padding: '1.5rem' }}>
                    {/* Statistics */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, 1fr)',
                      gap: '1rem',
                      marginBottom: '1.5rem'
                    }}>
                      <div style={{
                        background: 'var(--gray-800)',
                        borderRadius: '12px',
                        padding: '1rem',
                        textAlign: 'center'
                      }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary-400)', marginBottom: '0.25rem' }}>
                          {courseTasks.length}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                          Ukupno zadataka
                        </div>
                      </div>
                      <div style={{
                        background: 'var(--gray-800)',
                        borderRadius: '12px',
                        padding: '1rem',
                        textAlign: 'center'
                      }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#10b981', marginBottom: '0.25rem' }}>
                          {completedTasks}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                          Predato
                        </div>
                      </div>
                    </div>

                    {/* Materials Section */}
                    <div style={{ marginBottom: '1.5rem' }}>
                      <h5 style={{ margin: '0 0 0.75rem 0', fontSize: '0.875rem', fontWeight: '600', color: 'var(--gray-300)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        📄 Materijali
                      </h5>
                      {course.material_path ? (
                        <div style={{
                          padding: '1rem',
                          background: 'var(--gray-800)',
                          borderRadius: '12px',
                          border: '1px solid var(--gray-700)'
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            marginBottom: '0.75rem'
                          }}>
                            <div style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '8px',
                              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '1.25rem',
                              flexShrink: 0
                            }}>
                              📕
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontWeight: '500', fontSize: '0.9375rem', color: 'var(--gray-200)', marginBottom: '0.125rem' }}>
                                {course.material_name || 'Materijal za kurs'}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                                PDF dokument
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => downloadMaterial(course.id)}
                            className="btn btn-primary"
                            style={{ width: '100%' }}
                          >
                            ⬇️ Preuzmi materijal
                          </button>
                        </div>
                      ) : (
                        <div style={{
                          padding: '1rem',
                          background: 'var(--gray-800)',
                          borderRadius: '12px',
                          textAlign: 'center',
                          color: 'var(--gray-500)',
                          fontSize: '0.875rem'
                        }}>
                          Nema dostupnih materijala
                        </div>
                      )}
                    </div>

                    {/* Tasks Preview */}
                    {courseTasks.length > 0 && (
                      <div>
                        <h5 style={{ margin: '0 0 0.75rem 0', fontSize: '0.875rem', fontWeight: '600', color: 'var(--gray-300)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          📝 Zadaci iz ovog kursa
                        </h5>
                        <div style={{ display: 'grid', gap: '0.75rem' }}>
                          {courseTasks.slice(0, 3).map(task => (
                            <div key={task.id} style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.75rem',
                              padding: '0.75rem',
                              background: 'var(--gray-800)',
                              borderRadius: '8px'
                            }}>
                              <div style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                background: task.submission ? '#10b981' : '#f59e0b',
                                flexShrink: 0
                              }} />
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--gray-200)' }}>
                                  {task.title}
                                </div>
                              </div>
                              <span style={{
                                fontSize: '0.75rem',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '6px',
                                background: task.submission ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                color: task.submission ? '#10b981' : '#f59e0b',
                                fontWeight: '500',
                                flexShrink: 0
                              }}>
                                {task.submission ? 'Predato' : 'Za predaju'}
                              </span>
                            </div>
                          ))}
                          {courseTasks.length > 3 && (
                            <div style={{
                              padding: '0.5rem',
                              textAlign: 'center',
                              color: 'var(--gray-500)',
                              fontSize: '0.8125rem'
                            }}>
                              +{courseTasks.length - 3} još zadataka
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Za 'tasks' view - pun prikaz zadataka
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
                const isSubmitted = task.submission != null;
                const isGraded = isSubmitted && task.submission?.grade != null;
                const deadline = task.deadline ? new Date(task.deadline) : new Date();
                const isValidDeadline = !isNaN(deadline.getTime());
                const isOverdue = isValidDeadline && deadline < new Date() && !isSubmitted;

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
                            {task.course_name || 'Nepoznat kurs'}
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
                            <span>Rok: {isValidDeadline ? deadline.toLocaleString('sr-RS') : 'Nije određen'}</span>
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
                              Predato: {task.submission?.submitted_at ? new Date(task.submission.submitted_at).toLocaleString('sr-RS') : 'N/A'}
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
                                  {task.submission?.grade ?? '-'}
                                </div>
                                <div>
                                  <div style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--gray-100)' }}>
                                    Ocena: {task.submission?.grade ?? '-'}/10
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
