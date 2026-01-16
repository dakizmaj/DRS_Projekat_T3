import React, { useEffect, useState } from 'react';
import api from './api';

export default function ProfessorDashboard({ user }) {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  // Forma za novi zadatak
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    deadline: ''
  });

  useEffect(() => {
    fetchCourses();
  }, []);

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
      // Učitaj zadatke za kurs
      const tasksRes = await api.get(`/tasks/course/${course.id}`);
      setTasks(tasksRes.data);

      // Ako je kurs accepted, učitaj studente
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
      await api.post('/tasks/', {
        ...taskForm,
        course_id: selectedCourse.id
      });
      alert('Zadatak kreiran!');
      setShowTaskForm(false);
      setTaskForm({ title: '', description: '', deadline: '' });
      // Refresh tasks
      const tasksRes = await api.get(`/tasks/course/${selectedCourse.id}`);
      setTasks(tasksRes.data);
    } catch (e) {
      alert('Greška pri kreiranju zadatka');
    }
  };

  return (
    <div style={{ padding: 20, color: 'white' }}>
      <h2>Moji Kursevi</h2>
      
      <div style={{ display: 'flex', gap: 20 }}>
        {/* Lista kurseva */}
        <div style={{ flex: 1, background: '#222', padding: 16, borderRadius: 8 }}>
          <h3>Kursevi</h3>
          {courses.map(course => (
            <div
              key={course.id}
              onClick={() => selectCourse(course)}
              style={{
                padding: 10,
                margin: '8px 0',
                background: selectedCourse?.id === course.id ? '#444' : '#333',
                cursor: 'pointer',
                borderRadius: 4
              }}
            >
              <div><strong>{course.name}</strong></div>
              <div style={{ fontSize: 12, color: '#aaa' }}>
                Status: {course.status === 'pending' ? '⏳ U obradi' : 
                         course.status === 'accepted' ? '✅ Prihvaćen' : 
                         '❌ Odbijen'}
              </div>
            </div>
          ))}
        </div>

        {/* Detalji kursa */}
        {selectedCourse && (
          <div style={{ flex: 2, background: '#222', padding: 16, borderRadius: 8 }}>
            <h3>{selectedCourse.name}</h3>
            
            {selectedCourse.status === 'accepted' && (
              <>
                {/* Studenti */}
                <div style={{ marginBottom: 20 }}>
                  <h4>Studenti ({students.length})</h4>
                  {students.map(s => (
                    <div key={s.id} style={{ padding: 4 }}>
                      {s.first_name} {s.last_name} ({s.email})
                    </div>
                  ))}
                </div>

                {/* Zadaci */}
                <div>
                  <h4>Zadaci</h4>
                  <button 
                    onClick={() => setShowTaskForm(!showTaskForm)}
                    style={{ marginBottom: 10, padding: '8px 16px', background: '#28a745', border: 'none', color: 'white', borderRadius: 4, cursor: 'pointer' }}
                  >
                    {showTaskForm ? 'Otkaži' : '+ Novi zadatak'}
                  </button>

                  {showTaskForm && (
                    <form onSubmit={createTask} style={{ marginBottom: 20, background: '#333', padding: 16, borderRadius: 8 }}>
                      <input
                        placeholder="Naziv zadatka"
                        value={taskForm.title}
                        onChange={e => setTaskForm({...taskForm, title: e.target.value})}
                        required
                        style={{ width: '100%', padding: 8, marginBottom: 8 }}
                      />
                      <textarea
                        placeholder="Opis zadatka"
                        value={taskForm.description}
                        onChange={e => setTaskForm({...taskForm, description: e.target.value})}
                        required
                        style={{ width: '100%', padding: 8, marginBottom: 8, minHeight: 80 }}
                      />
                      <input
                        type="datetime-local"
                        value={taskForm.deadline}
                        onChange={e => setTaskForm({...taskForm, deadline: e.target.value})}
                        required
                        style={{ width: '100%', padding: 8, marginBottom: 8 }}
                      />
                      <button type="submit" style={{ padding: '8px 16px', background: '#007bff', border: 'none', color: 'white', borderRadius: 4, cursor: 'pointer' }}>
                        Kreiraj zadatak
                      </button>
                    </form>
                  )}

                  {tasks.map(task => (
                    <div key={task.id} style={{ background: '#333', padding: 12, marginBottom: 8, borderRadius: 4 }}>
                      <div><strong>{task.title}</strong></div>
                      <div style={{ fontSize: 12, color: '#aaa' }}>{task.description}</div>
                      <div style={{ fontSize: 12, color: '#aaa' }}>Rok: {new Date(task.deadline).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {selectedCourse.status === 'pending' && (
              <div style={{ color: '#ffc107' }}>⏳ Kurs čeka odobrenje administratora</div>
            )}

            {selectedCourse.status === 'rejected' && (
              <div style={{ color: '#dc3545' }}>❌ Kurs je odbijen</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
