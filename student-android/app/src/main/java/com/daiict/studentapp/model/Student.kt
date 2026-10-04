package com.daiict.studentapp.model

import com.google.gson.annotations.SerializedName

data class Student(
    @SerializedName("id") val id: String? = null,
    @SerializedName("name") val name: String,
    @SerializedName("email") val email: String,
    @SerializedName("course") val course: String,
    @SerializedName("semester") val semester: Int
)

data class ApiResponse<T>(
    @SerializedName("status") val status: Int,
    @SerializedName("message") val message: String,
    @SerializedName("data") val data: T?,
    @SerializedName("details") val details: List<String>? = null
)
