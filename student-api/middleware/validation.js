/**
 * Student Payload Validation Middleware
 */

const validateStudent = (req, res, next) => {
  const { name, email, course, semester } = req.body;
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim() === '') {
    errors.push('Name is required and must be a non-empty string.');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
    errors.push('A valid email address is required (e.g., student@example.com).');
  }

  if (!course || typeof course !== 'string' || course.trim() === '') {
    errors.push('Course is required and must be a non-empty string.');
  }

  const semNum = Number(semester);
  if (semester === undefined || semester === null || isNaN(semNum) || !Number.isInteger(semNum) || semNum < 1 || semNum > 12) {
    errors.push('Semester is required and must be an integer between 1 and 12.');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      status: 400,
      error: 'Bad Request',
      message: 'Validation failed for Student resource payload.',
      details: errors
    });
  }

  next();
};

module.exports = validateStudent;
