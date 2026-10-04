/**
 * REST API Client Service
 * DA-IICT Web Services & SOA - Lab 4 React Client
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export async function fetchStudents() {
  const res = await fetch(`${API_BASE_URL}/students`);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || `HTTP error ${res.status}`);
  }
  return data.data || [];
}

export async function fetchStudentById(id) {
  const res = await fetch(`${API_BASE_URL}/students/${id}`);
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.message || `Student not found (HTTP ${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data.data;
}

export async function createStudent(studentData) {
  const res = await fetch(`${API_BASE_URL}/students`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(studentData)
  });
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.message || 'Validation Error');
    err.status = res.status;
    err.details = data.details || [data.message];
    throw err;
  }
  return data.data;
}

export async function updateStudent(id, studentData) {
  const res = await fetch(`${API_BASE_URL}/students/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(studentData)
  });
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.message || 'Update Failed');
    err.status = res.status;
    err.details = data.details || [data.message];
    throw err;
  }
  return data.data;
}

export async function deleteStudent(id) {
  const res = await fetch(`${API_BASE_URL}/students/${id}`, {
    method: 'DELETE'
  });
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.message || 'Delete Failed');
    err.status = res.status;
    throw err;
  }
  return data.data;
}
