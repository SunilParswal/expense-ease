# ExpenseEase | Modern Financial Tracker & Analytics

ExpenseEase is a full-stack personal finance and expense tracking web application built with Next.js, TypeScript, Tailwind CSS, and MongoDB. It allows users to log transactions, import bulk data, analyze financial metrics through interactive charts, and export structured transaction reports.

## 🔗 Live Application
[https://expense-ease-lyart.vercel.app](https://expense-ease-lyart.vercel.app)

## 🚀 Key Features

- **Income & Expense Tracking**: Comprehensive ledger for logging, categorizing, and filtering personal transactions.
- **Interactive Data Visualizations**: Real-time spending breakdowns and historical trends via charts.
- **Batch CSV Import**: Fast bulk-importing of bank statements and expense logs via CSV files.
- **Report Generation**: Export customized financial summaries in CSV and PDF formats.
- **Customizable Theme**: Native Dark/Light mode toggle with persistence.
- **Responsive Layout**: Designed for seamless accessibility across mobile, tablet, and desktop viewports.

## 🛠️ Tech Stack

| Component | Technology |
| :--- | :--- |
| **Framework** | Next.js (App Router, Server Actions / API Routes) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS, Lucide Icons |
| **Database** | MongoDB with Mongoose ODM |
| **Authentication** | NextAuth.js / Custom JWT Session Management |
| **Email Service** | SendGrid API for transactional notifications and password recovery |

## ⚙️ Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB connection string (local or MongoDB Atlas)

### Environment Configuration
Create a \.env.local\ file in the root directory:
\\env
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_SECRET=your_auth_secret
NEXTAUTH_URL=http://localhost:3000
SENDGRID_API_KEY=your_sendgrid_key
EMAIL_FROM=noreply@yourdomain.com
\
### Installation & Execution

1. **Install dependencies**:
   \\ash
   npm install
   \
2. **Start the development server**:
   \\ash
   npm run dev
   \
3. **Production build**:
   \\ash
   npm run build
   npm start
   \
---
