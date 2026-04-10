# Database Bootstrap

This folder contains the SQL bootstrap script for the backend demo.

## Prerequisites

- PostgreSQL running locally
- Empty database already created: `leasing_demo`
- Roles already created (as discussed): `leasing_owner`, `leasing_app`, `leasing_read`, `leasing_write`

## Run script

From the repository root:

```powershell
psql -h localhost -U leasing_owner -d leasing_demo -f backend/db/init.sql
```

The script is idempotent for core objects and seed rows.

## What the script creates

- Schema: `leasing`
- Enums: request type and status
- Tables: users, contracts, requests, attachments, status history
- Triggers: updated_at, status transition validation, status history logging
- Seed demo data for contracts and requests
- Grants for `leasing_read` and `leasing_write` when those roles exist
