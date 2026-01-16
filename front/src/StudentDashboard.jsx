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
    if (!submissionFile) {
      alert('Izaberite .py fajl');
      return;
    }

    const formData = new FormData();
    formData.append('file', submissionFile);

    try {
      await api.post(`/tasks/${selectedTask.id}/submit`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Zadatak predat!');
      setSubmissionFile(null);
      setSelectedTask(null);
      fetchTasks();
    } catch (e) {
      alert('Greška pri predaji zadatka');
    }
  };

  return (
    <div style={{ padding: 20, color: 'white' }}>
      <h2>Moji Zadaci</h2>

      {loading ? (
        <p>Učitavanje...</p>
      ) : tasks.length === 0 ? (
        <p style={{ color: '#aaa' }}>Nemate dodeljenih zadataka</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {tasks.map(task => {
            const isSubmitted = task.submission !== null;
            const isGraded = isSubmitted && task.submission.grade !== null;
            const deadline = new Date(task.deadline);
            const isOverdue = deadline < new Date() && !isSubmitted;

            return (
              <div
                key={task.id}
                style={{
                  background: '#222',
                  padding: 16,
                  borderRadius: 8,
                  border: isOverdue ? '2px solid #dc3545' : isGraded ? '2px solid #28a745' : '2px solid #333'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: 0 }}>{task.title}</h3>
                    <p style={{ color: '#aaa', fontSize: 12, margin: '4px 0' }}>
                      Kurs: {task.course_name}
                    </p>
                    <p style={{ color: '#aaa', fontSize: 14, marginTop: 8 }}>{task.description}</p>
                    <p style={{ 
                      fontSize: 12, 
                      color: isOverdue ? '#dc3545' : '#ffc107',
                      marginTop: 8
                    }}>
                      Rok: {deadline.toLocaleString()}
                      {isOverdue && ' (PREKORAČEN)'}
                    </p>

                    {isSubmitted && (
                      <div style={{ marginTop: 12, padding: 12, background: '#333', borderRadius: 4 }}>
                        <p style={{ margin: 0, fontSize: 12, color: '#28a745' }}>
                          ✓ Predato: {new Date(task.submission.submitted_at).toLocaleString()}
                        </p>
                        {isGraded ? (
                          <>
                            <p style={{ margin: '8px 0 0 0', fontSize: 16, fontWeight: 'bold', color: '#28a745' }}>
                              Ocena: {task.submission.grade}
                            </p>
                            {task.submission.feedback && (
                              <p style={{ margin: '4px 0 0 0', fontSize: 14, color: '#aaa' }}>
                                Komentar: {task.submission.feedback}
                              </p>
                            )}
                          </>
                        ) : (
                          <p style={{ margin: '8px 0 0 0', fontSize: 12, color: '#ffc107' }}>
                            ⏳ Čeka ocenu...
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    {!isSubmitted && (
                      <button
                        onClick={() => setSelectedTask(selectedTask?.id === task.id ? null : task)}
                        style={{
                          padding: '8px 16px',
                          background: selectedTask?.id === task.id ? '#6c757d' : '#007bff',
                          border: 'none',
                          color: 'white',
                          borderRadius: 4,
                          cursor: 'pointer'
                        }}
                      >
                        {selectedTask?.id === task.id ? 'Otkaži' : 'Predaj'}
                      </button>
                    )}
                  </div>
                </div>

                {selectedTask?.id === task.id && (
                  <form onSubmit={submitTask} style={{ marginTop: 16, padding: 12, background: '#333', borderRadius: 8 }}>
                    <h4 style={{ marginTop: 0 }}>Upload .py fajla</h4>
                    <input
                      type="file"
                      accept=".py"
                      onChange={e => setSubmissionFile(e.target.files[0])}
                      required
                      style={{ marginBottom: 8, color: 'white' }}
                    />
                    <button
                      type="submit"
                      style={{
                        padding: '8px 16px',
                        background: '#28a745',
                        border: 'none',
                        color: 'white',
                        borderRadius: 4,
                        cursor: 'pointer'
                      }}
                    >
                      Pošalji zadatak
                    </button>
                  </form>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
