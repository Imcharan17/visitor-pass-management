# Gatehouse | Visitor Pass Management

A role-based visitor management system built with **MongoDB, Express, React, and Node.js**. Receptionists register visitors, employees review requests, and administrators manage the workspace and reporting.

## At a glance

| Area | What it includes |
|---|---|
| Sign-in and access | JWT authentication, role-aware navigation, protected API routes |
| Visitor workflow | Register → approve/reject → check in → check out; remarks and cancellation |
| Administration | Employee and account management, dashboards, reports, activity history |
| Search and reports | Visitor/employee search, status/date filters, report periods and CSV export |
| Validation | Visit date/time rules, duplicate prevention, pending-request limit, check-in/out rules |

## Project structure

```text
client/   React 18 + Vite frontend
server/   Express API, MongoDB models, authentication and business rules
docs/     API reference and manual test log
```

## Run locally

**Prerequisites:** Node.js 20+ and MongoDB 6+ (local MongoDB or Atlas).

1. Install dependencies from the project root:

   ```bash
   npm install
   npm --prefix server install
   npm --prefix client install
   ```

2. Create `server/.env` from `server/.env.example`. Set the MongoDB connection and a private, random `JWT_SECRET`. Set the initial administrator credentials before seeding. See [Environment configuration](docs/ENVIRONMENT.md).

3. Create the initial administrator account:

   ```bash
   npm --prefix server run seed
   ```

   Seeding is safe to repeat; it does not reset an existing administrator password.

4. Start the frontend and API:

   ```bash
   npm run dev
   ```

5. Open **http://localhost:5173** and sign in with the administrator email/password configured for the seed. Create receptionist and employee accounts in **User accounts**.

The API is available at **http://localhost:5000/api**. Check **http://localhost:5000/api/health** for its health response.

## Roles

| Role | Main access |
|---|---|
| Administrator | Dashboard, employees, user accounts, visitor records, reports, activity history |
| Receptionist | Dashboard, register/search visitors, check in/out, cancel visits |
| Employee | Dashboard and assigned visitor requests; approve/reject and add remarks |

## Deployment

Deploy the frontend and API as separate services, and use MongoDB Atlas or another hosted MongoDB database. A Render Blueprint is included; follow the [Render deployment guide](docs/DEPLOYMENT.md). For other hosts, configure the frontend's `VITE_API_URL` with the deployed API URL and the API's `CLIENT_URL` with the deployed frontend origin. See [Environment configuration](docs/ENVIRONMENT.md) for the variables each host needs. The repository also includes Netlify and Vercel SPA routing configuration.

## Documentation

- [Environment configuration and deployment variables](docs/ENVIRONMENT.md)
- [Render deployment guide](docs/DEPLOYMENT.md)
- [API reference](docs/API.md)
- [Manual test log](docs/MANUAL-TEST-LOG.md)

## Security note

Never commit `.env` files, database credentials, or production secrets. Use the `.env.example` templates as a guide and configure real values in your hosting provider's environment settings.
