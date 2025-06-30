<div align="center">
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/TailwindCSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Appwrite-FD366E?style=for-the-badge&logo=appwrite&logoColor=white" />
</div>

<h3 align="center">StoreIt — Secure File Storage & Sharing Platform</h3>

<p align="center">A modern, responsive application to upload, manage, and share files with ease, built using the latest web technologies.</p>

---

## 📚 Table of Contents

1. [Overview](#overview)  
2. [Tech Stack](#tech-stack)  
3. [Key Features](#key-features)  
4. [Getting Started](#getting-started)  
5. [Environment Configuration](#environment-configuration)  
6. [Deployment](#deployment)  
7. [Assets](#assets)  

---

## 🧩 Overview

**StoreIt** is a secure file storage and sharing solution built with Next.js 15, Appwrite, and TailwindCSS. It provides an intuitive interface for users to upload, organize, and share files securely. Ideal for individuals and teams who want a lightweight, elegant alternative to cloud storage solutions.

---

## 🛠 Tech Stack

- **Next.js 15** — React framework for building fast, scalable web apps  
- **TypeScript** — Strongly typed JavaScript  
- **TailwindCSS** — Utility-first CSS framework  
- **Appwrite** — Backend server for authentication, file storage, and databases  
- **ShadCN UI** — Accessible and customizable UI components  

---

## ⚡ Key Features

- 🔐 **Authentication**: Register, login, logout using Appwrite  
- 📤 **File Uploads**: Upload various file types with real-time status  
- 📁 **File Management**: Rename, delete, or preview uploaded files  
- 📎 **Sharing**: Generate public or private links for file access  
- 📊 **Dashboard**: Overview of storage usage and recent activity  
- 🔍 **Search & Sorting**: Easily locate files by name or type, sort by date/size  
- 💡 **Responsive Design**: Optimized for desktop and mobile  
- 📦 **Static Export Ready**: Deployable to GitHub Pages  

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Git](https://git-scm.com/)
- [Appwrite Cloud Account](https://appwrite.io/)

### Clone the Repository

```bash
git clone https://github.com/tu-usuario/store-it.git
cd store-it
```

### Install Dependencies
```bash
npm install
```

### Start Development Server
```bash
npm run dev
```
Visit http://localhost:3000 in your browser.

### ⚙️ Environment Configuration
Create a .env.local file in the root and add your Appwrite credentials:
```bash
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://(region).cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT=your_project_id
NEXT_PUBLIC_APPWRITE_DATABASE=your_database_id
NEXT_PUBLIC_APPWRITE_USERS_COLLECTION=your_users_collection
NEXT_PUBLIC_APPWRITE_FILES_COLLECTION=your_files_collection
NEXT_PUBLIC_APPWRITE_BUCKET=your_bucket_id
NEXT_APPWRITE_KEY=your_appwrite_api_key
```
