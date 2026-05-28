# 🏥 Frailty Prediction Application

An intelligent, full-stack microservices application designed to predict patient frailty using machine learning. This system allows healthcare administrators and doctors to manage patient data, track historical health records, and generate AI-driven frailty predictions and actionable recommendations.

---

## 🏗️ Architecture

The application is composed of three main interconnected services along with a MongoDB database:

1. **Frontend (React)**: A dynamic user interface providing dashboards for patients, prediction history, and actionable recommendations. *(Running on Port 5173)*
2. **Backend (Spring Boot)**: A robust Java backend handling user authentication (JWT), role-based access control, core business logic, and database management for patients and predictions. *(Running on Port 8080)*
3. **ML Service (FastAPI)**: A dedicated Python machine learning service that processes patient data to predict frailty levels. It utilizes AI integrations (Gemini/OpenAI) to provide contextual health recommendations. *(Running on Port 8000)*
4. **Database (MongoDB)**: Stores patient demographics, medical history, and generated predictions. *(Running on Port 27017)*

---

## 🚀 Tech Stack

- **Frontend**: React, Vite, Tailwind/Vanilla CSS
- **Backend**: Java, Spring Boot, Spring Security (JWT)
- **Machine Learning**: Python, FastAPI, Google Gemini / OpenAI
- **Database**: MongoDB
- **Containerization**: Docker, Docker Compose

---

## 📂 Project Structure

```text
├── react-frontend/       # UI, Components, Pages, and API services
├── springboot-backend/   # Controllers, Models, Repositories, Security configs
├── ml-service/           # Prediction endpoints, AI engine, schemas
└── docker/               # Docker Compose configurations
```

---

## 🧠 Machine Learning Details

### Algorithms Used
- **Predictive Model**: **XGBoost Classifier** fine-tuned using `RandomizedSearchCV` to accurately classify frailty risk based on multiple health parameters.
- **Explainability**: **SHAP (SHapley Additive exPlanations)** `TreeExplainer` is used to interpret model predictions, showing the contribution of each feature to the patient's frailty score.
- **Generative AI Recommendations**: The **Google Gemini API** takes the numerical patient data and model predictions to generate personalized, human-readable health recommendations.

### Datasets Processed
The model was trained on a robust, merged dataset containing multiple dimensions of patient health and socio-economic data:
- **NHANES Health Data**: Demographics (`DEMO_J`), BMI (`BMX_J`), Blood Pressure (`BPX_J`), Complete Blood Count (`CBC_J`), Standard Biochemistry Profile (`BIOPRO_J`), and Medical Conditions Questionnaire (`MCQ_J`).
- **Socio-Economic Factors**: Community type, median income, poverty rates, education levels (bachelor's percentage), unemployment rates, insurance coverage, disability rates, and housing costs.

---

## ⚙️ Key Features

- **Secure Authentication**: JWT-based login and registration system for doctors/admins.
- **Patient Management**: Add, update, and track patient demographic and health data.
- **AI Predictions**: Send patient metrics to the ML service to receive frailty risk assessments.
- **Actionable Recommendations**: AI-generated health recommendations specific to the patient's predicted risk level.
- **History Tracking**: Maintain a historical log of patient assessments.

---

## 🐳 Getting Started (Docker)

The easiest way to run the entire application stack is using Docker Compose.

### Prerequisites
- [Docker](https://www.docker.com/products/docker-desktop/) installed
- [Docker Compose](https://docs.docker.com/compose/install/) installed

### Setup & Run

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone https://github.com/YourUsername/your-repo-name.git
   cd your-repo-name
   ```

2. **Environment Variables**:
   You may need to configure your AI keys. You can pass them directly in the terminal before running docker, or create an `.env` file. For the ML Service to generate recommendations, ensure you provide the necessary API key (e.g., `OPENAI_API_KEY` or Gemini equivalent, depending on your configuration).

3. **Build and spin up the containers**:
   From the root folder (or within the `docker` folder depending on your path), run the development compose file:
   ```bash
   cd docker
   docker-compose -f docker-compose.dev.yml up --build
   ```

4. **Access the Application**:
   - **Frontend UI**: [http://localhost:5173](http://localhost:5173)
   - **Spring Boot Backend API**: [http://localhost:8080](http://localhost:8080)
   - **FastAPI ML Service Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

*(Note: On the first run, the ML container may take a minute or two to download dependencies and health-check successfully).*

---

## 💻 Manual Setup (Without Docker)

If you prefer to run the services individually without Docker, you will need to start each one separately:

1. **MongoDB**: Ensure a local MongoDB instance is running on `localhost:27017` with a database named `frailtydb`.
2. **Backend**: Navigate to `springboot-backend/` and run `mvn spring-boot:run`.
3. **ML Service**: Navigate to `ml-service/`, install requirements `pip install -r requirements.txt`, and run `uvicorn api.main:app --reload`.
4. **Frontend**: Navigate to `react-frontend/`, run `npm install`, and then `npm run dev`.

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.
