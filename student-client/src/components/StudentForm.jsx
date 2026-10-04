import React, { useState, useEffect } from 'react';

export default function StudentForm({ currentStudent, onSubmit, onCancel, isSubmitting, backendErrors }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    course: '',
    semester: 1
  });
  const [clientErrors, setClientErrors] = useState([]);

  useEffect(() => {
    if (currentStudent) {
      setFormData({
        name: currentStudent.name || '',
        email: currentStudent.email || '',
        course: currentStudent.course || '',
        semester: currentStudent.semester || 1
      });
    } else {
      setFormData({ name: '', email: '', course: '', semester: 1 });
    }
    setClientErrors([]);
  }, [currentStudent]);

  const validate = () => {
    const errors = [];
    if (!formData.name.trim()) errors.push('Name is required.');
    if (!formData.email.trim()) {
      errors.push('Email is required.');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.push('Email must be in a valid format (e.g. user@example.com).');
    }
    if (!formData.course.trim()) errors.push('Course is required.');
    if (isNaN(formData.semester) || formData.semester < 1 || formData.semester > 12) {
      errors.push('Semester must be an integer between 1 and 12.');
    }
    setClientErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(formData);
  };

  return (
    <div className="glass-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>
          {currentStudent ? '✏️ Edit Student Record' : '➕ Add New Student'}
        </h3>
        {currentStudent && (
          <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.25)', color: '#a5b4fc' }}>
            Editing ID: {currentStudent.id}
          </span>
        )}
      </div>

      {/* Client Validation Errors */}
      {clientErrors.length > 0 && (
        <div className="alert alert-danger" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
          <strong>⚠️ Client-Side Validation Failed:</strong>
          <ul style={{ paddingLeft: '20px', marginTop: '6px' }}>
            {clientErrors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Backend 400 Bad Request Errors */}
      {backendErrors && backendErrors.length > 0 && (
        <div className="alert alert-danger" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
          <strong>❌ API Error (HTTP 400 Bad Request):</strong>
          <ul style={{ paddingLeft: '20px', marginTop: '6px' }}>
            {backendErrors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Full Name</label>
          <input
            type="text"
            className="form-control"
            placeholder="e.g. Aarav Patel"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input
            type="email"
            className="form-control"
            placeholder="e.g. aarav@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Course / Program</label>
          <input
            type="text"
            className="form-control"
            placeholder="e.g. Computer Science"
            value={formData.course}
            onChange={(e) => setFormData({ ...formData, course: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Semester (1 - 12)</label>
          <input
            type="number"
            min="1"
            max="12"
            className="form-control"
            value={formData.semester}
            onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value, 10) || 1 })}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
          <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={isSubmitting}>
            {isSubmitting ? '⌛ Saving...' : currentStudent ? '💾 Update Student' : '➕ Add Student'}
          </button>
          {currentStudent && (
            <button type="button" onClick={onCancel} className="btn btn-secondary">
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
