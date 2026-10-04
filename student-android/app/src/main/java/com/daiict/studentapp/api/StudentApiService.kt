package com.daiict.studentapp.api

import com.daiict.studentapp.model.ApiResponse
import com.daiict.studentapp.model.Student
import retrofit2.Call
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path

interface StudentApiService {

    @GET("students")
    fun getAllStudents(): Call<ApiResponse<List<Student>>>

    @GET("students/{id}")
    fun getStudentById(@Path("id") id: String): Call<ApiResponse<Student>>

    @POST("students")
    fun createStudent(@Body student: Student): Call<ApiResponse<Student>>
}
