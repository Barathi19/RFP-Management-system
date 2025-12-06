# RFP Management System - Frontend

This is the frontend user interface for the AI-powered RFP Management System. It provides a modern, responsive dashboard to manage procurement processes, generate RFPs with AI, and analyze vendor proposals.

## Tech Stack

- **Framework**: React (Vite)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **HTTP Client**: Axios

## Features

- **Dashboard**: Visual pipeline overview of all RFPs with status badges (Created, Sent, Response Received, Closed).
- **AI RFP Builder**: 
  - Input natural language requirements (e.g., "Need 20 laptops...").
  - Preview generated structure before saving.
- **Vendor Management**: Add and manage vendor details.
- **RFP Operations**:
  - Select vendors and send RFPs via email.
  - Sync button to fetch replies from email inbox.
  - View parsed proposals side-by-side.
- **AI Insights**: "Refresh Analysis" button to get an AI recommendation for the best vendor based on price, delivery, and terms.

## Prerequisites

- Node.js (v16+)
- Running Backend server (port 4000 by default).

## Installation

1. Navigate to the frontend folder:
   ```bash
   cd FRONTEND
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Environment Configuration (Optional):
   Create a `.env` file if you need to override defaults:
   ```env
   API_BASE_URL=http://localhost:4000/api
   ```

## Running the Application

- **Development Server**:
  ```bash
  npm run dev
  ```
  Access the app at `http://localhost:5173`.

- **Build for Production**:
  ```bash
  npm run build
  ```

## Key Pages

- **`/` (Dashboard)**: List of all RFPs and their status.
- **`/create-rfp`**: Two-step wizard to AI-generate and create RFPs.
- **`/vendors`**: List and add vendors.
- **`/rfp/:id`**: Detailed view of an RFP, including proposal syncing and comparison tools.
