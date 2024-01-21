CREATE OR REPLACE FUNCTION check_end_date()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.data_sfarsit IS NOT NULL AND NEW.data_sfarsit <= NEW.data_start THEN
        RAISE EXCEPTION 'End date must be higher than the start date';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_end_date_constraint
BEFORE INSERT OR UPDATE ON contract
FOR EACH ROW
EXECUTE FUNCTION check_end_date();