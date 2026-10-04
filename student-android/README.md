# CampusConnect — Android Client (Lab 4)

**Web Services & SOA Laboratory – Lab Assignment 4**
**Platform**: Android (Kotlin, Jetpack, Material Design 3, Retrofit 2, Coroutines)

---

## 📱 Features & Scope (Equivalent Screens)

As required by Lab 4 Part C:
1. **List Students Screen (`MainActivity`)**: Consumes `GET /students` via Retrofit, renders items in a modern `RecyclerView` with `SwipeRefreshLayout`.
2. **Add Student Form (`AddStudentActivity`)**: Consumes `POST /students` via Retrofit with client-side validation, handles `201 Created` and `400 Bad Request` responses with specific `Toast` messages.

---

## 🌐 API Base URL Configuration

The base URL is centrally configured in:
`app/src/main/java/com/campusconnect/studentapp/network/RetrofitClient.kt`

```kotlin
// Android Emulator (10.0.2.2 points to host machine localhost)
const val API_BASE_URL = "http://10.0.2.2:3000/"

// Physical Android Device connected to same Wi-Fi network:
// const val API_BASE_URL = "http://192.168.1.X:3000/"
```

---

## 🚀 How to Run in Android Studio

1. Open **Android Studio**.
2. Select **Open** and choose the `student-android` directory (`e:\soa lab\student-android`).
3. Allow Gradle to sync dependencies (Retrofit, Gson, Material, SwipeRefreshLayout).
4. Start an Android Virtual Device (AVD Emulator with API Level 24+).
5. Ensure your backend server is running on your computer (`npm start` in `student-api` on port 3000).
6. Click **Run 'app'** (`Shift + F10`).

---

## 📸 Screenshots Required for Submission

1. **List Students Screen**: Showing students loaded from the REST API / MongoDB Atlas.
2. **Add Student Form**: Filling in Aarav Patel or new student.
3. **Success Toast**: Showing `✅ 201 Created: Student added to MongoDB Atlas!`.
4. **Validation Toast (Negative test)**: Submitting empty form showing `❌ HTTP 400 Bad Request`.
