# Cyn Court - AI-Powered Legal Simulation Platform

Cyn Court is an interactive legal simulation platform that uses AI to create realistic courtroom scenarios. The system allows users to participate in or observe simulated legal proceedings with AI-powered legal actors.

## Features

- **Interactive Court Sessions**: Engage with AI judges, attorneys, witnesses, and other legal actors
- **Case Creation**: Create custom legal cases with detailed backgrounds and evidence
- **Auto Trial Mode**: Watch as AI legal actors automatically conduct a complete trial
- **Verdict Prediction**: AI analysis of case outcomes
- **Case History**: Review past cases and their outcomes
- **Export Functionality**: Save trial transcripts for later review

## Technology Stack

### Frontend
- React with TypeScript
- Tailwind CSS for styling
- Axios for API communication

### Backend
- Django REST Framework
- LLM integration for AI legal actors
- SQLite database for case storage

## Getting Started

### Prerequisites
- Node.js (v14+)
- Python (v3.8+)
- pip

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/cyn-court.git
cd cyn-court
```

### set up the backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py makemigrations
python manage.py runserver
```
### backend works at http://127.0.0.1:8000/

### set up the frontend
```bash
cd frontend
npm install
npm run dev
```
### Open your browser and navigate to pen your browser and navigate to http://localhost:5173 

## Usage
### Creating a New Case
1. Click "New Case" on the home page
2. Enter a case name and detailed case information
3. Click "Start Trial" to begin (start ollama before starting the trial)
### Participating in a Trial
- click on the start auto trial button
- AI agenst will start the trial solve the case
- you can also Select a role (judge, prosecution, defense, etc.) by stoping the trial and selecting a role
- Type your message and send
- Observe AI responses from other legal actors
### Auto Trial Mode
- Click "Start Auto Trial" to let AI conduct the entire trial
- Watch as the AI legal actors interact with each other
- The trial will automatically progress through opening statements, arguments, and closing statements
### Exporting Trial Data
- Click "Export" during or after a trial to download the transcript in JSON format

## Project Structure
```plaintext
cyn-court/
├── backend/                # Django backend
│   ├── courtroom/          # Main app
│   │   ├── models.py       # Data models
│   │   ├── views.py        # API endpoints
│   │   └── urls.py         # URL routing
│   └── manage.py           # Django management script
└── frontend/               # React frontend
    ├── public/             # Static files
    └── src/                # Source code
        ├── components/     # React components
        ├── api.ts          # API client
        └── App.tsx         # Main application
```

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## License
This project is licensed under the MIT License - see the LICENSE file for details.

```plaintext

This README provides a comprehensive overview of your Cyn Court project, including its features, technology stack, installation instructions, usage guide, and project structure. It's designed to help users understand what the project does and how to use it effectively.
```