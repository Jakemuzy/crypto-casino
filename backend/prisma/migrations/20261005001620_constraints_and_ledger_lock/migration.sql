-- This is an empty migration.
ALTER TABLE wallets
  ADD CONSTRAINT wallets_balance_nonneg CHECK (balance >= 0),
  ADD CONSTRAINT wallets_locked_nonneg CHECK (locked_balance >= 0);

CREATE FUNCTION ledger_immutable() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'ledger_entries is append-only';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ledger_no_update_delete
  BEFORE UPDATE OR DELETE ON ledger_entries
  FOR EACH ROW EXECUTE FUNCTION ledger_immutable();
