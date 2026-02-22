# Loom 🕸️

Loom is an interactive web scraping and visualization playground designed to teach and demonstrate how data can be extracted from the web using CSS selectors. Users provide a URL and selector, the backend extracts matched DOM elements using Python (BeautifulSoup/Selenium), stores the results in SQL, and the frontend visualizes the extracted data. The goal is to build a reusable educational tool that integrates scraping, data storage, profiling, and visualization into one cohesive system.

---

## ⚙️ Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/sAVItar02/Loom-WebDataLab
cd webalchemy
```

### 🔧 Backend Setup
```bash
cd backend
python -m venv venv
```

#### Activate Virtual Environment

### Mac/Linux
```bash
source venv/bin/activate
```

### Windows
```bash
venv\Scripts\activate
```

### Install Dependencies
```bash
pip install -r requirements.txt
```

### 🎨 Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
