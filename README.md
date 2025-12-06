# AI-Powered RFP Management System

This is a full-stack MERN application designed to streamline the Request for Proposal (RFP) process. It leverages Generative AI (Google Gemini) to automate RFP creation from natural language and to analyze vendor proposals received via email.

## Project Structure

The project is divided into two main components:

- **[BACKEND](./BACKEND/README.md)**: Node.js/Express server handling API logic, Database (MongoDB), AI integration, and Email processing (IMAP/SMTP).
- **[FRONTEND](./FRONTEND/README.md)**: React (Vite) application providing the user interface for managing RFPs, vendors, and viewing insights.

## Quick Start

To run the entire system locally, you need to start both the backend and frontend servers.

### 1. Start Support Services
Ensure you have **MongoDB** running locally or have a connection string ready.

### 2. Start Backend
```bash
cd BACKEND
npm install
# Ensure .env is configured (see BACKEND/README.md)
npm run dev
```
*Server runs on port 4000.*

### 3. Start Frontend
Open a new terminal:
```bash
cd FRONTEND
npm install
npm run dev
```
*App runs on port 5173.*

## Key Features

1.  **AI RFP Drafts**: Type a simple requirement (e.g., "Need 50 office chairs"), and the system generates a structured RFP.
2.  **Email Sync**: Sent RFPs are tracked, and vendor replies to the system email are automatically fetched and parsed.
3.  **Smart Analysis**: The system extracts pricing and specs from vendor emails and provides AI-driven vendor recommendations.

For detailed documentation, please refer to the `README.md` files in the respective directories.
