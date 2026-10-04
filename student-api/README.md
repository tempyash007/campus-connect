# Student Management REST API (Express.js + MongoDB Atlas) — Lab 4

**DA-IICT (Dhirubhai Ambani Institute of Information and Communication Technology)**  
*Web Services & SOA Lab — Lab 4 Backend REST API*

---

## 👤 Student Submission Details

* **Student Name**: Yash Doshi
* **Student ID / Roll No**: 202512094
* **Course**: Web Services & SOA Lab

---

## 📌 Project Overview

This is the Express.js RESTful Web Service connected to persistent **MongoDB Atlas** database storage via Mongoose. It exposes resource-oriented CRUD endpoints for the Student entity (`GET`, `POST`, `PUT`, `DELETE`).

---

## 🚀 Quick Start Guide

### 1. Installation
Navigate to the `student-api` folder and install dependencies:
```bash
npm install
```

### 2. Environment Configuration
Create a `.env` file (copied from `.env.example`):
```env
PORT=3000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.jdpye68.mongodb.net
```

### 3. Running the Server
Start the REST API server:
```bash
npm start
```
The server will start on `http://localhost:3000`.

* Interactive Swagger UI: `http://localhost:3000/api-docs`
* API Base Endpoint: `http://localhost:3000/students`
