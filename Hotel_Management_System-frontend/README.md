# Grand Horizon — Frontend Website

**This repository is frontend-only.** No Java backend, Maven files, MySQL credentials, SQL files, or Spring Boot code are present here.

## Local startup

- Install **Node.js 18+** from https://nodejs.org/ (the frontend uses Node only to serve static files, no npm packages are required).
- Start the separate backend on port **8081** first, then check `http://localhost:8081/api/health`.
- Double-click `RUN_FRONTEND.bat` (or run `node server.js`).
- Open **http://localhost:5500** (not localhost:8081; that is the API only).
- You can register as a customer, browse rooms, book, cancel and see reservations; admins can manage rooms, check guests in/out and view reports.

## Configuration

`config.js` contains a **public API base URL**:

```js
window.HOTEL_API_BASE = "http://localhost:8081";
```

Change it to your deployed backend HTTPS URL if you deploy frontend separately. It must be reachable by the browser. The backend must allow this frontend's origin with `FRONTEND_ORIGINS`.

**Important:** GitHub Pages only publishes the static frontend, not Java or MySQL. Opening a deployed frontend against `localhost:8081` will not work for other visitors; first host your Spring Boot API and database elsewhere and configure the HTTPS URL.

## Technology

- HTML, CSS, vanilla JavaScript, Fetch API
- Node.js built-in static server, no npm install or build step
- JSON REST API with bearer token; token lives in browser **sessionStorage** (cleared when the browser tab session ends)

## GitHub

Create repository `Hotel_Management_System-frontend` and push **this folder only**:

```cmd
git init
git add .
git commit -m "Frontend website"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/Hotel_Management_System-frontend.git
git push -u origin main
```

If `origin` already exists use `git remote set-url origin URL` instead. For GitHub Pages, publish from the root branch folder and ensure your site links, asset paths and backend URL are configured for the deployment path; the provided server and URLs are optimized for local development.
