# InsightSphere: Full-Stack Web Analytics Application

InsightSphere is a gorgeous, premium, dark-mode real-time web analytics application designed to capture visitor sessions, page views, and client interaction clicks, providing analytical charts, funnel conversion flow tracking, and database health latency checks.

It is built with **React (Vite)** on the frontend, **Express.js** on the backend, and **SQLite** for lightweight, zero-infra local database storage.

---

## Features

- **Dashboard KPIs**: Session counters, pageviews, bounce rates, and session durations.
- **Traffic Timeseries**: Responsive line chart visualizing visits vs views.
- **Audience Breakdowns**: Doughnut & bar charts for device types, browser clients, and top referral sources.
- **Geographic & Client details**: Table metrics showing traffic sorted by country location and client browser.
- **Real-Time Traffic Simulator**: Background worker simulating live user pathways, page views, and button click interactions.
- **Conversion Funnel Visualizer**: Monitors session progression steps and drop-off rates (`/` → `/pricing` → `/register` → `/dashboard`).
- **System Diagnostics**: Express API status, memory heap usage, database size, and database query latency tracking.

---

## Local Development Setup

To run the application locally on your machine:

1. **Install Dependencies**:
   Run the monorepo script in the root directory:
   ```bash
   npm run install:all
   ```

2. **Start the Application in Development**:
   Run the dev command:
   ```bash
   npm run dev
   ```
   - Frontend Vite Dev Server runs on: `http://localhost:5173`
   - Backend Express Server runs on: `http://localhost:5000`
   *(Vite proxy redirects any `/api/*` request automatically to the backend)*

3. **Start the Application in Production Mode**:
   Run the build script, then start:
   ```bash
   npm run build
   npm start
   ```
   - The compiled static files will be served directly by the Express server on: `http://localhost:5000`

---

## Deployment Guide

We've prepared two standard ways to deploy this application to production: **Render** (e.g. Free Tier) and **Docker**.

### Option A: Deploying to Render (Recommended - Automated Blueprint)

Render makes it extremely simple to deploy this monorepo as a single Web Service using our pre-configured `render.yaml` blueprint.

1. Create a free account on [Render](https://render.com/).
2. Push your project code to a GitHub or GitLab repository.
3. In the Render Dashboard, click **New** → **Blueprint**.
4. Connect your GitHub repository.
5. Render will automatically parse the `render.yaml` file, spin up a new container using the `Dockerfile`, and deploy the app.
6. The service will be live on a public URL (e.g. `https://insightsphere.onrender.com`).

---

### Option B: Deploying manually as a Docker Container

Since the project includes a multi-stage `Dockerfile`, you can compile and deploy it onto any cloud host that supports Docker (Railway, Fly.io, DigitalOcean, etc.).

1. **Build the container image**:
   ```bash
   docker build -t insightsphere:latest .
   ```

2. **Run the container locally**:
   ```bash
   docker run -p 5000:5000 -e PORT=5000 insightsphere:latest
   ```

3. **Deploy to Fly.io**:
   If you have the Fly CLI installed:
   ```bash
   fly launch
   ```
   Fly.io will detect the Dockerfile, build it in the cloud, allocate a persistent volume, and deploy the application.

---

## API Documentation

- `POST /api/events`: Log clicks or page view events.
- `GET /api/analytics/overview`: Retrieve session, pageview, visitor summaries.
- `GET /api/analytics/timeseries`: Retrieve visitors and views over time.
- `GET /api/analytics/breakdowns`: Retrieve top referrer, browser, and device metrics.
- `GET /api/analytics/funnel`: Fetch steps count and conversion rate metrics.
- `GET /api/analytics/live`: Fetch the 50 most recent event logs.
- `GET /api/health`: Fetch database query latency, memory details, and status.
- `POST /api/analytics/simulate`: Request body `{"action": "start" | "stop"}` to trigger live traffic.
