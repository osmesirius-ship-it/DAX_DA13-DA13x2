from fastapi import FastAPI, Request, Depends
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from pathlib import Path
import json
from typing import List, Dict, Any
import glob
import os
from datetime import datetime

app = FastAPI(title="DAX-13 Test Dashboard")

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

def get_test_reports() -> List[Dict[str, Any]]:
    """Load all test reports from the test-reports directory."""
    reports = []
    for report_file in sorted(glob.glob("../test-reports/agi-13-consecutive-analysis-*.json"), reverse=True):
        try:
            with open(report_file) as f:
                report = json.load(f)
                report["filename"] = os.path.basename(report_file)
                report["timestamp_display"] = datetime.fromisoformat(
                    report["timestamp"].split(".")[0]
                ).strftime("%Y-%m-%d %H:%M:%S")
                reports.append(report)
        except (json.JSONDecodeError, KeyError) as e:
            print(f"Error loading {report_file}: {e}")
    return reports

@app.get("/", response_class=HTMLResponse)
async def dashboard(request: Request):
    """Render the main dashboard."""
    reports = get_test_reports()
    if not reports:
        return "No test reports found. Please run some tests first."
    
    # Get the latest report for the dashboard
    latest_report = reports[0]
    
    # Prepare data for charts
    chart_data = {
        "labels": [f"Run {i+1}" for i in range(len(reports[0]["cross_domain_transfer"]["scores"]))],
        "scores": reports[0]["cross_domain_transfer"]["scores"],
        "durations": reports[0]["performance_metrics"]["durations"],
        "mean_score": reports[0]["cross_domain_transfer"]["mean"],
        "consistency": reports[0]["cross_domain_transfer"]["consistency"],
        "trend": reports[0]["cross_domain_transfer"]["trend"],
    }
    
    return templates.TemplateResponse(
        "dashboard.html",
        {
            "request": request,
            "reports": reports,
            "latest_report": latest_report,
            "chart_data": chart_data,
            "now": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
    )

@app.get("/api/reports")
async def get_reports():
    """API endpoint to get all test reports."""
    return get_test_reports()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
