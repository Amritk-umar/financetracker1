from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import HTTPException
from pydantic import BaseModel
from fpdf import FPDF
import pandas as pd
from datetime import datetime, timedelta
from fastapi.responses import FileResponse # Add this import at the top
import tempfile
import sqlite3
import os

app = FastAPI()

# Allow your Next.js frontend to talk to this Python server
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://financetracker1-zelp.onrender.com"
    ], 
    allow_methods=["*"],
    allow_headers=["*"],
)

class Expense(BaseModel):
    category: str
    amount: float
    date: str

class ReportRequest(BaseModel):
    user_name: str
    month: str
    expenses: list[Expense]

def init_db():
    conn = sqlite3.connect('reports.db')
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS monthly_reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_name TEXT,
            month TEXT,
            total_spent REAL,
            top_category TEXT,
            status TEXT
        )
    ''')
    conn.commit()
    conn.close()

init_db()

@app.post("/generate-pdf")
async def generate_pdf(data: ReportRequest):
    # Use FPDF() - if using fpdf2, 'Arial' is often 'helvetica' by default
    pdf = FPDF()
    pdf.add_page()

    try:
        total = sum(exp.amount for exp in data.expenses)
        # Simple logic to find top category
        categories = [exp.category for exp in data.expenses]
        top_cat = max(set(categories), key=categories.count) if categories else "None"
        
        conn = sqlite3.connect('reports.db')
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO monthly_reports (user_name, month, total_spent, top_category, status)
            VALUES (?, ?, ?, ?, ?)
        ''', (data.user_name, data.month, total, top_cat, "Generated"))
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"SQL Log Error: {e}")
    
    # Header
    pdf.set_font("helvetica", 'B', 20)
    pdf.cell(0, 10, "Monthly Financial Summary", ln=True, align='C')
    pdf.set_font("helvetica", '', 12)
    pdf.cell(0, 10, f"User: {data.user_name} | Period: {data.month}", ln=True, align='C')
    pdf.ln(10)

    # Table Header
    pdf.set_fill_color(200, 220, 255)
    pdf.set_font("helvetica", 'B', 12)
    pdf.cell(60, 10, " Date", 1, 0, 'L', True)
    pdf.cell(80, 10, " Category", 1, 0, 'L', True)
    pdf.cell(50, 10, " Amount", 1, 1, 'L', True)

    # Table Data
    pdf.set_font("helvetica", '', 12)
    total = 0
    for exp in data.expenses:
        # If exp is a Pydantic object, use exp.date; if it's a dict, use exp['date']
        # Assuming Pydantic based on your previous setup:
        pdf.cell(60, 10, f" {exp.date}", 1)
        pdf.cell(80, 10, f" {exp.category}", 1)
        pdf.cell(50, 10, f" ${exp.amount:.2f}", 1, 1)
        total += exp.amount

    # Total Row
    pdf.set_font("helvetica", 'B', 12)
    pdf.cell(140, 10, "Total Spending", 1, 0, 'R')
    pdf.cell(50, 10, f" ${total:.2f}", 1, 1)

    # Create a temp file
    # We don't use 'with' here because FileResponse needs the file to exist 
    # until it finishes sending it to the browser.
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
    pdf.output(tmp.name)
    tmp.close() # Close it so FileResponse can access it cleanly

    return FileResponse(
        path=tmp.name, 
        filename=f"Financial_Report_{data.month}.pdf",
        media_type='application/pdf'
    )

@app.post("/predict-spending")
async def predict_spending(data: list[Expense]):
    if not data:
        return {"prediction": 0, "message": "No data to analyze."}

    # 1. Convert to Pandas DataFrame
    df = pd.DataFrame([e.dict() for e in data])
    df['date'] = pd.to_datetime(df['date'])
    
    # 2. Get current month data
    current_month = datetime.now().month
    current_year = datetime.now().year
    month_df = df[(df['date'].dt.month == current_month) & (df['date'].dt.year == current_year)]
    
    if month_df.empty:
        return {"prediction": 0, "message": "No expenses this month yet."}

    # 3. Calculate Daily Average
    total_spent = month_df['amount'].sum()
    days_passed = datetime.now().day
    daily_avg = total_spent / days_passed
    
    # 4. Forecast for the rest of the month
    import calendar
    last_day = calendar.monthrange(current_year, current_month)[1]
    remaining_days = last_day - days_passed
    forecasted_extra = daily_avg * remaining_days
    
    return {
        "daily_avg": round(daily_avg, 2),
        "total_so_far": round(total_spent, 2),
        "prediction": round(total_spent + forecasted_extra, 2),
        "message": f"Based on your ${daily_avg:.2f}/day average, you are on track to spend ${total_spent + forecasted_extra:.2f} this month."
    }

@app.get("/view-resume")
async def view_resume():
    file_path = os.path.join(os.path.dirname(__file__), "Amrit--Kumar.pdf")
    
    if os.path.exists(file_path):
        return FileResponse(
            path=file_path, 
            media_type='application/pdf',
            headers={"Content-Disposition": "inline"}
        )     
    raise HTTPException(status_code=404, detail="Resume file not found")

@app.get("/download-report")
async def get_report():
    # Update this path to the actual location of your PDF
    file_path = "E:/project/finance-tracker/backend-python/report_2026-04.pdf"
    
    if os.path.exists(file_path):
        return FileResponse(
            path=file_path, 
            media_type='application/pdf', 
            filename="report.pdf"
        )
    raise HTTPException(status_code=404, detail="File not found")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)