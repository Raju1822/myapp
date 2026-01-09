
# Team Productivity Platform

A full‑stack application that unifies **task management**, **skills assessment**, **leave tracking**, and **performance reviews**—built with a **React SPA** frontend, **Node.js (HTTP)** backend, and **SQL Server** database.

> This repository contains the executive documentation UI along with architecture, ERD, flows, API catalog, and screenshot gallery.

---

## ✨ Features

- 🔐 Authentication & role‑based navigation (Director / Manager / Member)
- 📊 Dashboards for **Member** and **Manager**
- 🧠 Skill exams with **question bank**, **attempt tracking**, and **PDF certificates**
- ✅ Task creation, assignment, status updates, progress tracking
- 🗓️ Leave manager: apply, approve/reject, summaries & holidays
- 📝 Common review (Monthly/Yearly) with ratings and analytics
- 🖼️ Asset uploads (profile pictures, certificates) served securely
- 📈 KPI & SQL examples for quick analytics

---

## 🧱 Architecture

**Frontend:** React SPA (Router, Bootstrap, Chart.js, LocalStorage)  
**Backend:** Node.js (native `http`), CORS, Multer (uploads), PDFKit (certificates)  
**Database:** SQL Server (`EmpDB`) with normalized tables and FK constraints

The app renders the following diagrams in the documentation UI:

- **System Architecture Diagram** – shows component boundaries and integrations
- **ER Diagram** – key tables: `users`, `skills`, `user_skills`, `tasks`, `questions`, `options`,  
  `exam_attempts`, `attempt_answers`, `leave_types`, `leave_requests`, `holidays`,  
  `employee_reviews`, `review_questions`, `review_answers`

> Files (profile pictures, certificates) are stored under `public/uploads` and served via `GET /uploads/<filename>` with path traversal protection.

---

## 📂 Directory Structure (indicative)
