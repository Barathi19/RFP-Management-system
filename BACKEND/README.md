# RFP Management System - Backend

This is the backend service for the AI-powered RFP (Request for Proposal) Management System. It handles RFP creation, vendor management, email-based proposal ingestion using IMAP, and AI-driven analysis using Google Gemini.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose)
- **AI**: Google Gemini (via `@google/generative-ai`)
- **Email**: `nodemailer` (Sending) & `imap` + `mailparser` (Receiving)
- **Validation**: `express-validator`

## Features

- **RFP Management**: Manage RFPs.
- **AI Generation**: Generate structured RFP drafts from natural language inputs.
- **Vendor Management**: Manage vendor contacts and categories.
- **Email Integration**: 
  - Send RFPs to selected vendors via email.
  - Automatically fetch and parse vendor replies using IMAP.
- **Proposal Processing**: 
  - Parses incoming vendor emails (pricing, delivery, specs) into structured JSON using AI.
  - Automatically updates RFP status to `response_received`.
- **Decision Support**: AI-powered comparison and vendor recommendation.

## Prerequisites

- Node.js (v16+)
- MongoDB (Local or Atlas connection string)
- Gmail Account (for sending/receiving RFPs) with **App Password** enabled.
- Google Gemini API Key.

## Installation

1. Clone the repository and navigate to the backend folder:
   ```bash
   cd BACKEND
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Create a `.env` file in the root directory with the following credentials:
   ```env
   PORT=4000
   MONGO_URI=mongodb://localhost:27017/rfp_system
   
   # Google Gemini AI
   GEMINI_API_KEY=your_gemini_api_key_here
   
   # Email Configuration (Gmail)
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_gmail_app_password
   ```

## Running the Application

- **Development Mode** (with nodemon):
  ```bash
  npm run dev
  ```
- **Production Start**:
  ```bash
  npm start
  ```

Server will start on `http://localhost:4000`.

## API Endpoints

### RFPs
- `POST /api/rfp/generate` - Generate RFP preview from text (AI).
- `POST /api/rfp` - Create a new RFP.
- `GET /api/rfp` - List all RFPs.
- `GET /api/rfp/:id` - Get details of a specific RFP.
- `POST /api/rfp/:id/send` - Send RFP to vendors.

### Vendors
- `POST /api/vendor` - Add a new vendor.
- `GET /api/vendor` - List all vendors.

### Proposals
- `GET /api/proposal/rfp/:id` - Fetch & List proposals for an RFP (Triggers IMAP sync).
- `GET /api/proposal/rfp/:id/recommend` - Get AI recommendation for best vendor.

## Folder Structure
- `src/controller` - Request logic.
- `src/models` - Mongoose schemas.
- `src/routes` - API route definitions.
- `src/service` - External services (AI, etc.).
- `src/utils` - Helpers (IMAP, Mailer, etc.).
- `src/validate` - Input validation schemas.
