# 🎓 Universal SGPA & CGPA Calculator (Flask)

A modern **Flask-based web application** that calculates **SGPA and CGPA** using multiple grading systems.
Designed with a clean UI and practical features for students.

---

## 🚀 Features

### 📊 SGPA Calculator

* Add multiple subjects dynamically
* Input credits and grades
* Supports multiple grading systems:

  * Indian Letter Grade System
  * 10 Point Numeric System
  * 4 Point GPA System
  * Custom Grading System
  * Alternate System (0 = 10, A+ = 9, etc.)
* Accurate SGPA calculation

---

### 📈 CGPA Calculator

* Calculate CGPA from multiple semesters
* Simple and fast input system

---

### 🔮 CGPA Predictor

* Predict final CGPA based on:

  * Current CGPA
  * Remaining semesters
  * Expected SGPA

---

### 🧠 Performance Indicator

Displays result with performance level:

* 9 – 10 → Excellent
* 8 – 9 → Very Good
* 7 – 8 → Good
* 6 – 7 → Average
* Below 6 → Needs Improvement

---

### 🎓 Grade Reference Popup

* Shows:

  * SGPA formula
  * Grade point table
  * Example calculation

---

### 💾 Export as PDF

* Download result as PDF
* Includes:

  * SGPA
  * Total credits
  * Subject details
  * Performance

---

### 🎨 UI Highlights

* Modern dark theme 🌙
* Glassmorphism design
* Responsive layout 📱
* Smooth animations
* Clean dashboard-style interface

---

## 🧮 Formula Used

SGPA = Σ (Credit × Grade Point) / Σ (Credits)

---

## 🛠️ Tech Stack

* **Backend:** Flask (Python)
* **Frontend:** HTML, CSS, JavaScript
* **Templating:** Jinja2
* **Database:** (Optional / SQLite if used)
* **PDF Export:** jsPDF / html2pdf

---

## 📁 Project Structure

```
project/
│
├── app.py
├── templates/
│     ├── index.html
│     └── layout.html
│
├── static/
│     ├── style.css
│     └── script.js
│
└── requirements.txt
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository

```
git clone https://github.com/your-username/sgpa-calculator.git
cd sgpa-calculator
```

---

### 2️⃣ Create Virtual Environment

```
python -m venv venv
venv\Scripts\activate     (Windows)
```

---

### 3️⃣ Install Dependencies

```
pip install flask
```

or

```
pip install -r requirements.txt
```

---

### 4️⃣ Run the Application

```
python app.py
```

---

### 5️⃣ Open in Browser

```
http://127.0.0.1:5000/
```

---

## 🌐 Deployment

You can deploy this app using:

* Render
* Railway
* PythonAnywhere

---

## 📌 Future Improvements

* User login system
* Save semester history
* Graph-based performance tracking 📊
* Mobile app version

---

## 🤝 Contributing

Contributions are welcome!
Feel free to fork this repo and improve it.

---

## 📄 License

This project is open-source and free to use.

---

## ⭐ Support

If you like this project, give it a ⭐ on GitHub!
