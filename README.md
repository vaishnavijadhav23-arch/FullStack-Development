# 💰 FinanceAI — AI Personal Finance Advisor

A full-stack AI-powered personal finance management application built with **Spring Boot** (backend) and **ReactJS** (frontend), using **MongoDB Atlas** for storage.

---

## 📁 Folder Structure

```
finance-advisor/
├── backend/                          # Spring Boot Application
│   ├── src/main/java/com/financeadvisor/
│   │   ├── FinanceAdvisorApplication.java
│   │   ├── config/
│   │   │   └── SecurityConfig.java
│   │   ├── controller/
│   │   │   ├── AuthController.java
│   │   │   ├── TransactionController.java
│   │   │   ├── BudgetController.java
│   │   │   └── AnalyticsController.java
│   │   ├── dto/
│   │   │   ├── AuthDto.java
│   │   │   ├── TransactionDto.java
│   │   │   ├── BudgetDto.java
│   │   │   └── AnalyticsDto.java
│   │   ├── entity/
│   │   │   ├── User.java
│   │   │   ├── Transaction.java
│   │   │   └── Budget.java
│   │   ├── repository/
│   │   │   ├── UserRepository.java
│   │   │   ├── TransactionRepository.java
│   │   │   └── BudgetRepository.java
│   │   ├── security/
│   │   │   ├── JwtUtils.java
│   │   │   └── JwtAuthenticationFilter.java
│   │   └── service/
│   │       ├── AuthService.java
│   │       ├── TransactionService.java
│   │       ├── BudgetService.java
│   │       └── AnalyticsService.java
│   ├── src/main/resources/
│   │   └── application.properties
│   ├── src/test/java/com/financeadvisor/service/
│   │   ├── TransactionServiceTest.java
│   │   └── AnalyticsServiceTest.java
│   └── pom.xml
│
├── frontend/                         # React Application
│   ├── public/index.html
│   ├── src/
│   │   ├── App.js
│   │   ├── index.js
│   │   ├── index.css
│   │   ├── context/AuthContext.js
│   │   ├── services/api.js
│   │   ├── components/layout/
│   │   │   ├── Layout.js
│   │   │   └── Layout.css
│   │   └── pages/
│   │       ├── LoginPage.js
│   │       ├── RegisterPage.js
│   │       ├── DashboardPage.js
│   │       ├── TransactionsPage.js
│   │       ├── AddTransactionPage.js
│   │       └── BudgetPage.js
│   └── package.json
│
├── FinanceAdvisor.postman_collection.json
├── render.yaml
├── netlify.toml
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- Java 17+
- Maven 3.8+
- Node.js 18+
- MongoDB Atlas account (provided URI already configured)

---

## ⚙️ Backend Setup

```bash
cd backend

# Build the project
mvn clean install

# Run the application
mvn spring-boot:run
```

Backend starts at: `http://localhost:8080`

### Configuration (`application.properties`)
```properties
spring.data.mongodb.uri=mongodb+srv://finance:finance@financeadvisor.p0euqix.mongodb.net/financeAdvisorDB
app.jwt.secret=FinanceAdvisorSecretKey2024VeryLongSecretKeyForJWTTokenGeneration
app.jwt.expiration=86400000
```

### Run Tests
```bash
mvn test
```

---

## 🎨 Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

Frontend starts at: `http://localhost:3000`

### Build for production
```bash
npm run build
```

---

## 🌐 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, get JWT |
| GET | `/api/auth/me` | Get current user |

### Transactions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/transactions` | Get all transactions |
| POST | `/api/transactions` | Create transaction |
| GET | `/api/transactions/{id}` | Get by ID |
| PUT | `/api/transactions/{id}` | Update transaction |
| DELETE | `/api/transactions/{id}` | Delete transaction |
| GET | `/api/transactions/range?from=&to=` | Get by date range |

### Budgets
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/budgets` | Get budgets (current month) |
| GET | `/api/budgets?month=3&year=2024` | Get by month/year |
| GET | `/api/budgets/all` | Get all budgets |
| POST | `/api/budgets` | Create/Update budget |
| DELETE | `/api/budgets/{id}` | Delete budget |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics` | Full analytics + AI insights |
| GET | `/api/analytics/monthly?year=&month=` | Monthly analytics |
| GET | `/api/analytics/range?from=&to=` | Range analytics |

---

## 📊 Sample API Responses

### POST /api/auth/login → 200 OK
```json
{
  "token": "eyJhbGciOiJIUzUxMiJ9...",
  "userId": "65abc123def456",
  "name": "John Doe",
  "email": "john@example.com",
  "message": "Authentication successful"
}
```

### GET /api/analytics → 200 OK
```json
{
  "totalIncome": 50000.00,
  "totalExpense": 35000.00,
  "netSavings": 15000.00,
  "savingsRate": 30.0,
  "categoryBreakdown": {
    "FOOD": 8000.00,
    "BILLS": 5000.00,
    "SHOPPING": 12000.00,
    "TRAVEL": 10000.00
  },
  "monthlyTrends": [
    { "year": 2024, "month": 3, "monthName": "Mar 2024", "income": 50000, "expense": 35000, "savings": 15000 }
  ],
  "insights": ["Great job! Your savings rate of 30.0% meets the recommended 20% target."],
  "warnings": ["SHOPPING accounts for 34.3% of your spending. Consider reducing shopping expenses."],
  "suggestions": ["Try to limit SHOPPING spending to under 30% of total expenses."]
}
```

### GET /api/budgets → 200 OK
```json
[
  {
    "id": "65abc789",
    "category": "FOOD",
    "monthlyLimit": 5000.00,
    "spent": 3200.00,
    "remaining": 1800.00,
    "percentageUsed": 64.0,
    "exceeded": false,
    "month": 3,
    "year": 2024
  }
]
```

---

## 🤖 AI Insights Logic

| Rule | Condition | Output |
|------|-----------|--------|
| Overspending | `expense > income` |  Warning with deficit amount |
| Category Overload | `category > 30% of spending` |  Category reduction suggestion |
| Low Savings | `savings < 20% of income` |  Savings plan + target amount |
| Good Savings | `savings >= 20%` |  Positive reinforcement |

---

## 🚢 Deployment

### Backend → Render
1. Push code to GitHub
2. Create a new **Web Service** on Render
3. Select your repo, set:
   - **Build Command**: `cd backend && mvn clean install -DskipTests`
   - **Start Command**: `cd backend && java -jar target/finance-advisor-backend-1.0.0.jar`
4. Add environment variables from `render.yaml`
5. Deploy!

### Frontend → Netlify
1. Push code to GitHub
2. Create new site on Netlify from repo
3. Set:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/build`
4. Add env variable: `REACT_APP_API_URL=https://your-render-backend.onrender.com`
5. Deploy!

---

## 🧪 Testing

Import `FinanceAdvisor.postman_collection.json` into Postman.

1. Run **Register** → token is auto-saved
2. Use any endpoint with `{{token}}` automatically set

### JUnit Tests (Backend)
```bash
cd backend && mvn test
```
Tests cover: TransactionService CRUD, AnalyticsService AI rules, access control.

---

## 🛡️ Security

- **JWT** tokens with 24-hour expiration
- **BCrypt** password hashing
- All routes protected except `/api/auth/**`
- CORS configured for frontend origin
- User isolation — each user sees only their own data

---

## 🔧 Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Java 17, Spring Boot 3.2 |
| Security | Spring Security + JWT |
| Database | MongoDB Atlas |
| ORM | Spring Data MongoDB |
| Frontend | React 18, React Router v6 |
| HTTP | Axios |
