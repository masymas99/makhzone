-- SQLite-compatible schema generated from makhzone (2).sql
-- حذف ENGINE, COLLATE, AUTO_INCREMENT, UNSIGNED, DEFAULT CHARSET, InnoDB
-- تعديل أنواع البيانات غير المدعومة

PRAGMA foreign_keys = ON;

CREATE TABLE cache (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  expiration INTEGER NOT NULL
);

CREATE TABLE cache_locks (
  key TEXT PRIMARY KEY,
  owner TEXT NOT NULL,
  expiration INTEGER NOT NULL
);

CREATE TABLE expenses (
  ExpenseID INTEGER PRIMARY KEY AUTOINCREMENT,
  ExpenseDate DATE NOT NULL,
  Description TEXT NOT NULL,
  Amount REAL NOT NULL,
  created_at TEXT,
  updated_at TEXT
);

CREATE TABLE failed_jobs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  uuid TEXT UNIQUE NOT NULL,
  connection TEXT NOT NULL,
  queue TEXT NOT NULL,
  payload TEXT NOT NULL,
  exception TEXT NOT NULL,
  failed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE inventory_batches (
  BatchID INTEGER PRIMARY KEY AUTOINCREMENT,
  ProductID INTEGER NOT NULL,
  PurchaseID INTEGER,
  BatchNumber TEXT UNIQUE NOT NULL,
  Quantity INTEGER NOT NULL DEFAULT 0,
  UnitCost REAL NOT NULL DEFAULT 0.00,
  PurchaseDate TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TEXT,
  updated_at TEXT,
  FOREIGN KEY(ProductID) REFERENCES products(ProductID) ON DELETE CASCADE,
  FOREIGN KEY(PurchaseID) REFERENCES purchases(PurchaseID) ON DELETE CASCADE
);

CREATE TABLE jobs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  queue TEXT NOT NULL,
  payload TEXT NOT NULL,
  attempts INTEGER NOT NULL,
  reserved_at INTEGER,
  available_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE TABLE job_batches (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  total_jobs INTEGER NOT NULL,
  pending_jobs INTEGER NOT NULL,
  failed_jobs INTEGER NOT NULL,
  failed_job_ids TEXT NOT NULL,
  options TEXT,
  cancelled_at INTEGER,
  created_at INTEGER NOT NULL,
  finished_at INTEGER
);

CREATE TABLE migrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  migration TEXT NOT NULL,
  batch INTEGER NOT NULL
);

CREATE TABLE password_reset_tokens (
  email TEXT PRIMARY KEY,
  token TEXT NOT NULL,
  created_at TEXT
);

CREATE TABLE payments (
  PaymentID INTEGER PRIMARY KEY AUTOINCREMENT,
  TraderID INTEGER NOT NULL,
  SaleID INTEGER,
  PaymentDate DATE NOT NULL,
  Amount REAL NOT NULL,
  created_at TEXT,
  updated_at TEXT,
  FOREIGN KEY(TraderID) REFERENCES traders(TraderID),
  FOREIGN KEY(SaleID) REFERENCES sales(SaleID)
);

CREATE TABLE products (
  ProductID INTEGER PRIMARY KEY AUTOINCREMENT,
  ProductName TEXT NOT NULL,
  Category TEXT NOT NULL DEFAULT 'General',
  StockQuantity INTEGER NOT NULL,
  UnitPrice REAL NOT NULL,
  UnitCost REAL NOT NULL,
  IsActive INTEGER NOT NULL DEFAULT 1,
  created_at TEXT,
  updated_at TEXT
);

CREATE TABLE purchases (
  PurchaseID INTEGER PRIMARY KEY AUTOINCREMENT,
  ProductID INTEGER,
  Quantity INTEGER NOT NULL DEFAULT 0,
  UnitCost REAL NOT NULL DEFAULT 0.00,
  TotalAmount REAL NOT NULL DEFAULT 0.00,
  TraderID INTEGER,
  BatchNumber TEXT,
  PurchaseDate TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  SupplierName TEXT,
  Notes TEXT,
  created_at TEXT,
  updated_at TEXT,
  FOREIGN KEY(ProductID) REFERENCES products(ProductID) ON DELETE CASCADE,
  FOREIGN KEY(TraderID) REFERENCES traders(TraderID) ON DELETE CASCADE
);

CREATE TABLE purchase_details (
  PurchaseDetailID INTEGER PRIMARY KEY AUTOINCREMENT,
  PurchaseID INTEGER NOT NULL,
  ProductID INTEGER NOT NULL,
  Quantity INTEGER NOT NULL DEFAULT 0,
  UnitCost REAL NOT NULL DEFAULT 0.00,
  SubTotal REAL NOT NULL DEFAULT 0.00,
  created_at TEXT,
  updated_at TEXT,
  FOREIGN KEY(PurchaseID) REFERENCES purchases(PurchaseID) ON DELETE CASCADE,
  FOREIGN KEY(ProductID) REFERENCES products(ProductID) ON DELETE CASCADE
);

CREATE TABLE sales (
  SaleID INTEGER PRIMARY KEY AUTOINCREMENT,
  InvoiceNumber TEXT,
  TraderID INTEGER NOT NULL,
  SaleDate DATE NOT NULL,
  TotalAmount REAL NOT NULL,
  PaidAmount REAL NOT NULL DEFAULT 0.00,
  RemainingAmount REAL NOT NULL DEFAULT 0.00,
  Status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT,
  updated_at TEXT,
  FOREIGN KEY(TraderID) REFERENCES traders(TraderID)
);

CREATE TABLE sale_details (
  SaleDetailID INTEGER PRIMARY KEY AUTOINCREMENT,
  SaleID INTEGER NOT NULL,
  ProductID INTEGER NOT NULL,
  Quantity INTEGER NOT NULL,
  UnitPrice REAL NOT NULL,
  UnitCost REAL NOT NULL DEFAULT 0.00,
  SubTotal REAL NOT NULL,
  Profit REAL NOT NULL DEFAULT 0.00,
  created_at TEXT,
  updated_at TEXT,
  FOREIGN KEY(SaleID) REFERENCES sales(SaleID),
  FOREIGN KEY(ProductID) REFERENCES products(ProductID)
);

CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  user_id INTEGER,
  ip_address TEXT,
  user_agent TEXT,
  payload TEXT NOT NULL,
  last_activity INTEGER NOT NULL
);

CREATE TABLE suppliers (
  SupplierID INTEGER PRIMARY KEY AUTOINCREMENT,
  Name TEXT NOT NULL,
  Phone TEXT NOT NULL,
  Address TEXT NOT NULL,
  IsActive INTEGER NOT NULL DEFAULT 1,
  created_at TEXT,
  updated_at TEXT
);

CREATE TABLE traders (
  TraderID INTEGER PRIMARY KEY AUTOINCREMENT,
  TraderName TEXT NOT NULL,
  Phone TEXT NOT NULL,
  Address TEXT NOT NULL,
  Balance REAL NOT NULL DEFAULT 0.00,
  TotalSales REAL NOT NULL DEFAULT 0.00,
  TotalPayments REAL NOT NULL DEFAULT 0.00,
  IsActive INTEGER NOT NULL DEFAULT 1,
  created_at TEXT,
  updated_at TEXT
);

CREATE TABLE trader_financials (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  trader_id INTEGER NOT NULL,
  sale_id INTEGER,
  payment_id INTEGER,
  sale_amount REAL NOT NULL DEFAULT 0.00,
  payment_amount REAL NOT NULL DEFAULT 0.00,
  balance REAL NOT NULL,
  total_sales REAL NOT NULL DEFAULT 0.00,
  total_payments REAL NOT NULL DEFAULT 0.00,
  remaining_amount REAL NOT NULL,
  transaction_type TEXT NOT NULL,
  description TEXT,
  created_at TEXT,
  updated_at TEXT,
  FOREIGN KEY(trader_id) REFERENCES traders(TraderID) ON DELETE CASCADE,
  FOREIGN KEY(sale_id) REFERENCES sales(SaleID) ON DELETE CASCADE,
  FOREIGN KEY(payment_id) REFERENCES payments(PaymentID) ON DELETE CASCADE
);

CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  email_verified_at TEXT,
  password TEXT NOT NULL,
  remember_token TEXT,
  created_at TEXT,
  updated_at TEXT
);
