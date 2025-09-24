/*
  # Create RSI alerts and trades tables

  1. New Tables
    - `rsi_alerts`
      - `id` (uuid, primary key)
      - `symbol` (text)
      - `rsi` (numeric)
      - `price` (numeric)
      - `level` (numeric)
      - `timeframe` (text)
      - `created_at` (timestamp)
    - `paper_trades`
      - `id` (uuid, primary key)
      - `symbol` (text)
      - `side` (text)
      - `entry_price` (numeric)
      - `tp` (numeric)
      - `sl` (numeric)
      - `qty` (numeric)
      - `status` (text)
      - `opened_at` (timestamp)
      - `closed_at` (timestamp, nullable)
      - `close_price` (numeric, nullable)
      - `profit` (numeric, nullable)
      - `reason` (text, nullable)
      - `alert_id` (uuid, nullable, foreign key)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for public access (since this is a demo app)
*/

CREATE TABLE IF NOT EXISTS rsi_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol text NOT NULL,
  rsi numeric NOT NULL,
  price numeric NOT NULL,
  level numeric NOT NULL,
  timeframe text NOT NULL DEFAULT '5m',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS paper_trades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol text NOT NULL,
  side text NOT NULL CHECK (side IN ('BUY', 'SELL')),
  entry_price numeric NOT NULL,
  tp numeric NOT NULL,
  sl numeric NOT NULL,
  qty numeric NOT NULL,
  status text NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'CLOSED')),
  opened_at timestamptz NOT NULL,
  closed_at timestamptz,
  close_price numeric,
  profit numeric,
  reason text CHECK (reason IN ('TP', 'SL', 'MANUAL')),
  alert_id uuid REFERENCES rsi_alerts(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE rsi_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE paper_trades ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (demo purposes)
CREATE POLICY "Allow public read access on rsi_alerts"
  ON rsi_alerts
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert access on rsi_alerts"
  ON rsi_alerts
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public read access on paper_trades"
  ON paper_trades
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert access on paper_trades"
  ON paper_trades
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update access on paper_trades"
  ON paper_trades
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_rsi_alerts_symbol_created_at ON rsi_alerts(symbol, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rsi_alerts_timeframe ON rsi_alerts(timeframe);
CREATE INDEX IF NOT EXISTS idx_paper_trades_status ON paper_trades(status);
CREATE INDEX IF NOT EXISTS idx_paper_trades_symbol ON paper_trades(symbol);
CREATE INDEX IF NOT EXISTS idx_paper_trades_created_at ON paper_trades(created_at DESC);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for paper_trades
CREATE TRIGGER update_paper_trades_updated_at
    BEFORE UPDATE ON paper_trades
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();