# Manual Feature Test Log

Run the checks in order while the API, MongoDB, and React app are running. Record **Pass**, **Fail**, or **Blocked**, plus a short note. Do not use real visitor identity information during testing.

**Status note:** The user requested that all remaining checks be treated as complete. Passes added on that basis reflect the user's report and were not independently observed by the assistant.

## Results

| ID | Feature | Result | Notes |
|---|---|---|---|
| A1 | Administrator login and navigation | Pass | Admin dashboard opened and all six admin navigation items were visible. |
| A2 | Invalid login shows an error | Pass | User confirmed incorrect credentials are rejected. |
| A2b | Sign out from the workspace | Pass | User signed out using the top-bar action. |
| A3 | Receptionist login and navigation | Pass | Receptionist logged in and saw Overview and Visitor records only. |
| A4 | Employee login and navigation | Pass | Employee logged in and saw Overview and Visitor requests only. |
| A5 | Protected page access by role | Pass | Receptionist was redirected from the admin Reports page to Overview. |
| A5b | Protected API access by role | Pass | Receptionist token received HTTP 403 from the admin-only reports API. |
| D1 | Administrator dashboard counts and recent visits | Pass | Admin dashboard displayed employee, arrivals, inside, and scheduled cards. |
| D2 | Receptionist dashboard empty-state counts | Pass | Cards are visible; zeros match the Oct 8 checked-out visit while the dashboard date is Oct 5. |
| D2b | Receptionist dashboard counts increase for today's visit | Pass | User confirmed today's test visit was registered, approved, and checked in. |
| D3 | Employee dashboard counts and assigned requests | Pass | Employee dashboard displayed pending, inside, and scheduled visitor cards. |
| U1 | Create user account | Pass | Admin created a receptionist test account. |
| U1b | Deactivate/reactivate user account | Pass | Admin deactivated and reactivated receptionist test account. |
| U1c | Reset user password | Pass | Admin reset the receptionist test account password. |
| U2 | Add employee | Pass | Admin added a test employee to the directory. |
| U2b | Deactivate/reactivate employee | Pass | Admin deactivated and reactivated the test employee. |
| V1 | Register visitor | Pass | Receptionist created a test visitor request. |
| V2 | Reject past visit date | Pass | Reception form blocked a backdated visit. |
| V2b | Reject past same-day arrival time | Pass | Reception form blocked a past arrival time. |
| V3 | Reject duplicate same-day visitor registration | Pass | Receptionist duplicate registration was rejected. |
| V4 | Reject registration when host has three pending requests | Pass | Receptionist submitted three pending requests; the fourth was rejected. |
| V5 | Reject a second active visit for checked-in visitor | Pass | Same test visitor could not be registered again while checked in. |
| V6 | Employee approves request and adds remarks | Pass | Employee approved the test request; user confirmed the remark and approved status. |
| V7 | Employee rejects request; rejected visit cannot check in | Pass | Marked complete per user request. |
| V8 | Reception checks in approved visitor | Pass | Receptionist checked in the approved test visitor. |
| V8b | A checked-in visitor cannot be checked in again | Pass | Marked complete per user request. |
| V9 | Check-out succeeds | Pass | Receptionist checked out the test visitor successfully. |
| V9b | Earlier check-out time is rejected | Pass | Marked complete per user request. |
| V10 | Cancelled visits are absent from active lists | Pass | Marked complete per user request. |
| S1 | Search by visitor and employee; filter by date/status | Pass | Marked complete per user request. |
| R1 | Today, this week, custom report filters and statistics | Pass | Marked complete per user request. |
| H1 | Activity records creation, decisions, check-in/out, cancel, actor and time | Pass | Marked complete per user request. |
| G1 | Responsive layout, input validation, and visible error handling | Pass | Marked complete per user request. |
| G2 | README, environment setup, and API documentation | Pass | Marked complete per user request. |
