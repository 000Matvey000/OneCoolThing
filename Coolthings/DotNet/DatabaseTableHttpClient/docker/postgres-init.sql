CREATE TABLE IF NOT EXISTS public.sales_order_lines (
  order_id text NOT NULL,
  customer_name text NOT NULL,
  order_date date NOT NULL,
  line_number integer NOT NULL,
  sku text NOT NULL,
  quantity integer NOT NULL
);

INSERT INTO public.sales_order_lines(order_id, customer_name, order_date, line_number, sku, quantity)
VALUES
  ('1001', 'Acme Co', CURRENT_DATE, 1, 'A-001', 2),
  ('1001', 'Acme Co', CURRENT_DATE, 2, 'A-002', 1),
  ('1002', 'Globex', CURRENT_DATE, 1, 'B-001', 7)
ON CONFLICT DO NOTHING;
