import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import StudentForm from './components/StudentForm';
import StudentList from './components/StudentList';
import { fetchStudents, createStudent, updateStudent, deleteStudent } from './services/api';

export default function App() {
  const [students, setStudents] = useState([]);
  const [currentStudent, setCurrentStudent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [backendErrors, setBackendErrors] = useState([]);
  const [notification, setNotification] = useState(null);
  const [isConnected, setIsConnected] = useState(true);

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const loadStudents = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchStudents();
      setStudents(data);
      setIsConnected(true);
    } catch (err) {
      setError(err.message || 'Unable to load data. Please try again.');
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const handleFormSubmit = async (formData) => {
    setIsSubmitting(true);
    setBackendErrors([]);
    try {
      if (currentStudent) {
        await updateStudent(currentStudent.id || currentStudent._id, formData);
        showNotification(`Student '${formData.name}' updated successfully!`, 'success');
        setCurrentStudent(null);
      } else {
        await createStudent(formData);
        showNotification(`Student '${formData.name}' created successfully!`, 'success');
      }
      await loadStudents();
    } catch (err) {
      if (err.status === 400 && err.details) {
        setBackendErrors(err.details);
      } else if (err.status === 404) {
        showNotification('Student record not found on server.', 'danger');
      } else {
        setBackendErrors([err.message || 'Server error encountered.']);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student record?')) return;
    try {
      await deleteStudent(id);
      showNotification('Student record deleted successfully!', 'success');
      if (currentStudent && (currentStudent.id === id || currentStudent._id === id)) {
        setCurrentStudent(null);
      }
      await loadStudents();
    } catch (err) {
      showNotification(err.message || 'Failed to delete student record.', 'danger');
    }
  };

  return (
    <div className="container">
      <Navbar onRefresh={loadStudents} isConnected={isConnected} />

      {notification && (
        <div className={`alert alert-${notification.type}`} style={{ animation: 'fadeIn 0.3s ease' }}>
          {notification.type === 'success' ? '✅' : '❌'} {notification.msg}
        </div>
      )}

      <div className="grid-layout">
        <div>
          <StudentForm
            currentStudent={currentStudent}
            onSubmit={handleFormSubmit}
            onCancel={() => setCurrentStudent(null)}
            isSubmitting={isSubmitting}
            backendErrors={backendErrors}
          />
        </div>
        <div>
          <StudentList
            students={students}
            onEdit={(student) => {
              setCurrentStudent(student);
              setBackendErrors([]);
            }}
            onDelete={handleDelete}
            isLoading={isLoading}
            error={error}
          />
        </div>
      </div>
    </div>
  );
}
