# Deploy to Render

This repository includes a Render Blueprint at [`render.yaml`](../render.yaml). It creates a free Express API and a static React site. MongoDB is hosted separately; use MongoDB Atlas or another reachable MongoDB service.

## Before you deploy

1. Push the project to a GitHub repository. Confirm `.env` files are ignored and never push database credentials or passwords.
2. Create a MongoDB Atlas database and database user. Copy the connection string for the API's `MONGODB_URI`; replace its username, password, and database name as needed. Configure Atlas network access to allow the Render API to connect. Use a strong, unique database password and grant the user access only to this app's database.
3. Sign in to Render and connect the GitHub repository.

## Create the services

1. In Render, choose **New → Blueprint** and select the repository containing `render.yaml`.
2. When prompted for unsynced variables, provide:

   | Variable | Value |
   |---|---|
   | `MONGODB_URI` | Your Atlas connection string |
   | `ADMIN_EMAIL` | Email for the initial administrator |
   | `ADMIN_PASSWORD` | A new, strong password for that administrator |

   Render generates `JWT_SECRET`. Do not put real secrets in `render.yaml` or the GitHub repository.

3. Apply the Blueprint. Render builds both services. The API startup command runs the seed script; it creates the administrator if that email does not already exist and does not reset an existing password.
4. Copy the **frontend's** public `onrender.com` URL. In the Render dashboard, open the `gatehouse-api` service, go to **Environment**, and add:

   ```text
   CLIENT_URL=https://<your-frontend>.onrender.com
   ```

   Save the change so Render redeploys the API. This allows the browser frontend to call the API. The frontend's API URL is wired to the API service by the Blueprint.

## Check the deployment

1. Open `https://<your-api>.onrender.com/api/health`; expect `{"status":"ok"}`.
2. Open the frontend URL and sign in with the `ADMIN_EMAIL` and `ADMIN_PASSWORD` values you supplied.
3. Create receptionist and employee accounts from **User accounts**, then confirm the visitor workflow.

Free Render web services can sleep while idle, so the first API request after a quiet period may be slow. Wait for it to wake and retry if the first load times out.
