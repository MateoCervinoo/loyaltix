ALTER TABLE beneficio
ADD COLUMN IF NOT EXISTS profesion_id BIGINT;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'fk_beneficio_profesion'
    ) THEN
        ALTER TABLE beneficio
        ADD CONSTRAINT fk_beneficio_profesion
        FOREIGN KEY (profesion_id) REFERENCES profesion(id);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_beneficio_profesion
ON beneficio(profesion_id);
