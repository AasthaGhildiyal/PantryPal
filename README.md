# 🍲 PantryPal – AI-Powered Recipe Preparation Agent

**Your ingredients. Your next meal.**

PantryPal is an AI-powered Recipe Preparation Agent designed to help users decide what to cook using ingredients they already have at home. It retrieves relevant recipes from a local recipe knowledge base and uses IBM Granite to generate helpful cooking advice and preparation guidance.

The project aims to make everyday cooking easier, reduce food waste, and help users make better use of available ingredients.

## ✨ Features

- **Ingredient-Based Recipe Search:** Find recipes based on ingredients available at home.
- **AI-Powered Cooking Assistance:** Get cooking advice and preparation suggestions using IBM Granite.
- **Step-by-Step Guidance:** Receive helpful instructions and tips for preparing selected recipes.
- **Ingredient Substitutions:** Explore alternatives when certain ingredients are unavailable.
- **Simple User Interface:** A clean, beginner-friendly interface for easy interaction.
- **Reduced Food Waste:** Encourages users to prepare meals using ingredients they already have.

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| HTML | Frontend structure |
| CSS | Styling and responsive design |
| JavaScript | Frontend interactions |
| Python | Backend development |
| Flask | Web application framework |
| IBM Granite | AI-generated cooking advice |
| IBM watsonx.ai | AI model integration |
| JSON | Recipe knowledge base |

## 📁 Project Structure

```text
PantryPal/
│
├── app.py
├── requirements.txt
├── .gitignore
│
├── data/
│   └── recipes.json
│
├── static/
│   ├── style.css
│   └── script.js
│
└── templates/
    └── index.html
```

## ⚙️ Installation and Setup

1. Clone the repository:

```bash
git clone https://github.com/AasthaGhildiyal/PantryPal.git
```

2. Navigate to the project folder:

```bash
cd PantryPal
```

3. Create a virtual environment:

```bash
python -m venv venv
```

4. Activate the virtual environment on Windows:

```bash
venv\Scripts\activate
```

5. Install dependencies:

```bash
pip install -r requirements.txt
```

6. Create a `.env` file in the project root and add your own IBM credentials:

```env
IBM_API_KEY=your_api_key
IBM_PROJECT_ID=your_project_id
IBM_URL=https://us-south.ml.cloud.ibm.com
```

7. Start the application:

```bash
python app.py
```

8. Open your browser and visit:

```text
http://127.0.0.1:5000
```

## 🤖 AI Integration

PantryPal integrates IBM Granite through IBM watsonx.ai. The application sends the selected ingredients and recipe information to the AI model and displays the generated cooking advice to the user.

The recipe search uses a local JSON-based recipe knowledge base to identify relevant recipes.

## 🎯 Project Objectives

- Make recipe discovery easier and more accessible.
- Help users make use of ingredients already available at home.
- Provide AI-assisted cooking recommendations.
- Encourage efficient ingredient usage and reduce food waste.
- Explore the practical integration of generative AI into a web application.

## 📚 Learning Outcomes

Through this project, I gained practical experience in:

- Developing a web application using Python Flask.
- Connecting a frontend with backend API endpoints.
- Integrating IBM Granite using watsonx.ai.
- Working with JSON data and recipe retrieval.
- Using environment variables to manage API credentials.
- Debugging and testing a full-stack application.

## 🔮 Future Improvements

- Add user accounts and saved recipes.
- Expand the recipe database.
- Introduce more dietary preferences and filters.
- Improve ingredient matching and recipe recommendations.
- Add voice-based ingredient input.
- Improve deployment and accessibility.

## 👩‍💻 Project Information

**Project Name:** PantryPal – Recipe Preparation Agent  
**Project Type:** AI-Powered Web Application  
**AI Model:** IBM Granite  
**Backend:** Python Flask

---

*Developed as a learning project to explore AI integration and web application development.*