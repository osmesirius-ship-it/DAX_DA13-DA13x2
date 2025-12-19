# DAX-13 Test Dashboard

A web-based dashboard for visualizing DAX-13 test results with interactive charts and metrics.

## Features

- Real-time visualization of test results
- Interactive charts for scores and durations
- Performance metrics and consistency tracking
- Responsive design for all devices
- Historical test run comparison

## Getting Started

### Prerequisites

- Python 3.7+
- pip (Python package installer)

### Installation

1. Navigate to the dashboard directory:
   ```bash
   cd /path/to/DAX_DA13-DA13x2/dashboard
   ```

2. Install the required Python packages:
   ```bash
   pip install -r requirements.txt
   ```

### Running the Dashboard

1. Start the FastAPI server:
   ```bash
   uvicorn main:app --reload
   ```

2. Open your web browser and navigate to:
   ```
   http://localhost:8000
   ```

## Dashboard Components

### Overview Cards
- **Cross-Domain Transfer**: Shows the average score and consistency
- **Overall Pass Rate**: Displays the pass rate across all tests
- **Performance Metrics**: Shows average test duration and stability status

### Interactive Charts
- **Scores Chart**: Line graph showing cross-domain transfer scores across test runs
- **Duration Chart**: Bar graph showing test durations for each run

### Recent Test Runs
A list of recent test runs with timestamps and performance indicators.

## Data Sources
The dashboard reads test results from the `../test-reports/` directory. Make sure your test results are saved there in the format `agi-13-consecutive-analysis-*.json`.

## Development

### Project Structure
```
dashboard/
├── main.py            # FastAPI application
├── requirements.txt   # Python dependencies
├── static/            # Static files (CSS, JS, images)
└── templates/         # HTML templates
```

### Making Changes
- To modify the dashboard layout, edit the HTML template in `templates/dashboard.html`
- To change the data processing logic, modify `main.py`
- To update styling, edit the Tailwind CSS classes in the HTML or add custom CSS in the `<style>` section

## License
This project is part of the DAX-13 system. See the main project for licensing information.
