package com.daiict.studentapp

import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.daiict.studentapp.api.RetrofitClient
import com.daiict.studentapp.model.ApiResponse
import com.daiict.studentapp.model.Student
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class AddStudentActivity : AppCompatActivity() {

    private lateinit var etName: EditText
    private lateinit var etEmail: EditText
    private lateinit var etCourse: EditText
    private lateinit var etSemester: EditText
    private lateinit var btnSubmit: Button

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_add_student)

        etName = findViewById(R.id.etName)
        etEmail = findViewById(R.id.etEmail)
        etCourse = findViewById(R.id.etCourse)
        etSemester = findViewById(R.id.etSemester)
        btnSubmit = findViewById(R.id.btnSubmitStudent)

        btnSubmit.setOnClickListener {
            submitStudentForm()
        }
    }

    private fun submitStudentForm() {
        val name = etName.text.toString().trim()
        val email = etEmail.text.toString().trim()
        val course = etCourse.text.toString().trim()
        val semesterStr = etSemester.text.toString().trim()

        if (name.isEmpty() || email.isEmpty() || course.isEmpty() || semesterStr.isEmpty()) {
            Toast.makeText(this, "Validation Error: All fields are required.", Toast.LENGTH_SHORT).show()
            return
        }

        val semester = semesterStr.toIntOrNull()
        if (semester == null || semester < 1 || semester > 12) {
            Toast.makeText(this, "Validation Error: Semester must be between 1 and 12.", Toast.LENGTH_SHORT).show()
            return
        }

        val student = Student(name = name, email = email, course = course, semester = semester)

        RetrofitClient.instance.createStudent(student).enqueue(object : Callback<ApiResponse<Student>> {
            override fun onResponse(
                call: Call<ApiResponse<Student>>,
                response: Response<ApiResponse<Student>>
            ) {
                if (response.isSuccessful && response.code() == 201) {
                    Toast.makeText(this@AddStudentActivity, "✅ Student created successfully! (201 Created)", Toast.LENGTH_LONG).show()
                    finish()
                } else if (response.code() == 400) {
                    val errorMsg = response.body()?.message ?: "HTTP 400 Bad Request: Validation failed."
                    Toast.makeText(this@AddStudentActivity, "⚠️ $errorMsg", Toast.LENGTH_LONG).show()
                } else {
                    Toast.makeText(this@AddStudentActivity, "HTTP ${response.code()}: Unable to add student.", Toast.LENGTH_LONG).show()
                }
            }

            override fun onFailure(call: Call<ApiResponse<Student>>, t: Throwable) {
                Toast.makeText(this@AddStudentActivity, "Network Error: Could not reach API server.", Toast.LENGTH_LONG).show()
            }
        })
    }
}
