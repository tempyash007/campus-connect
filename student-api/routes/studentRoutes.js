/**
 * Student Resource Routes
 */

const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const validateStudent = require('../middleware/validation');

/**
 * @openapi
 * /students:
 *   get:
 *     summary: Retrieve list of all student records
 *     responses:
 *       200:
 *         description: List of students retrieved successfully
 */
router.get('/', studentController.getAllStudents);

/**
 * @openapi
 * /students/{id}:
 *   get:
 *     summary: Retrieve a single student by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Student found
 *       400:
 *         description: Invalid ID format
 *       404:
 *         description: Student not found
 */
router.get('/:id', studentController.getStudentById);

/**
 * @openapi
 * /students:
 *   post:
 *     summary: Create a new student record
 *     requestBody:
 *       required: true
 *     responses:
 *       201:
 *         description: Student created successfully
 *       400:
 *         description: Validation failure
 */
router.post('/', validateStudent, studentController.createStudent);

/**
 * @openapi
 * /students/{id}:
 *   put:
 *     summary: Update an existing student record
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Student updated
 *       400:
 *         description: Validation failure
 *       404:
 *         description: Student not found
 */
router.put('/:id', validateStudent, studentController.updateStudent);

/**
 * @openapi
 * /students/{id}:
 *   delete:
 *     summary: Delete a student record
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Student deleted
 *       404:
 *         description: Student not found
 */
router.delete('/:id', studentController.deleteStudent);

module.exports = router;
