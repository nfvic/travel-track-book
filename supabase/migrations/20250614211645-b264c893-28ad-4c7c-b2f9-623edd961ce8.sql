
-- Create 'orders' table with booking_id and automatic updated_at trigger
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  bus_id UUID NULL,
  route_id UUID NULL,
  booking_id UUID NULL,
  stripe_session_id TEXT UNIQUE,
  amount INTEGER NOT NULL,             -- Amount in cents, required
  currency TEXT NOT NULL DEFAULT 'usd',
  status TEXT,                         -- e.g., 'pending', 'paid', 'failed'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Make sure Row Level Security is enabled.
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Select: Users can view their own orders
CREATE POLICY "select_own_orders" ON orders
  FOR SELECT
  USING (user_id = auth.uid());

-- Insert: Users can create their own orders
CREATE POLICY "insert_own_orders" ON orders
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Update: Users can update their own orders
CREATE POLICY "update_own_orders" ON orders
  FOR UPDATE
  USING (user_id = auth.uid());

-- Optional: Allow users to soft-delete their own orders
CREATE POLICY "delete_own_orders" ON orders
  FOR DELETE
  USING (user_id = auth.uid());

-- Function to auto-update updated_at on row changes
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger: before updating an order, update updated_at
CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
