IF OBJECT_ID('dbo.sales_order_lines', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.sales_order_lines (
    order_id NVARCHAR(40) NOT NULL,
    customer_name NVARCHAR(200) NOT NULL,
    order_date DATE NOT NULL,
    line_number INT NOT NULL,
    sku NVARCHAR(80) NOT NULL,
    quantity INT NOT NULL
  );
END;

IF NOT EXISTS (SELECT 1 FROM dbo.sales_order_lines WHERE order_id = '1001' AND line_number = 1)
BEGIN
  INSERT INTO dbo.sales_order_lines(order_id, customer_name, order_date, line_number, sku, quantity)
  VALUES
    ('1001', 'Acme Co', CAST(GETDATE() AS DATE), 1, 'A-001', 2),
    ('1001', 'Acme Co', CAST(GETDATE() AS DATE), 2, 'A-002', 1),
    ('1002', 'Globex', CAST(GETDATE() AS DATE), 1, 'B-001', 7);
END;
