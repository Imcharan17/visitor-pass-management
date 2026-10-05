# Environment configuration

Configure environment variables separately for the **API** and the **React frontend**. The `.env.example` files contain local-development examples; copy them to `.env` locally and replace placeholder values. Do not commit `.env` files.

## API: `server/.env`

Start with `server/.env.example`:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/visitor_pass
JWT_SECRET=replace-with-a-long-random-secret
CLIENT_URL=http://localhost:5173
ADMIN_NAME=System Administrator
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=ChangeMe123!
```

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | API port; defaults to `5000`. Hosting platforms usually assign this automatically. |
| `MONGODB_URI` | Yes | MongoDB connection URI. Use local MongoDB for development or a hosted cluster URI for deployment. |
| `JWT_SECRET` | Yes | Private signing secret for 12-hour login tokens. Replace the example with a long, random value. |
| `CLIENT_URL` | Recommended | Allowed frontend origin for CORS. Multiple origins can be comma-separated. |
| `ADMIN_NAME` | For first seed | Display name for the initial administrator. |
| `ADMIN_EMAIL` | For first seed | Email for the initial administrator. |
| `ADMIN_PASSWORD` | For first seed | Initial administrator password; at least 8 characters. Change the example before seeding. |

Seed the administrator from the repository root:

```bash
npm --prefix server run seed
```

The seed script does not replace the password of an administrator that already exists.

## Frontend: `client/.env`

Start with `client/.env.example`:

```env
VITE_API_URL=http://localhost:5000/api
```

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | No | API base URL, including `/api`. Defaults to `http://localhost:5000/api` for local use. |

Vite embeds `VITE_*` values in the browser bundle. **Never put secrets** (database passwords, JWT secrets, or admin passwords) in frontend environment variables.

## Hosting configuration

Set values in the hosting provider's environment-variable settings; do not upload `.env` files.

| Service | Variables |
|---|---|
| Express API | `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL`, and optionally `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` for initial seeding. The host supplies `PORT`. |
| React site | `VITE_API_URL=https://<your-api-host>/api` |

Set `CLIENT_URL` to the exact deployed website origin, for example `https://your-site.example`. If the site has preview/staging origins, add them as comma-separated values. Rebuild/redeploy the frontend after changing `VITE_API_URL`.

For the included Render setup, see the step-by-step [deployment guide](DEPLOYMENT.md). Its Blueprint wires the frontend API URL automatically; after both services receive public URLs, set `CLIENT_URL` on the API service to the frontend's exact public origin.
