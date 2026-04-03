
1.  **Check the GitHub Link**:https://github.com/Amritk-umar/financetracker1.git 
2.  **Add your Live Links**: https://financetracker1-zelp.onrender.com
3.  **Add your Live Links**: https://finance-tracker-api-backend-python.onrender.com

# Personal Finance Tracker+ 🚀

A high-performance, Full-Stack Personal Finance Management application built for the **Amlgo Labs Technical Assessment**. This project integrates real-time data syncing, AI-driven spending insights, and automated financial reporting.

## 🌟 Key Features

* **Real-time Dashboard**: Interactive spending overview with category-wise breakdown using Shadcn UI charts.
* **Secure Authentication**: Robust user accounts and session management powered by **Convex Auth**.
* **Smart Suggestions**: A dedicated **Python (FastAPI)** microservice that uses **Pandas** to analyze 30-day spending trends and provide AI-generated financial advice.
* **Budgeting & Alerts**: Set monthly limits per category with immediate visual "Over Budget" indicators.
* **Monthly SQL Logging**: Automated background logging of monthly summaries into a **SQLite** database for historical auditing.
* **Professional PDF Export**: Generate and download formatted financial reports directly from the dashboard.


## ⚙️ Backend Architecture (Python API)

The backend of this application is built with **Python** and **FastAPI**, serving as a high-performance microservice to handle heavy processing tasks like PDF generation and data prediction.

### 🛠️ Tech Stack
* **Framework:** FastAPI
* **PDF Generation:** FPDF
* **Database:** SQLite (for logging monthly reports)
* **Hosting:** Render

### ✨ Key Features
* **Dynamic PDF Generation:** Receives frontend data via a `POST` request, dynamically formats a financial table, calculates totals, and returns a downloadable PDF file using `FileResponse`.
* **AI/Predictive Spending:** Analyzes user expense data to return spending predictions.
* **Optimized Server Strategy:** Implemented a lightweight "Wake-Up Ping" (`GET /`) from the Next.js frontend to combat cloud-provider cold starts. This ensures the Python instance wakes up in the background while the user navigates the UI, resulting in zero-wait-time for PDF downloads.

### 📡 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | Health check and Render wake-up ping. |
| `POST` | `/generate-pdf` | Accepts `ReportRequest` JSON and returns a formatted PDF document. |
| `POST` | `/predict-spending` | Accepts expense history and returns future spending predictions. |

### 🚀 Running the Backend Locally

1. Navigate to the backend directory:
   ```bash
   cd backend-python
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   uvicorn main:app --reload --port 8000

## 🛠️ Technical Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | Next.js 14 (App Router), TypeScript, Tailwind CSS, Shadcn UI |
| **Database/Backend** | Convex (Real-time Database & Serverless Functions) |
| **AI/Analysis Service** | Python 3.10+, FastAPI, Pandas, Gemini API |
| **Deployment** | Render (Frontend & Python Microservice), Convex (Database) |

## 🚀 Getting Started

### Prerequisites
* Node.js 18+ 
* Python 3.10+
* A Convex Account

### Installation

1. **Clone the repository**
   ```bash
   git clone [https://github.com/Amritk-umar/financetracker1.git](https://github.com/Amritk-umar/financetracker1.git)
   cd financetracker1

2. **Setup Frontend**
    * cd frontend
    * npm install
    *  npx convex dev # This will link your Convex project   
   
3.**Setup Python Backend**
   * cd ../backend-python
   * pip install -r requirements.txt
   * uvicorn main:app --reload

4. **Environment Variables**
  * Create a .env.local in /frontend and a .env in /backend-python:

  * NEXT_PUBLIC_CONVEX_URL: Your Convex Deployment URL

  * GEMINI_API_KEY: Your Google Gemini API Key

**Project Structure**
* /frontend: Next.js application, UI components, and dashboard logic.

* /backend-python: FastAPI service for Pandas analysis and PDF generation.
* /convex: Database schema, mutations, and authentication logic.


  
