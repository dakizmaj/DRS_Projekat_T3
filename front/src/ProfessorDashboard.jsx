import React, { useEffect, useState } from 'react';
import api from './api';

export default function ProfessorDashboard({ user }) {
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
      alert('Zadatak kreiran!');
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
    if (selectedStudentIds.length === 0) {
      alert('Izaberite bar jednog studenta');
      return;
    }
    try {
      await api.post(`/courses/${selectedCourse.id}/enroll`, { student_ids: selectedStudentIds });
      alert('Studenti dodati!');
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
    if (!materialFile) {
      alert('Izaberite PDF fajl');
      return;
    }
    const formData = new FormData();
    formData.append('file', materialFile);
    try {
      await api.post(`/courses/${selectedCourse.id}/material`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Materijal okačen!');
      setShowMaterialForm(false);
      setMaterialFile(null);
      // Refresh course data
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
      alert('Kurs ažuriran!');
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
      alert('Kurs obrisan!');
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
      alert('Zahtev za kurs poslat! Čeka odobrenje administratora.');
      setShowNewCourseForm(false);
      setNewCourseForm({ name: '', description: '' });
      fetchCourses();
    } catch (e) {
      alert('Greška pri kreiranju zahteva za kurs');
    }
  };

  return (
    <div style={{ padding: 20, color: 'white' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2>Moji Kursevi</h2>
        <button 
          onClick={() => setShowNewCourseForm(!showNewCourseForm)}
          style={{ padding: '10px 20px', background: '#28a745', border: 'none', color: 'white', borderRadius: 4, cursor: 'pointer', fontSize: 14 }}
        >
          {showNewCourseForm ? 'Otkaži' : '+ Novi zahtev za kurs'}
        </button>
      </div>

      {showNewCourseForm && (
        <div style={{ background: '#222', padding: 20, borderRadius: 8, marginBottom: 20 }}>
          <h3>Kreiraj novi kurs</h3>
          <form onSubmit={createCourseRequest}>
            <input
              placeholder="Naziv kursa"
              value={newCourseForm.name}
              onChange={e => setNewCourseForm({...newCourseForm, name: e.target.value})}
              required
              style={{ width: '100%', padding: 10, marginBottom: 10 }}
            />
            <textarea
              placeholder="Opis kursa"
              value={newCourseForm.description}
              onChange={e => setNewCourseForm({...newCourseForm, description: e.target.value})}
              required
              style={{ width: '100%', padding: 10, marginBottom: 10, minHeight: 80 }}
            />
            <button type="submit" style={{ padding: '10px 20px', background: '#007bff', border: 'none', color: 'white', borderRadius: 4, cursor: 'pointer' }}>
              Pošalji zahtev
            </button>
          </form>
        </div>
      )}
      
      <div style={{ display: 'flex', gap: 20 }}>
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

        {selectedCourse && (
          <div style={{ flex: 2, background: '#222', padding: 16, borderRadius: 8 }}>
            {editMode ? (
              <div style={{ marginBottom: 20 }}>
                <h3>Izmeni kurs</h3>
                <input
                  placeholder="Naziv kursa"
                  value={editForm.name}
                  onChange={e => setEditForm({...editForm, name: e.target.value})}
                  style={{ width: '100%', padding: 8, marginBottom: 8 }}
                />
                <textarea
                  placeholder="Opis kursa"
                  value={editForm.description}
                  onChange={e => setEditForm({...editForm, description: e.target.value})}
                  style={{ width: '100%', padding: 8, marginBottom: 8, minHeight: 60 }}
                />
                <button onClick={saveEdit} style={{ padding: '8px 16px', background: '#28a745', border: 'none', color: 'white', borderRadius: 4, cursor: 'pointer', marginRight: 8 }}>
                  💾 Sačuvaj
                </button>
                <button onClick={() => setEditMode(false)} style={{ padding: '8px 16px', background: '#6c757d', border: 'none', color: 'white', borderRadius: 4, cursor: 'pointer' }}>
                  Otkaži
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3>{selectedCourse.name}</h3>
                {selectedCourse.status === 'accepted' && (
                  <div>
                    <button onClick={startEdit} style={{ padding: '6px 12px', background: '#ffc107', border: 'none', color: 'black', borderRadius: 4, cursor: 'pointer', marginRight: 8, fontSize: 12 }}>
                      ✏️ Izmeni
                    </button>
                    <button onClick={deleteCourse} style={{ padding: '6px 12px', background: '#dc3545', border: 'none', color: 'white', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>
                      🗑️ Obriši
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {selectedCourse.status === 'accepted' && !editMode && (
              <>
                <div style={{ marginBottom: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4>Studenti ({students.length})</h4>
                    <button 
                      onClick={() => {
                        setShowEnrollForm(!showEnrollForm);
                        if (!showEnrollForm) fetchAllStudents();
                      }}
                      style={{ padding: '6px 12px', background: '#17a2b8', border: 'none', color: 'white', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}
                    >
                      {showEnrollForm ? 'Otkaži' : '+ Dodaj studente'}
                    </button>
                  </div>

                  {showEnrollForm && (
                    <div style={{ marginTop: 10, background: '#333', padding: 12, borderRadius: 8, maxHeight: 200, overflowY: 'auto' }}>
                      <h5>Izaberi studente:</h5>
                      {allStudents.map(student => {
                        const isEnrolled = students.some(s => s.id === student.id);
                        const isSelected = selectedStudentIds.includes(student.id);
                        return (
                          <div key={student.id} style={{ padding: 4, opacity: isEnrolled ? 0.5 : 1 }}>
                            <label style={{ display: 'flex', alignItems: 'center', cursor: isEnrolled ? 'not-allowed' : 'pointer' }}>
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => !isEnrolled && toggleStudentSelection(student.id)}
                                disabled={isEnrolled}
                                style={{ marginRight: 8 }}
                              />
                              {student.first_name} {student.last_name} ({student.email})
                              {isEnrolled && <span style={{ marginLeft: 8, fontSize: 10, color: '#28a745' }}>✓ Već upisan</span>}
                            </label>
                          </div>
                        );
                      })}
                      <button 
                        onClick={enrollStudents}
                        disabled={selectedStudentIds.length === 0}
                        style={{ marginTop: 10, padding: '8px 16px', background: selectedStudentIds.length > 0 ? '#28a745' : '#555', border: 'none', color: 'white', borderRadius: 4, cursor: selectedStudentIds.length > 0 ? 'pointer' : 'not-allowed' }}
                      >
                        Dodaj ({selectedStudentIds.length})
                      </button>
                    </div>
                  )}

                  <div style={{ marginTop: 10 }}>
                    {students.map(s => (
                      <div key={s.id} style={{ padding: 4 }}>
                        {s.first_name} {s.last_name} ({s.email})
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: 20 }}>
                  <h4>Materijali</h4>
                  <button 
                    onClick={() => setShowMaterialForm(!showMaterialForm)}
                    style={{ marginBottom: 10, padding: '8px 16px', background: '#6f42c1', border: 'none', color: 'white', borderRadius: 4, cursor: 'pointer' }}
                  >
                    {showMaterialForm ? 'Otkaži' : '📄 Okači materijal (PDF)'}
                  </button>

                  {showMaterialForm && (
                    <form onSubmit={uploadMaterial} style={{ marginBottom: 20, background: '#333', padding: 16, borderRadius: 8 }}>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={e => setMaterialFile(e.target.files[0])}
                        required
                        style={{ marginBottom: 8, color: 'white' }}
                      />
                      <button type="submit" style={{ padding: '8px 16px', background: '#007bff', border: 'none', color: 'white', borderRadius: 4, cursor: 'pointer' }}>
                        Upload PDF
                      </button>
                    </form>
                  )}

                  {selectedCourse.material_path && (
                    <a 
                      href={`http://127.0.0.1:5000/courses/${selectedCourse.id}/material/download`}
                      download
                      style={{ 
                        display: 'inline-block',
                        padding: 8, 
                        background: '#333', 
                        borderRadius: 4,
                        color: '#4fc3f7',
                        textDecoration: 'none'
                      }}
                    >
                      📄 {selectedCourse.material_path.split('/').pop()} - Preuzmi
                    </a>
                  )}
                </div>

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
