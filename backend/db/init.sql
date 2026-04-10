-- Leasing Demo - schema + security + seed
-- Run this script after creating an empty database named leasing_demo.
-- Suggested execution:
-- psql -h localhost -U leasing_owner -d leasing_demo -f backend/db/init.sql

CREATE SCHEMA IF NOT EXISTS leasing;
SET search_path TO leasing, public;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'request_type' AND typnamespace = 'leasing'::regnamespace) THEN
    CREATE TYPE leasing.request_type AS ENUM (
      'CERTIFICATE',
      'AUTHORIZATION',
      'PAYMENT_ISSUE',
      'CLAIM',
      'PREPAYMENTS',
      'DOCUMENT_COPY'
    );
  END IF;
END$$;
 
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'request_status' AND typnamespace = 'leasing'::regnamespace) THEN
    CREATE TYPE leasing.request_status AS ENUM (
      'FILED',
      'IN_PROGRESS',
      'RESPONDED',
      'REJECTED',
      'CLOSED'
    );
  ELSIF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'request_status'
      AND n.nspname = 'leasing'
      AND e.enumlabel = 'REJECTED'
  ) THEN
    ALTER TYPE leasing.request_status ADD VALUE 'REJECTED';
  END IF;
END$$;

CREATE TABLE IF NOT EXISTS leasing.app_user (
  user_id UUID PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS leasing.contract (
  contract_id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  operation_number TEXT NOT NULL UNIQUE,
  asset TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('ACTIVE', 'IN_SINIESTRO', 'PENDING_REVIEW', 'CLOSED')),
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  next_milestone TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS leasing.requests (
  request_id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  operation_number TEXT NOT NULL,
  type leasing.request_type NOT NULL,
  description TEXT NOT NULL,
  status leasing.request_status NOT NULL,
  filed_at TIMESTAMP NOT NULL,
  estimated_resolution_date TIMESTAMP NOT NULL,
  operative_id TEXT NULL,
  response_note TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_requests_contract FOREIGN KEY (operation_number)
    REFERENCES leasing.contract(operation_number)
);

CREATE TABLE IF NOT EXISTS leasing.request_attachment (
  attachment_id UUID PRIMARY KEY,
  request_id TEXT NOT NULL REFERENCES leasing.requests(request_id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('image/png', 'image/jpeg', 'application/pdf')),
  file_url TEXT NOT NULL,
  file_size_bytes BIGINT NOT NULL CHECK (file_size_bytes > 0),
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS leasing.request_status_history (
  history_id BIGSERIAL PRIMARY KEY,
  request_id TEXT NOT NULL REFERENCES leasing.requests(request_id) ON DELETE CASCADE,
  old_status leasing.request_status NULL,
  new_status leasing.request_status NOT NULL,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  changed_by TEXT NOT NULL DEFAULT 'system',
  note TEXT NULL
);

CREATE TABLE IF NOT EXISTS leasing.customer_notification (
  notification_id BIGSERIAL PRIMARY KEY,
  customer_id TEXT NOT NULL,
  request_id TEXT NOT NULL REFERENCES leasing.requests(request_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  email_sent BOOLEAN NOT NULL DEFAULT FALSE,
  email_sent_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS leasing.customer_notification_preference (
  customer_id TEXT PRIMARY KEY,
  email_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS leasing.customer_info (
  customer_id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_requests_customer ON leasing.requests(customer_id);
CREATE INDEX IF NOT EXISTS idx_requests_operation ON leasing.requests(operation_number);
CREATE INDEX IF NOT EXISTS idx_requests_status ON leasing.requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_filed_at ON leasing.requests(filed_at DESC);
CREATE INDEX IF NOT EXISTS idx_attachment_request ON leasing.request_attachment(request_id);
CREATE INDEX IF NOT EXISTS idx_status_history_request ON leasing.request_status_history(request_id, changed_at DESC);
CREATE INDEX IF NOT EXISTS idx_customer_notification_customer ON leasing.customer_notification(customer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_customer_notification_read ON leasing.customer_notification(customer_id, is_read);

CREATE OR REPLACE FUNCTION leasing.fn_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_contract_updated_at ON leasing.contract;
CREATE TRIGGER trg_contract_updated_at
BEFORE UPDATE ON leasing.contract
FOR EACH ROW
EXECUTE FUNCTION leasing.fn_set_updated_at();

DROP TRIGGER IF EXISTS trg_requests_updated_at ON leasing.requests;
CREATE TRIGGER trg_requests_updated_at
BEFORE UPDATE ON leasing.requests
FOR EACH ROW
EXECUTE FUNCTION leasing.fn_set_updated_at();

CREATE OR REPLACE FUNCTION leasing.fn_validate_request_status_transition()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.status <> OLD.status THEN
    IF NOT (
      (OLD.status = 'FILED' AND NEW.status IN ('IN_PROGRESS', 'CLOSED')) OR
      (OLD.status = 'IN_PROGRESS' AND NEW.status IN ('RESPONDED', 'CLOSED')) OR
      (OLD.status = 'RESPONDED' AND NEW.status = 'CLOSED') OR
      (OLD.status = 'FILED' AND NEW.status = 'REJECTED') OR
      (OLD.status = 'IN_PROGRESS' AND NEW.status = 'REJECTED') OR
      (OLD.status = 'RESPONDED' AND NEW.status = 'REJECTED') OR
      (OLD.status = NEW.status)
    ) THEN
      RAISE EXCEPTION 'Invalid status transition from % to %', OLD.status, NEW.status;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_requests_status_transition ON leasing.requests;
CREATE TRIGGER trg_requests_status_transition
BEFORE UPDATE OF status ON leasing.requests
FOR EACH ROW
EXECUTE FUNCTION leasing.fn_validate_request_status_transition();

CREATE OR REPLACE FUNCTION leasing.fn_log_request_status_history()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO leasing.request_status_history(request_id, old_status, new_status, changed_by, note)
    VALUES (NEW.request_id, NULL, NEW.status, 'system', 'Initial status');
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' AND NEW.status <> OLD.status THEN
    INSERT INTO leasing.request_status_history(request_id, old_status, new_status, changed_by, note)
    VALUES (NEW.request_id, OLD.status, NEW.status, 'system', COALESCE(NEW.response_note, 'Status updated'));
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_requests_status_history_ins ON leasing.requests;
CREATE TRIGGER trg_requests_status_history_ins
AFTER INSERT ON leasing.requests
FOR EACH ROW
EXECUTE FUNCTION leasing.fn_log_request_status_history();

DROP TRIGGER IF EXISTS trg_requests_status_history_upd ON leasing.requests;
CREATE TRIGGER trg_requests_status_history_upd
AFTER UPDATE OF status ON leasing.requests
FOR EACH ROW
EXECUTE FUNCTION leasing.fn_log_request_status_history();

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'leasing_read') THEN
    GRANT USAGE ON SCHEMA leasing TO leasing_read;
    GRANT SELECT ON ALL TABLES IN SCHEMA leasing TO leasing_read;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'leasing_write') THEN
    GRANT USAGE ON SCHEMA leasing TO leasing_write;
    GRANT SELECT, INSERT, UPDATE, DELETE ON leasing.requests TO leasing_write;
    GRANT SELECT, INSERT, UPDATE, DELETE ON leasing.request_attachment TO leasing_write;
    GRANT SELECT, INSERT, UPDATE, DELETE ON leasing.request_status_history TO leasing_write;
    GRANT SELECT, INSERT, UPDATE, DELETE ON leasing.customer_notification TO leasing_write;
    GRANT SELECT, INSERT, UPDATE, DELETE ON leasing.customer_notification_preference TO leasing_write;
    GRANT SELECT, INSERT, UPDATE, DELETE ON leasing.customer_info TO leasing_write;
    GRANT SELECT ON leasing.contract TO leasing_write;
    GRANT SELECT ON leasing.app_user TO leasing_write;
    GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA leasing TO leasing_write;
  END IF;
END$$;

INSERT INTO leasing.app_user (user_id, username, full_name, email)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'demo_user', 'Usuario Demo', 'demo@leasing.local')
ON CONFLICT (username) DO NOTHING;

INSERT INTO leasing.contract (contract_id, customer_id, operation_number, asset, status, progress, next_milestone)
VALUES
  ('CTR-001', 'CUS-001', 'OP-001', 'Camion Kenworth', 'ACTIVE', 78, 'Entrega de certificado disponible'),
  ('CTR-002', 'CUS-001', 'OP-002', 'Excavadora CAT 320', 'IN_SINIESTRO', 42, 'Peritaje en revision'),
  ('CTR-003', 'CUS-001', 'OP-778', 'Oficina Centro', 'ACTIVE', 88, 'Renovacion documental')
ON CONFLICT (contract_id) DO UPDATE
SET
  customer_id = EXCLUDED.customer_id,
  operation_number = EXCLUDED.operation_number,
  asset = EXCLUDED.asset,
  status = EXCLUDED.status,
  progress = EXCLUDED.progress,
  next_milestone = EXCLUDED.next_milestone;

INSERT INTO leasing.requests (
  request_id, customer_id, operation_number, type, description, status,
  filed_at, estimated_resolution_date, operative_id, response_note
)
VALUES
  ('REQ-1001', 'CUS-001', 'OP-001', 'CERTIFICATE', 'Solicitud de certificado de estado', 'IN_PROGRESS', NOW() - INTERVAL '2 days', NOW() + INTERVAL '3 days', 'OPR-01', NULL),
  ('REQ-1002', 'CUS-001', 'OP-002', 'CLAIM', 'Reporte de siniestro maquinaria', 'IN_PROGRESS', NOW() - INTERVAL '1 day', NOW() + INTERVAL '5 days', 'OPR-02', NULL),
  ('REQ-1003', 'CUS-001', 'OP-778', 'DOCUMENT_COPY', 'Copia de contrato', 'CLOSED', NOW() - INTERVAL '5 days', NOW() - INTERVAL '1 day', 'OPR-03', 'Documento entregado')
ON CONFLICT (request_id) DO UPDATE
SET
  customer_id = EXCLUDED.customer_id,
  operation_number = EXCLUDED.operation_number,
  type = EXCLUDED.type,
  description = EXCLUDED.description,
  status = EXCLUDED.status,
  filed_at = EXCLUDED.filed_at,
  estimated_resolution_date = EXCLUDED.estimated_resolution_date,
  operative_id = EXCLUDED.operative_id,
  response_note = EXCLUDED.response_note;

INSERT INTO leasing.customer_notification_preference (customer_id, email_enabled)
VALUES ('CUS-001', FALSE)
ON CONFLICT (customer_id) DO UPDATE
SET
  email_enabled = EXCLUDED.email_enabled,
  updated_at = NOW();

INSERT INTO leasing.customer_info (customer_id, full_name, email)
VALUES ('CUS-001', 'Cliente Bancolombia', 'tiblackriver@gmail.com')
ON CONFLICT (customer_id) DO UPDATE
SET
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email;

-- Normalize historical UUID request identifiers to REQ-#### format.
DO $$
BEGIN
  CREATE TEMP TABLE tmp_request_id_mapping AS
  WITH base AS (
    SELECT COALESCE(MAX(CAST(SUBSTRING(r.request_id FROM '[0-9]+$') AS INTEGER)), 0) AS max_id
    FROM leasing.requests r
    WHERE r.request_id LIKE 'REQ-%'
  ),
  uuid_rows AS (
    SELECT
      r.request_id AS old_id,
      ROW_NUMBER() OVER (ORDER BY r.filed_at, r.request_id) AS rn
    FROM leasing.requests r
    WHERE r.request_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  )
  SELECT
    u.old_id,
    'REQ-' || LPAD((b.max_id + u.rn)::TEXT, 4, '0') AS new_id
  FROM uuid_rows u
  CROSS JOIN base b;

  INSERT INTO leasing.requests (
    request_id,
    customer_id,
    operation_number,
    type,
    description,
    status,
    filed_at,
    estimated_resolution_date,
    operative_id,
    response_note,
    created_at,
    updated_at
  )
  SELECT
    m.new_id,
    r.customer_id,
    r.operation_number,
    r.type,
    r.description,
    r.status,
    r.filed_at,
    r.estimated_resolution_date,
    r.operative_id,
    r.response_note,
    r.created_at,
    r.updated_at
  FROM leasing.requests r
  JOIN tmp_request_id_mapping m ON m.old_id = r.request_id
  ON CONFLICT (request_id) DO NOTHING;

  UPDATE leasing.request_status_history h
  SET request_id = m.new_id
  FROM tmp_request_id_mapping m
  WHERE h.request_id = m.old_id;

  DELETE FROM leasing.requests r
  USING tmp_request_id_mapping m
  WHERE r.request_id = m.old_id;

  DROP TABLE tmp_request_id_mapping;
END $$;
