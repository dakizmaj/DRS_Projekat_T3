import React, { useEffect, useState } from 'react';
import api from './api';

export default function ProfessorDashboard({ user, activeView = 'dashboard' }) {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', deadline: '' });
  const [showEnrollForm, setShowEnrollForm] = useState(false);
  const [allStudents, setAllStudents] = useState([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [showMaterialForm, setShowMaterialForm] = useState(false);
  const [materialFile, setMaterialFile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', description: '' });
  const [showNewCourseForm, setShowNewCourseForm] = useState(false);
  const [newCourseForm, setNewCourseForm] = useState({ name: '', description: '' });
  const [selectedTask, setSelectedTask] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [gradingSubmission, setGradingSubmission] = useState(null);
  const [gradeForm, setGradeForm] = useState({ grade: '', feedback: '' });

  useEffect(() => {
    fetchCourses();
  }, []);

  // Učitaj sve zadatke kada se promeni activeView na 'tasks'
  useEffect(() => {
    const fetchAllTasks = async () => {
      if (activeView === 'tasks' && courses.length > 0) {
        const allTasksTemp = [];
        for (const course of courses.filter(c => c.status === 'accepted')) {
          try {
            const res = await api.get(`/tasks/course/${course.id}`);
            const courseTasks = res.data.map(t => ({ ...t, courseName: course.name }));
            allTasksTemp.push(...courseTasks);
          } catch (e) {
            console.error(`Error fetching tasks for course ${course.id}:`, e);
          }
        }
        setTasks(allTasksTemp);
      }
    };
    fetchAllTasks();
  }, [activeView, courses]);

  const fetchCourses = async () => {
    try {
      const res = await api.get('/courses/my');
      setCourses(res.data);
    } catch (e) {
      console.error('Error fetching courses:', e);
    }
  };

  const selectCourse = async (course) => {
    setSelectedCourse(course);
    setLoading(true);
    try {
      const tasksRes = await api.get(`/tasks/course/${course.id}`);
      setTasks(tasksRes.data);

      if (course.status === 'accepted') {
        const studentsRes = await api.get(`/courses/${course.id}/students`);
        setStudents(studentsRes.data);
      }
    } catch (e) {
      console.error('Error fetching course details:', e);
    }
    setLoading(false);
  };

  const createTask = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tasks/', { ...taskForm, course_id: selectedCourse.id });
      setShowTaskForm(false);
      setTaskForm({ title: '', description: '', deadline: '' });
      const tasksRes = await api.get(`/tasks/course/${selectedCourse.id}`);
      setTasks(tasksRes.data);
    } catch (e) {
      alert('Greška pri kreiranju zadatka');
    }
  };

  const fetchAllStudents = async () => {
    try {
      const res = await api.get('/users/students');
      setAllStudents(res.data);
    } catch (e) {
      console.error('Error fetching students:', e);
    }
  };

  const enrollStudents = async () => {
    if (selectedStudentIds.length === 0) return;
    try {
      await api.post(`/courses/${selectedCourse.id}/enroll`, { student_ids: selectedStudentIds });
      setShowEnrollForm(false);
      setSelectedStudentIds([]);
      const studentsRes = await api.get(`/courses/${selectedCourse.id}/students`);
      setStudents(studentsRes.data);
    } catch (e) {
      alert('Greška pri dodavanju studenata');
    }
  };

  const toggleStudentSelection = (studentId) => {
    if (selectedStudentIds.includes(studentId)) {
      setSelectedStudentIds(selectedStudentIds.filter(id => id !== studentId));
    } else {
      setSelectedStudentIds([...selectedStudentIds, studentId]);
    }
  };

  const uploadMaterial = async (e) => {
    e.preventDefault();
    if (!materialFile) return;
    const formData = new FormData();
    formData.append('file', materialFile);
    try {
      await api.post(`/courses/${selectedCourse.id}/material`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setShowMaterialForm(false);
      setMaterialFile(null);
      fetchCourses();
      const res = await api.get('/courses/my');
      const updatedCourse = res.data.find(c => c.id === selectedCourse.id);
      if (updatedCourse) setSelectedCourse(updatedCourse);
    } catch (e) {
      alert('Greška pri upload-u materijala');
    }
  };

  const startEdit = () => {
    setEditMode(true);
    setEditForm({ name: selectedCourse.name, description: selectedCourse.description || '' });
  };

  const saveEdit = async () => {
    try {
      await api.put(`/courses/${selectedCourse.id}`, editForm);
      setEditMode(false);
      fetchCourses();
      setSelectedCourse({ ...selectedCourse, ...editForm });
    } catch (e) {
      alert('Greška pri ažuriranju kursa');
    }
  };

  const deleteCourse = async () => {
    if (!window.confirm(`Da li ste sigurni da želite obrisati kurs "${selectedCourse.name}"?`)) return;
    try {
      await api.delete(`/courses/${selectedCourse.id}`);
      setSelectedCourse(null);
      fetchCourses();
    } catch (e) {
      alert('Greška pri brisanju kursa');
    }
  };

  const createCourseRequest = async (e) => {
    e.preventDefault();
    try {
      await api.post('/courses/', newCourseForm);
      setShowNewCourseForm(false);
      setNewCourseForm({ name: '', description: '' });
      fetchCourses();
    } catch (e) {
      alert('Greška pri kreiranju zahteva za kurs');
    }
  };

  const viewTaskSubmissions = async (task) => {
    setSelectedTask(task);
    try {
      const res = await api.get(`/tasks/${task.id}/submissions`);
      setSubmissions(res.data);
    } catch (e) {
      alert('Greška pri učitavanju submissions');
    }
  };

  const handleGradeSubmission = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/tasks/submissions/${gradingSubmission.id}/grade`, gradeForm);
      setGradingSubmission(null);
      setGradeForm({ grade: '', feedback: '' });
      const res = await api.get(`/tasks/${selectedTask.id}/submissions`);
      setSubmissions(res.data);
    } catch (e) {
      alert('Greška pri ocenjivanju');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', text: '⏳ Na čekanju' },
      accepted: { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981', text: '✓ Aktivan' },
      rejected: { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', text: '✕ Odbijen' }
    };
    const s = styles[status] || styles.pending;
    return (
      <span style={{
        display: 'inline-flex',
        padding: '0.25rem 0.75rem',
        fontSize: '0.75rem',
        fontWeight: '500',
        borderRadius: '100px',
        background: s.bg,
        color: s.color
      }}>
        {s.text}
      </span>
    );
  };

  const stats = {
    total: courses.length,
    active: courses.filter(c => c.status === 'accepted').length,
    pending: courses.filter(c => c.status === 'pending').length,
    tasks: tasks.length
  };

  // Za 'dashboard' view - prikaži samo statistiku
  if (activeView === 'dashboard') {
    return (
      <div>
        {/* Stats Cards */}
        <div className="stat-cards">
          <div className="stat-card">
            <div className="stat-card-header">
              <div className="stat-card-icon blue">📚</div>
            </div>
            <div className="stat-card-value">{stats.total}</div>
            <div className="stat-card-label">Ukupno kurseva</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-header">
              <div className="stat-card-icon green">✓</div>
            </div>
            <div className="stat-card-value">{stats.active}</div>
            <div className="stat-card-label">Aktivnih kurseva</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-header">
              <div className="stat-card-icon orange">⏳</div>
            </div>
            <div className="stat-card-value">{stats.pending}</div>
            <div className="stat-card-label">Na čekanju</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-header">
              <div className="stat-card-icon purple">📝</div>
            </div>
            <div className="stat-card-value">{stats.tasks}</div>
            <div className="stat-card-label">Zadataka</div>
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
            Izaberite "Moji kursevi" ili "Zadaci" iz navigacije za upravljanje
          </p>
        </div>
      </div>
    );
  }

  // Za 'tasks' view - prikaži samo zadatke iz svih kurseva
  if (activeView === 'tasks') {
    // Grupiši zadatke po kursevima
    const tasksByCourse = courses.filter(c => c.status === 'accepted').map(course => ({
      course,
      tasks: tasks.filter(t => t.course_id === course.id)
    }));

    return (
      <div>
        {/* Stats Cards */}
        <div className="stat-cards">
          <div className="stat-card">
            <div className="stat-card-header">
              <div className="stat-card-icon purple">📝</div>
            </div>
            <div className="stat-card-value">{stats.tasks}</div>
            <div className="stat-card-label">Ukupno zadataka</div>
          </div>
        </div>

        <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem', fontWeight: '600', color: 'var(--gray-50)' }}>
          Svi zadaci
        </h3>

        <div style={{
          background: 'var(--gray-900)',
          border: '1px solid var(--gray-800)',
          borderRadius: '16px',
          overflow: 'hidden'
        }}>
          {courses.filter(c => c.status === 'accepted').length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--gray-500)' }}>
              Nemate aktivnih kurseva sa zadacima
            </div>
          ) : (
            <div style={{ padding: '1rem' }}>
              {courses.filter(c => c.status === 'accepted').map(course => (
                <div key={course.id} style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{
                    margin: '0 0 1rem 0',
                    padding: '0.75rem',
                    background: 'var(--gray-800)',
                    borderRadius: '8px',
                    color: 'var(--gray-100)',
                    fontSize: '1rem'
                  }}>
                    📚 {course.name}
                  </h4>
                  {tasks.filter(t => t.course_id === course.id).length === 0 ? (
                    <div style={{ padding: '1rem', color: 'var(--gray-500)', fontSize: '0.875rem' }}>
                      Nema zadataka za ovaj kurs
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gap: '0.75rem' }}>
                      {tasks.filter(t => t.course_id === course.id).map(task => (
                        <div key={task.id} style={{
                          background: 'var(--gray-800)',
                          borderRadius: '12px',
                          padding: '1rem'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: '500', color: 'var(--gray-100)', marginBottom: '0.25rem' }}>
                                {task.title}
                              </div>
                              <div style={{ fontSize: '0.8125rem', color: 'var(--gray-400)', marginBottom: '0.5rem' }}>
                                {task.description}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                                Rok: {new Date(task.deadline).toLocaleString('sr-RS')}
                              </div>
                            </div>
                            <button
                              onClick={() => { setSelectedCourse(course); viewTaskSubmissions(task); }}
                              className="btn btn-secondary btn-sm"
                            >
                              Predaje
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submissions Modal */}
        {selectedTask && (
          <div className="modal-overlay" onClick={() => { setSelectedTask(null); setSubmissions([]); }}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="modal-title">Predaje: {selectedTask.title}</h3>
                <button className="modal-close" onClick={() => { setSelectedTask(null); setSubmissions([]); }}>
                  ✕
                </button>
              </div>
              <div className="modal-body">
                {submissions.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-500)' }}>
                    Nema predaja za ovaj zadatak
                  </div>
                ) : (
                  <div style={{ display: 'grid', gap: '1rem' }}>
                    {submissions.map(sub => (
                      <div key={sub.id} style={{
                        background: 'var(--gray-800)',
                        borderRadius: '12px',
                        padding: '1rem'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                          <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '8px',
                            background: 'linear-gradient(135deg, var(--primary-500), var(--primary-700))',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            color: 'white'
                          }}>
                            {sub.student.first_name?.[0]}{sub.student.last_name?.[0]}
                          </div>
                          <div>
                            <div style={{ fontWeight: '500', color: 'var(--gray-100)' }}>
                              {sub.student.first_name} {sub.student.last_name}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                              Predato: {new Date(sub.submitted_at).toLocaleString('sr-RS')}
                            </div>
                          </div>
                        </div>

                        {/* Download link za .py fajl */}
                        <a
                          href={`http://127.0.0.1:5000/tasks/submissions/${sub.id}/download`}
                          download
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.5rem 0.75rem',
                            background: 'var(--gray-700)',
                            borderRadius: '8px',
                            color: 'var(--primary-400)',
                            textDecoration: 'none',
                            fontSize: '0.8125rem',
                            marginBottom: '0.75rem'
                          }}
                        >
                          📄 {sub.file_path?.split('/').pop() || sub.file_path?.split('\\').pop() || 'resenje.py'} - Preuzmi
                        </a>

                        {sub.grade !== null ? (
                          <div style={{ padding: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px' }}>
                            <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#10b981' }}>
                              Ocena: {sub.grade}
                            </div>
                            {sub.feedback && (
                              <div style={{ fontSize: '0.875rem', color: 'var(--gray-400)', marginTop: '0.5rem' }}>
                                {sub.feedback}
                              </div>
                            )}
                          </div>
                        ) : gradingSubmission?.id === sub.id ? (
                          <form onSubmit={handleGradeSubmission}>
                            <input type="number" placeholder="Ocena (1-10)" value={gradeForm.grade}
                              onChange={e => setGradeForm({ ...gradeForm, grade: e.target.value })}
                              required min="1" max="10" style={{ marginBottom: '0.5rem' }} />
                            <textarea placeholder="Komentar (opciono)" value={gradeForm.feedback}
                              onChange={e => setGradeForm({ ...gradeForm, feedback: e.target.value })}
                              style={{ marginBottom: '0.5rem', minHeight: '60px' }} />
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button type="submit" className="btn btn-success btn-sm">Sačuvaj</button>
                              <button type="button" className="btn btn-secondary btn-sm"
                                onClick={() => { setGradingSubmission(null); setGradeForm({ grade: '', feedback: '' }); }}>
                                Otkaži
                              </button>
                            </div>
                          </form>
                        ) : (
                          <button onClick={() => setGradingSubmission(sub)} className="btn btn-primary btn-sm">Oceni</button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Za 'courses' view - prikaži pun prikaz kurseva
  return (
    <div>
      {/* Stats Cards */}
      <div className="stat-cards">
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon blue">📚</div>
          </div>
          <div className="stat-card-value">{stats.total}</div>
          <div className="stat-card-label">Ukupno kurseva</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon green">✓</div>
          </div>
          <div className="stat-card-value">{stats.active}</div>
          <div className="stat-card-label">Aktivnih kurseva</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon orange">⏳</div>
          </div>
          <div className="stat-card-value">{stats.pending}</div>
          <div className="stat-card-label">Na čekanju</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon purple">📝</div>
          </div>
          <div className="stat-card-value">{stats.tasks}</div>
          <div className="stat-card-label">Zadataka</div>
        </div>
      </div>

      {/* Header with New Course Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600', color: 'var(--gray-50)' }}>
          Moji kursevi
        </h3>
        <button
          onClick={() => setShowNewCourseForm(!showNewCourseForm)}
          className="btn btn-primary"
        >
          {showNewCourseForm ? '✕ Zatvori' : '+ Novi kurs'}
        </button>
      </div>

      {/* New Course Form */}
      {showNewCourseForm && (
        <div style={{
          background: 'var(--gray-900)',
          border: '1px solid var(--gray-800)',
          borderRadius: '16px',
          padding: '1.5rem',
          marginBottom: '1.5rem'
        }}>
          <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: '600', color: 'var(--gray-100)' }}>
            Kreiraj zahtev za novi kurs
          </h4>
          <form onSubmit={createCourseRequest}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--gray-300)' }}>
                Naziv kursa
              </label>
              <input
                placeholder="Unesite naziv kursa"
                value={newCourseForm.name}
                onChange={e => setNewCourseForm({ ...newCourseForm, name: e.target.value })}
                required
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--gray-300)' }}>
                Opis kursa
              </label>
              <textarea
                placeholder="Opišite sadržaj kursa..."
                value={newCourseForm.description}
                onChange={e => setNewCourseForm({ ...newCourseForm, description: e.target.value })}
                required
                style={{ minHeight: '100px' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="submit" className="btn btn-primary">Pošalji zahtev</button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowNewCourseForm(false)}>
                Otkaži
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Content - Two Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1.5rem' }}>
        {/* Courses List */}
        <div style={{
          background: 'var(--gray-900)',
          border: '1px solid var(--gray-800)',
          borderRadius: '16px',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '1rem 1.25rem',
            borderBottom: '1px solid var(--gray-800)',
            fontSize: '0.875rem',
            fontWeight: '600',
            color: 'var(--gray-300)'
          }}>
            Lista kurseva ({courses.length})
          </div>
          <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
            {courses.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--gray-500)' }}>
                Nemate kreirane kurseve
              </div>
            ) : (
              courses.map(course => (
                <div
                  key={course.id}
                  onClick={() => selectCourse(course)}
                  style={{
                    padding: '1rem 1.25rem',
                    borderBottom: '1px solid var(--gray-800)',
                    cursor: 'pointer',
                    background: selectedCourse?.id === course.id ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                    borderLeft: selectedCourse?.id === course.id ? '3px solid var(--primary-500)' : '3px solid transparent',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ fontWeight: '500', color: 'var(--gray-100)', marginBottom: '0.5rem' }}>
                    {course.name}
                  </div>
                  {getStatusBadge(course.status)}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Course Details */}
        {selectedCourse ? (
          <div style={{
            background: 'var(--gray-900)',
            border: '1px solid var(--gray-800)',
            borderRadius: '16px',
            overflow: 'hidden'
          }}>
            {/* Course Header */}
            <div style={{
              padding: '1.5rem',
              borderBottom: '1px solid var(--gray-800)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              {editMode ? (
                <div style={{ flex: 1 }}>
                  <input
                    value={editForm.name}
                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                    style={{ marginBottom: '0.75rem', fontSize: '1.125rem', fontWeight: '600' }}
                  />
                  <textarea
                    value={editForm.description}
                    onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                    style={{ minHeight: '60px' }}
                  />
                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                    <button onClick={saveEdit} className="btn btn-success btn-sm">Sačuvaj</button>
                    <button onClick={() => setEditMode(false)} className="btn btn-secondary btn-sm">Otkaži</button>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', fontWeight: '600', color: 'var(--gray-50)' }}>
                      {selectedCourse.name}
                    </h3>
                    {getStatusBadge(selectedCourse.status)}
                  </div>
                  {selectedCourse.status === 'accepted' && (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={startEdit} className="btn btn-secondary btn-sm">✏️ Izmeni</button>
                      <button onClick={deleteCourse} className="btn btn-danger btn-sm">🗑️ Obriši</button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Course Content */}
            <div style={{ padding: '1.5rem' }}>
              {selectedCourse.status === 'pending' && (
                <div style={{
                  padding: '1rem',
                  background: 'rgba(245, 158, 11, 0.1)',
                  border: '1px solid rgba(245, 158, 11, 0.2)',
                  borderRadius: '12px',
                  color: '#f59e0b',
                  textAlign: 'center'
                }}>
                  ⏳ Kurs čeka odobrenje administratora
                </div>
              )}

              {selectedCourse.status === 'rejected' && (
                <div style={{
                  padding: '1rem',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: '12px',
                  color: '#ef4444',
                  textAlign: 'center'
                }}>
                  ❌ Kurs je odbijen od strane administratora
                </div>
              )}

              {selectedCourse.status === 'accepted' && !editMode && (
                <>
                  {/* Students Section */}
                  <div style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '600', color: 'var(--gray-100)' }}>
                        👥 Studenti ({students.length})
                      </h4>
                      <button
                        onClick={() => { setShowEnrollForm(!showEnrollForm); if (!showEnrollForm) fetchAllStudents(); }}
                        className="btn btn-secondary btn-sm"
                      >
                        {showEnrollForm ? 'Zatvori' : '+ Dodaj studente'}
                      </button>
                    </div>

                    {showEnrollForm && (
                      <div style={{
                        background: 'var(--gray-800)',
                        borderRadius: '12px',
                        padding: '1rem',
                        marginBottom: '1rem',
                        maxHeight: '200px',
                        overflowY: 'auto'
                      }}>
                        {allStudents.map(student => {
                          const isEnrolled = students.some(s => s.id === student.id);
                          const isSelected = selectedStudentIds.includes(student.id);
                          return (
                            <label
                              key={student.id}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '0.5rem',
                                cursor: isEnrolled ? 'not-allowed' : 'pointer',
                                opacity: isEnrolled ? 0.5 : 1,
                                borderRadius: '8px',
                                background: isSelected ? 'rgba(59, 130, 246, 0.1)' : 'transparent'
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => !isEnrolled && toggleStudentSelection(student.id)}
                                disabled={isEnrolled}
                                style={{ marginRight: '0.75rem' }}
                              />
                              <span style={{ color: 'var(--gray-200)' }}>
                                {student.first_name} {student.last_name}
                              </span>
                              <span style={{ marginLeft: '0.5rem', color: 'var(--gray-500)', fontSize: '0.8125rem' }}>
                                ({student.email})
                              </span>
                              {isEnrolled && (
                                <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#10b981' }}>✓ Upisan</span>
                              )}
                            </label>
                          );
                        })}
                        <button
                          onClick={enrollStudents}
                          disabled={selectedStudentIds.length === 0}
                          className="btn btn-primary btn-sm"
                          style={{ marginTop: '0.75rem' }}
                        >
                          Dodaj izabrane ({selectedStudentIds.length})
                        </button>
                      </div>
                    )}

                    <div style={{ display: 'grid', gap: '0.5rem' }}>
                      {students.map(s => (
                        <div key={s.id} style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          padding: '0.75rem',
                          background: 'var(--gray-800)',
                          borderRadius: '8px'
                        }}>
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            color: 'white'
                          }}>
                            {s.first_name?.[0]}{s.last_name?.[0]}
                          </div>
                          <div>
                            <div style={{ fontWeight: '500', color: 'var(--gray-100)', fontSize: '0.875rem' }}>
                              {s.first_name} {s.last_name}
                            </div>
                            <div style={{ color: 'var(--gray-500)', fontSize: '0.75rem' }}>{s.email}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Materials Section */}
                  <div style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '600', color: 'var(--gray-100)' }}>
                        📄 Materijali
                      </h4>
                      <button
                        onClick={() => setShowMaterialForm(!showMaterialForm)}
                        className="btn btn-secondary btn-sm"
                      >
                        {showMaterialForm ? 'Zatvori' : '+ Dodaj materijal'}
                      </button>
                    </div>

                    {showMaterialForm && (
                      <form onSubmit={uploadMaterial} style={{
                        background: 'var(--gray-800)',
                        borderRadius: '12px',
                        padding: '1rem',
                        marginBottom: '1rem'
                      }}>
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={e => setMaterialFile(e.target.files[0])}
                          required
                          style={{ marginBottom: '0.75rem' }}
                        />
                        <button type="submit" className="btn btn-primary btn-sm">Upload PDF</button>
                      </form>
                    )}

                    {selectedCourse.material_path && (
                      <a
                        href={`http://127.0.0.1:5000/courses/${selectedCourse.id}/material/download`}
                        download
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.75rem 1rem',
                          background: 'var(--gray-800)',
                          borderRadius: '8px',
                          color: 'var(--primary-400)',
                          textDecoration: 'none',
                          fontSize: '0.875rem'
                        }}
                      >
                        📄 {selectedCourse.material_path.split('/').pop()} - Preuzmi
                      </a>
                    )}
                  </div>

                  {/* Tasks Section */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '600', color: 'var(--gray-100)' }}>
                        📝 Zadaci ({tasks.length})
                      </h4>
                      <button
                        onClick={() => setShowTaskForm(!showTaskForm)}
                        className="btn btn-primary btn-sm"
                      >
                        {showTaskForm ? 'Zatvori' : '+ Novi zadatak'}
                      </button>
                    </div>

                    {showTaskForm && (
                      <form onSubmit={createTask} style={{
                        background: 'var(--gray-800)',
                        borderRadius: '12px',
                        padding: '1rem',
                        marginBottom: '1rem'
                      }}>
                        <input
                          placeholder="Naziv zadatka"
                          value={taskForm.title}
                          onChange={e => setTaskForm({ ...taskForm, title: e.target.value })}
                          required
                          style={{ marginBottom: '0.75rem' }}
                        />
                        <textarea
                          placeholder="Opis zadatka"
                          value={taskForm.description}
                          onChange={e => setTaskForm({ ...taskForm, description: e.target.value })}
                          required
                          style={{ marginBottom: '0.75rem', minHeight: '80px' }}
                        />
                        <input
                          type="datetime-local"
                          value={taskForm.deadline}
                          onChange={e => setTaskForm({ ...taskForm, deadline: e.target.value })}
                          required
                          style={{ marginBottom: '0.75rem' }}
                        />
                        <button type="submit" className="btn btn-primary btn-sm">Kreiraj zadatak</button>
                      </form>
                    )}

                    <div style={{ display: 'grid', gap: '0.75rem' }}>
                      {tasks.map(task => (
                        <div key={task.id} style={{
                          background: 'var(--gray-800)',
                          borderRadius: '12px',
                          padding: '1rem'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: '500', color: 'var(--gray-100)', marginBottom: '0.25rem' }}>
                                {task.title}
                              </div>
                              <div style={{ fontSize: '0.8125rem', color: 'var(--gray-400)', marginBottom: '0.5rem' }}>
                                {task.description}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                                Rok: {new Date(task.deadline).toLocaleString('sr-RS')}
                              </div>
                            </div>
                            <button
                              onClick={() => viewTaskSubmissions(task)}
                              className="btn btn-secondary btn-sm"
                            >
                              Predaje
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          <div style={{
            background: 'var(--gray-900)',
            border: '1px solid var(--gray-800)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px'
          }}>
            <div style={{ textAlign: 'center', color: 'var(--gray-500)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }}>📚</div>
              <div>Izaberite kurs sa leve strane</div>
            </div>
          </div>
        )}
      </div>

      {/* Submissions Modal */}
      {selectedTask && (
        <div className="modal-overlay" onClick={() => { setSelectedTask(null); setSubmissions([]); }}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Predaje: {selectedTask.title}</h3>
              <button className="modal-close" onClick={() => { setSelectedTask(null); setSubmissions([]); }}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              {submissions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-500)' }}>
                  Nema predaja za ovaj zadatak
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {submissions.map(sub => (
                    <div key={sub.id} style={{
                      background: 'var(--gray-800)',
                      borderRadius: '12px',
                      padding: '1rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '8px',
                          background: 'linear-gradient(135deg, var(--primary-500), var(--primary-700))',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          color: 'white'
                        }}>
                          {sub.student.first_name?.[0]}{sub.student.last_name?.[0]}
                        </div>
                        <div>
                          <div style={{ fontWeight: '500', color: 'var(--gray-100)' }}>
                            {sub.student.first_name} {sub.student.last_name}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                            Predato: {new Date(sub.submitted_at).toLocaleString('sr-RS')}
                          </div>
                        </div>
                      </div>

                      {/* Download link za .py fajl */}
                      <a
                        href={`http://127.0.0.1:5000/tasks/submissions/${sub.id}/download`}
                        download
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.5rem 0.75rem',
                          background: 'var(--gray-700)',
                          borderRadius: '8px',
                          color: 'var(--primary-400)',
                          textDecoration: 'none',
                          fontSize: '0.8125rem',
                          marginBottom: '0.75rem'
                        }}
                      >
                        📄 {sub.file_path?.split('/').pop() || sub.file_path?.split('\\').pop() || 'resenje.py'} - Preuzmi
                      </a>

                      {sub.grade !== null ? (
                        <div style={{
                          padding: '0.75rem',
                          background: 'rgba(16, 185, 129, 0.1)',
                          borderRadius: '8px'
                        }}>
                          <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#10b981' }}>
                            Ocena: {sub.grade}
                          </div>
                          {sub.feedback && (
                            <div style={{ fontSize: '0.875rem', color: 'var(--gray-400)', marginTop: '0.5rem' }}>
                              {sub.feedback}
                            </div>
                          )}
                        </div>
                      ) : gradingSubmission?.id === sub.id ? (
                        <form onSubmit={handleGradeSubmission}>
                          <input
                            type="number"
                            placeholder="Ocena (1-10)"
                            value={gradeForm.grade}
                            onChange={e => setGradeForm({ ...gradeForm, grade: e.target.value })}
                            required
                            min="1"
                            max="10"
                            style={{ marginBottom: '0.5rem' }}
                          />
                          <textarea
                            placeholder="Komentar (opciono)"
                            value={gradeForm.feedback}
                            onChange={e => setGradeForm({ ...gradeForm, feedback: e.target.value })}
                            style={{ marginBottom: '0.5rem', minHeight: '60px' }}
                          />
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button type="submit" className="btn btn-success btn-sm">Sačuvaj</button>
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={() => { setGradingSubmission(null); setGradeForm({ grade: '', feedback: '' }); }}
                            >
                              Otkaži
                            </button>
                          </div>
                        </form>
                      ) : (
                        <button onClick={() => setGradingSubmission(sub)} className="btn btn-primary btn-sm">
                          Oceni
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
