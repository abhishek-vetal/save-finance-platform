# SAVE — AI-Powered Personal Finance Platform

SAVE is a full-stack personal finance platform that helps users manage their finances, track transactions, create budgets, connect bank accounts, and gain AI-powered insights into their spending.

## Live Demo

[View Live Demo](https://save-finance-platform.vercel.app/)

## Features

- Create and manage financial accounts
- Connect bank accounts using Plaid
- Automatically synchronize bank transactions
- Categorize and manage transactions
- Create and track monthly budgets
- Receive budget alerts when spending reaches 80% of the budget
- Generate monthly financial reports
- Get AI-powered spending insights
- Scan receipts using AI and extract transaction details
- View transaction analytics and spending trends
- Responsive interface for desktop and mobile devices
- Authentication and user-specific financial data

## AI Features

### AI Financial Insights

The application uses the Gemini API to analyze financial data and provide spending insights in monthly financial reports.

### AI Receipt Scanning

Users can upload a receipt and use AI to extract relevant transaction information such as:

- Amount
- Date
- Transaction details
- Description

The extracted information can then be reviewed and confirmed by the user.

## Bank Integration

The application uses Plaid to connect users' bank accounts and synchronize transaction data.

The synchronization workflow handles:

- New transactions
- Updated transactions
- Removed transactions
- Duplicate transaction prevention

## Budget Management

Users can create monthly budgets and track their spending against them.

When spending reaches 80% of a budget, the application can send an alert using Inngest and Resend.

## Transaction Analytics

Transaction data is visualized using Recharts, allowing users to analyze their financial activity across different time periods, including:

- 7 days
- 1 month
- 3 months
- 6 months
- All transactions

## Tech Stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Recharts

### Backend

- Next.js
- Prisma
- PostgreSQL

### Authentication

- Clerk

### Financial Data

- Plaid

### AI

- Gemini API

### Background Jobs & Email

- Inngest
- Resend

### Validation

- Zod

## Security & Data Handling

- User authentication with Clerk
- User-specific financial data access
- Database-backed transaction management
- Duplicate transaction prevention
- Database-backed rate limiting for transaction creation

## What I Practiced

This project helped me practice:

- Building a full-stack application with Next.js
- Designing database schemas with Prisma and PostgreSQL
- Integrating third-party APIs
- Working with financial data through Plaid
- Implementing authentication and user-specific data access
- Building AI-powered application features
- Processing uploaded receipts with AI
- Implementing background workflows
- Sending transactional emails
- Building financial dashboards and data visualizations
- Implementing database-backed rate limiting
- Building responsive interfaces with React and shadcn/ui

## Getting Started

Clone the repository and install the dependencies:

```bash
npm install
