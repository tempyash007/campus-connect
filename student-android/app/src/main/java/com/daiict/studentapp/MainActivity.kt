package com.daiict.studentapp

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.ProgressBar
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.daiict.studentapp.adapter.StudentAdapter
import com.daiict.studentapp.api.RetrofitClient
import com.daiict.studentapp.model.ApiResponse
import com.daiict.studentapp.model.Student
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class MainActivity : AppCompatActivity() {

    private lateinit var recyclerView: RecyclerView
    private lateinit var progressBar: ProgressBar
    private lateinit var btnAddStudent: Button
    private lateinit var adapter: StudentAdapter

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        recyclerView = findViewById(R.id.recyclerViewStudents)
        progressBar = findViewById(R.id.progressBar)
        btnAddStudent = findViewById(R.id.btnAddStudent)

        recyclerView.layoutManager = LinearLayoutManager(this)
        adapter = StudentAdapter(emptyList())
        recyclerView.adapter = adapter

        btnAddStudent.setOnClickListener {
            startActivity(Intent(this, AddStudentActivity::class.java))
        }
    }

    override fun onResume() {
        super.onResume()
        fetchStudentsList()
    }

    private fun fetchStudentsList() {
        progressBar.visibility = View.VISIBLE
        RetrofitClient.instance.getAllStudents().enqueue(object : Callback<ApiResponse<List<Student>>> {
            override fun onResponse(
                call: Call<ApiResponse<List<Student>>>,
                response: Response<ApiResponse<List<Student>>>
            ) {
                progressBar.visibility = View.GONE
                if (response.isSuccessful) {
                    val students = response.body()?.data ?: emptyList()
                    adapter.updateData(students)
                    Toast.makeText(this@MainActivity, "GET /students Success (${students.size} records)", Toast.LENGTH_SHORT).show()
                } else if (response.code() == 404) {
                    Toast.makeText(this@MainActivity, "HTTP 404: Endpoint or Students Not Found", Toast.LENGTH_LONG).show()
                } else {
                    Toast.makeText(this@MainActivity, "HTTP ${response.code()}: Server error", Toast.LENGTH_LONG).show()
                }
            }

            override fun onFailure(call: Call<ApiResponse<List<Student>>>, t: Throwable) {
                progressBar.visibility = View.GONE
                Toast.makeText(this@MainActivity, "Network Error: Could not reach REST API (10.0.2.2:3000)", Toast.LENGTH_LONG).show()
            }
        })
    }
}
