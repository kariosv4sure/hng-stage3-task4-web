# Insighta Labs+ Web Portal

Live URL:  
https://hng-stage3-task4-web.vercel.app

Backend API:  
https://hng-stage3-task4-backend-production.up.railway.app

---

## 🚀 Overview

Insighta Labs+ Web Portal is the frontend interface for the Profile Intelligence System (Stage 3).

It enables users to securely log in with GitHub OAuth and interact with profile intelligence data through a modern dashboard.

---

## 🔐 Authentication

- GitHub OAuth (PKCE flow)
- HTTP-only cookies for session security
- Access + refresh token system
- Protected dashboard routes

---

## 📊 Features

- GitHub login authentication
- Profile listing with pagination
- Natural language search
- Filters (gender, age group)
- CSV export functionality
- User session display
- Secure logout

---

## 🧠 Backend Integration

Consumes REST API from:

- `/api/v1/auth/*`
- `/api/v1/profiles`
- `/api/v1/profiles/search`
- `/api/v1/export/profiles`

---

## 🏗️ Tech Stack

- HTML5
- TailwindCSS
- Vanilla JavaScript
- FastAPI backend (external)
- Vercel deployment

---

## 🔄 Auth Flow

1. User clicks "Login with GitHub"
2. Redirected to backend OAuth endpoint
3. GitHub authorizes user
4. Backend exchanges code for token
5. Session stored via HTTP-only cookies
6. User redirected to dashboard

---

## 📦 Deployment

- Frontend: Vercel
- Backend: Railway

---

## ⚠️ Notes

- Requires backend to be running
- OAuth depends on correct redirect URI configuration
- Cookies must be enabled for session auth

---

## 👨‍💻 Project

Part of HNG Stage 3 Internship Submission
