/**
 * Student Controller
 * DA-IICT Web Services & SOA - Lab 4 Assignment
 * Manages Student MongoDB Atlas persistence using Mongoose with fallback seed data.
 */

const mongoose = require('mongoose');
const Student = require('../models/Student');

// In-memory fallback dataset in case MongoDB Atlas is not yet connected
let inMemoryStudents = [
  {
    id: '65f1a2b3c4d5e6f7a8b9c0d1',
    name: 'Aarav Patel',
    email: 'aarav@example.com',
    course: 'Computer Science',
    semester: 5
  },
  {
    id: '65f1a2b3c4d5e6f7a8b9c0d2',
    name: 'Priya Sharma',
    email: 'priya.sharma@example.com',
    course: 'Information Technology',
    semester: 3
  },
  {
    id: '65f1a2b3c4d5e6f7a8b9c0d3',
    name: 'Rohan Mehta',
    email: 'rohan.m@example.com',
    course: 'Electronics & Communication',
    semester: 7
  }
];

// Helper to check DB connectivity state
const isDbConnected = () => mongoose.connection && mongoose.connection.readyState === 1;

/**
 * GET /students
 * Retrieves all students list.
 */
const getAllStudents = async (req, res, next) => {
  try {
    if (isDbConnected()) {
      const students = await Student.find().sort({ createdAt: -1 });
      return res.status(200).json({
        status: 200,
        message: 'Students retrieved successfully',
        count: students.length,
        data: students
      });
    }

    // Fallback to in-memory store
    res.status(200).json({
      status: 200,
      message: 'Students retrieved successfully (in-memory mode)',
      count: inMemoryStudents.length,
      data: inMemoryStudents
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /students/:id
 * Retrieves a single student by ID.
 */
const getStudentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          status: 400,
          error: 'Bad Request',
          message: `Invalid Student ID format: ${id}`
        });
      }

      const student = await Student.findById(id);
      if (!student) {
        return res.status(404).json({
          status: 404,
          error: 'Not Found',
          message: `Student with ID ${id} does not exist.`
        });
      }

      return res.status(200).json({
        status: 200,
        message: `Student with ID ${id} retrieved successfully`,
        data: student
      });
    }

    // Fallback in-memory
    const student = inMemoryStudents.find((s) => s.id === id || String(s.id) === String(id));
    if (!student) {
      return res.status(404).json({
        status: 404,
        error: 'Not Found',
        message: `Student with ID ${id} does not exist.`
      });
    }

    res.status(200).json({
      status: 200,
      message: `Student with ID ${id} retrieved successfully (in-memory mode)`,
      data: student
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /students
 * Creates a new student record.
 */
const createStudent = async (req, res, next) => {
  try {
    const { name, email, course, semester } = req.body;

    if (isDbConnected()) {
      // Check unique email constraint before save
      const existingEmail = await Student.findOne({ email: email.toLowerCase() });
      if (existingEmail) {
        return res.status(400).json({
          status: 400,
          error: 'Bad Request',
          message: 'Validation failed for Student resource payload.',
          details: [`Email address '${email}' is already registered to another student.`]
        });
      }

      const newStudent = await Student.create({
        name,
        email,
        course,
        semester: Number(semester)
      });

      return res.status(201).json({
        status: 201,
        message: 'Student created successfully',
        data: newStudent
      });
    }

    // In-memory create
    const existsInMemory = inMemoryStudents.find((s) => s.email.toLowerCase() === email.toLowerCase());
    if (existsInMemory) {
      return res.status(400).json({
        status: 400,
        error: 'Bad Request',
        message: 'Validation failed for Student resource payload.',
        details: [`Email address '${email}' is already registered to another student.`]
      });
    }

    const newStudent = {
      id: new mongoose.Types.ObjectId().toString(),
      name,
      email,
      course,
      semester: Number(semester)
    };

    inMemoryStudents.unshift(newStudent);

    res.status(201).json({
      status: 201,
      message: 'Student created successfully (in-memory mode)',
      data: newStudent
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        status: 400,
        error: 'Bad Request',
        message: 'Validation failed for Student resource payload.',
        details: ['Email address is already registered to another student.']
      });
    }
    next(error);
  }
};

/**
 * PUT /students/:id
 * Updates an existing student record by ID.
 */
const updateStudent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, course, semester } = req.body;

    if (isDbConnected()) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          status: 400,
          error: 'Bad Request',
          message: `Invalid Student ID format: ${id}`
        });
      }

      // Check unique email conflict with other student
      const duplicateEmail = await Student.findOne({ email: email.toLowerCase(), _id: { $ne: id } });
      if (duplicateEmail) {
        return res.status(400).json({
          status: 400,
          error: 'Bad Request',
          message: 'Validation failed for Student resource payload.',
          details: [`Email address '${email}' is already registered to another student.`]
        });
      }

      const updatedStudent = await Student.findByIdAndUpdate(
        id,
        { name, email, course, semester: Number(semester) },
        { new: true, runValidators: true }
      );

      if (!updatedStudent) {
        return res.status(404).json({
          status: 404,
          error: 'Not Found',
          message: `Student with ID ${id} does not exist.`
        });
      }

      return res.status(200).json({
        status: 200,
        message: `Student with ID ${id} updated successfully`,
        data: updatedStudent
      });
    }

    // In-memory update
    const index = inMemoryStudents.findIndex((s) => s.id === id || String(s.id) === String(id));
    if (index === -1) {
      return res.status(404).json({
        status: 404,
        error: 'Not Found',
        message: `Student with ID ${id} does not exist.`
      });
    }

    const updated = {
      id,
      name,
      email,
      course,
      semester: Number(semester)
    };
    inMemoryStudents[index] = updated;

    res.status(200).json({
      status: 200,
      message: `Student with ID ${id} updated successfully (in-memory mode)`,
      data: updated
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        status: 400,
        error: 'Bad Request',
        message: 'Validation failed for Student resource payload.',
        details: ['Email address is already registered to another student.']
      });
    }
    next(error);
  }
};

/**
 * DELETE /students/:id
 * Deletes a student record by ID.
 */
const deleteStudent = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          status: 400,
          error: 'Bad Request',
          message: `Invalid Student ID format: ${id}`
        });
      }

      const deletedStudent = await Student.findByIdAndDelete(id);
      if (!deletedStudent) {
        return res.status(404).json({
          status: 404,
          error: 'Not Found',
          message: `Student with ID ${id} does not exist.`
        });
      }

      return res.status(200).json({
        status: 200,
        message: `Student with ID ${id} deleted successfully`,
        data: deletedStudent
      });
    }

    // In-memory delete
    const index = inMemoryStudents.findIndex((s) => s.id === id || String(s.id) === String(id));
    if (index === -1) {
      return res.status(404).json({
        status: 404,
        error: 'Not Found',
        message: `Student with ID ${id} does not exist.`
      });
    }

    const deleted = inMemoryStudents.splice(index, 1)[0];

    res.status(200).json({
      status: 200,
      message: `Student with ID ${id} deleted successfully (in-memory mode)`,
      data: deleted
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent
};
