import React, { useState } from 'react';

export default function StudentList({ students, onEdit, onDelete, isLoading, error }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.course.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="glass-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>📋 Student Directory</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Showing {filteredStudents.length} of {students.length} student records
          </p>
        </div>
        <div style={{ minWidth: '240px' }}>
          <input
            type="text"
            className="form-control"
            placeholder="🔍 Search name, email, course..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {isLoading && (
        <div className="alert alert-warning" style={{ justifyContent: 'center' }}>
          ⌛ Loading students from database...
        </div>
      )}

      {error && (
        <div className="alert alert-danger">
          <span>❌ {error}</span>
        </div>
      )}

      {!isLoading && !error && filteredStudents.length === 0 && (
        <div style={{ textAlignment: 'center', padding: '40px 20px', color: 'var(--text-muted)', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>📭</div>
          <p style={{ fontWeight: '600' }}>No student records found.</p>
          <p style={{ fontSize: '0.85rem' }}>Use the form on the left to add a new student.</p>
        </div>
      )}

      {!isLoading && filteredStudents.length > 0 && (
        <div className="table-responsive">
          <table className="student-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Course</th>
                <th>Semester</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.id || student._id}>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {(student.id || student._id).substring(0, 8)}...
                  </td>
                  <td style={{ fontWeight: '600' }}>{student.name}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{student.email}</td>
                  <td>
                    <span className="badge">{student.course}</span>
                  </td>
                  <td>Sem {student.semester}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '8px' }}>
                      <button onClick={() => onEdit(student)} className="btn btn-edit" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                        ✏️ Edit
                      </button>
                      <button onClick={() => onDelete(student.id || student._id)} className="btn btn-danger" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
