# API reference

The API uses JSON and is served under `/api`.

| Environment | Base URL |
|---|---|
| Local | `http://localhost:5000/api` |
| Deployed | `https://<your-api-host>/api` |

## Authentication and responses

Sign in with `POST /auth/login`. Copy the returned token into the `Authorization` header for protected routes:

```http
Authorization: Bearer <token>
Content-Type: application/json
```

Successful responses contain JSON. Errors use `{ "message": "..." }` and an appropriate HTTP status, such as `401` for an invalid/missing login and `403` for insufficient role access. Roles are `administrator`, `receptionist`, and `employee`.

### Authentication routes

| Method | Path | Access | Request / response |
|---|---|---|---|
| `POST` | `/auth/login` | Public | Body: `{ "email", "password" }`; returns `{ "token", "user" }`. Token expires in 12 hours. |
| `GET` | `/auth/me` | Signed in | Returns the current `{ "user" }`. |
| `GET` | `/health` | Public | Returns `{ "status": "ok" }` when the API is running. |

Example login:

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"your-password"}'
```

## Accounts and employees

| Method | Path | Access | Purpose |
|---|---|---|---|
| `GET` | `/users` | Administrator | List user accounts. |
| `POST` | `/users` | Administrator | Create an account. Required: `name`, `email`, `password`, `role`; optional: `department`. Password must be at least 8 characters. |
| `PATCH` | `/users/:id` | Administrator | Update account fields, activation (`active`), or password. |
| `GET` | `/users/employees` | Signed in | List active employees for host selection. |
| `GET` | `/users/:id/workload` | Administrator | Return `{ "pending": <count> }` for the employee. |

Valid `role` values: `administrator`, `receptionist`, `employee`.

## Visitor records

| Method | Path | Access | Purpose |
|---|---|---|---|
| `GET` | `/visitors` | Signed in | List visitor records. Employees see only requests assigned to them. |
| `POST` | `/visitors` | Receptionist, administrator | Register a visitor; starts with `pending` status. |
| `PATCH` | `/visitors/:id/decision` | Assigned employee | Approve or reject a pending request; may include remarks. |
| `PATCH` | `/visitors/:id/remarks` | Assigned employee | Save remarks on an assigned request. |
| `PATCH` | `/visitors/:id/check-in` | Receptionist, administrator | Check in an approved visitor. |
| `PATCH` | `/visitors/:id/check-out` | Receptionist, administrator | Check out a visitor who is currently checked in. |
| `PATCH` | `/visitors/:id/cancel` | Receptionist, administrator | Cancel a pending or approved visit. |

### Registration body

Required fields: `name`, `phone`, `employee`, `visitDate`, `arrivalTime`, and `purpose`. Optional fields: `email`, `company`, `idType`, and `idNumber`.

```json
{
  "name": "Jordan Lee",
  "phone": "+1 555 0100",
  "email": "jordan@example.com",
  "company": "Northwind",
  "idType": "Passport",
  "idNumber": "P1234567",
  "employee": "<employee MongoDB id>",
  "visitDate": "2026-10-07",
  "arrivalTime": "10:30",
  "purpose": "Project meeting"
}
```

`visitDate` uses `YYYY-MM-DD`; `arrivalTime` uses 24-hour `HH:mm`. Valid `idType` values are `National ID`, `Passport`, `Driving licence`, and `Other`.

### Review, remarks, and checkout bodies

```json
{ "decision": "approved", "remarks": "Expected at reception." }
```

`decision` must be `approved` or `rejected`; `remarks` is optional for a decision. To update remarks alone, send `{ "remarks": "Please call the host on arrival." }` to `/remarks`.

Checkout normally uses the current server time. An optional timestamp can be supplied as an ISO date-time:

```json
{ "checkedOutAt": "2026-10-07T12:15:00.000Z" }
```

The checkout timestamp must be later than the stored check-in timestamp.

### Visitor list filters

`GET /visitors` accepts these query parameters:

| Parameter | Meaning |
|---|---|
| `search` | Matches visitor name, employee name/department, phone, company, or purpose. |
| `status` | Filter by status: `pending`, `approved`, `rejected`, `checked-in`, `checked-out`, or `cancelled`. |
| `from`, `to` | Inclusive visit-date range, each in `YYYY-MM-DD` format. |
| `employee` | Filter by employee MongoDB ID; applies to administrator/receptionist views. |

Cancelled records are omitted by default. Request `status=cancelled` to list them explicitly. Results are limited to the latest 500 matching records.

## Dashboard, reports, and activity

| Method | Path | Access | Purpose |
|---|---|---|---|
| `GET` | `/dashboard` | Signed in | Role-aware counts and the latest visitor records. |
| `GET` | `/reports?period=today` | Administrator | Today's summary, daily breakdown, and visitor rows. |
| `GET` | `/reports?period=week` | Administrator | Current Monday–Sunday summary and visitor rows. |
| `GET` | `/reports?period=custom&from=YYYY-MM-DD&to=YYYY-MM-DD` | Administrator | Summary for the inclusive custom date range. |
| `GET` | `/activity` | Administrator | Latest audit events, including visitor, action, actor, and timestamp. |

`/activity` supports optional `action`, `search` (visitor name), `from`, and `to` filters. Activity and report results are limited to 500 records/rows.

## Visitor status flow

```text
pending ──> approved ──> checked-in ──> checked-out
   │            │
   ├─> rejected └─> cancelled
   └─> cancelled
```

Only the assigned employee can decide a request or edit its remarks. Only receptionists and administrators can register, check in/out, or cancel visits. A visitor must be approved before check-in.
