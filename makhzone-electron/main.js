const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const backend = express();
backend.use(cors());
const PORT = 3001;

// إعداد قاعدة البيانات SQLite
const dbPath = path.join(app.getPath('userData'), 'makhzone.db');
let db;

function initDatabase() {
  db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('فشل فتح قاعدة البيانات:', err);
    } else {
      console.log('تم فتح قاعدة البيانات بنجاح');
      db.serialize(() => {
        const ddl = `
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          email_verified_at DATETIME,
          remember_token TEXT,
          created_at DATETIME,
          updated_at DATETIME
        );
        CREATE TABLE IF NOT EXISTS suppliers (
          SupplierID INTEGER PRIMARY KEY AUTOINCREMENT,
          Name TEXT NOT NULL,
          Phone TEXT NOT NULL,
          Address TEXT NOT NULL,
          IsActive INTEGER NOT NULL DEFAULT 1,
          created_at DATETIME,
          updated_at DATETIME
        );
        CREATE TABLE IF NOT EXISTS products (
          ProductID INTEGER PRIMARY KEY AUTOINCREMENT,
          ProductName TEXT NOT NULL,
          Category TEXT NOT NULL DEFAULT 'General',
          StockQuantity INTEGER NOT NULL,
          UnitPrice REAL NOT NULL,
          UnitCost REAL NOT NULL,
          IsActive INTEGER NOT NULL DEFAULT 1,
          created_at DATETIME,
          updated_at DATETIME
        );
        CREATE TABLE IF NOT EXISTS traders (
          TraderID INTEGER PRIMARY KEY AUTOINCREMENT,
          TraderName TEXT NOT NULL,
          Phone TEXT NOT NULL,
          Address TEXT NOT NULL,
          Balance REAL NOT NULL DEFAULT 0,
          TotalSales REAL NOT NULL DEFAULT 0,
          TotalPayments REAL NOT NULL DEFAULT 0,
          IsActive INTEGER NOT NULL DEFAULT 1,
          created_at DATETIME,
          updated_at DATETIME
        );
        CREATE TABLE IF NOT EXISTS sales (
          SaleID INTEGER PRIMARY KEY AUTOINCREMENT,
          InvoiceNumber TEXT,
          TraderID INTEGER NOT NULL,
          SaleDate DATE NOT NULL,
          TotalAmount REAL NOT NULL,
          PaidAmount REAL NOT NULL DEFAULT 0,
          RemainingAmount REAL NOT NULL DEFAULT 0,
          Status TEXT NOT NULL DEFAULT 'pending',
          created_at DATETIME,
          updated_at DATETIME
        );
        CREATE TABLE IF NOT EXISTS sale_details (
          SaleDetailID INTEGER PRIMARY KEY AUTOINCREMENT,
          SaleID INTEGER NOT NULL,
          ProductID INTEGER NOT NULL,
          Quantity INTEGER NOT NULL,
          UnitPrice REAL NOT NULL,
          UnitCost REAL NOT NULL DEFAULT 0,
          SubTotal REAL NOT NULL,
          Profit REAL NOT NULL DEFAULT 0,
          created_at DATETIME,
          updated_at DATETIME
        );
        CREATE TABLE IF NOT EXISTS purchases (
          PurchaseID INTEGER PRIMARY KEY AUTOINCREMENT,
          ProductID INTEGER,
          Quantity INTEGER NOT NULL DEFAULT 0,
          UnitCost REAL NOT NULL DEFAULT 0,
          TotalAmount REAL NOT NULL DEFAULT 0,
          TraderID INTEGER,
          BatchNumber TEXT,
          PurchaseDate DATETIME DEFAULT CURRENT_TIMESTAMP,
          SupplierName TEXT,
          Notes TEXT,
          created_at DATETIME,
          updated_at DATETIME
        );
        CREATE TABLE IF NOT EXISTS purchase_details (
          PurchaseDetailID INTEGER PRIMARY KEY AUTOINCREMENT,
          PurchaseID INTEGER NOT NULL,
          ProductID INTEGER NOT NULL,
          Quantity INTEGER NOT NULL DEFAULT 0,
          UnitCost REAL NOT NULL DEFAULT 0,
          SubTotal REAL NOT NULL DEFAULT 0,
          created_at DATETIME,
          updated_at DATETIME
        );
        CREATE TABLE IF NOT EXISTS expenses (
          ExpenseID INTEGER PRIMARY KEY AUTOINCREMENT,
          ExpenseDate DATE NOT NULL,
          Description TEXT NOT NULL,
          Amount REAL NOT NULL,
          created_at DATETIME,
          updated_at DATETIME
        );
        CREATE TABLE IF NOT EXISTS payments (
          PaymentID INTEGER PRIMARY KEY AUTOINCREMENT,
          TraderID INTEGER NOT NULL,
          SaleID INTEGER,
          PaymentDate DATE NOT NULL,
          Amount REAL NOT NULL,
          created_at DATETIME,
          updated_at DATETIME
        );
        CREATE TABLE IF NOT EXISTS trader_financials (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          trader_id INTEGER NOT NULL,
          sale_id INTEGER,
          payment_id INTEGER,
          sale_amount REAL NOT NULL DEFAULT 0,
          payment_amount REAL NOT NULL DEFAULT 0,
          balance REAL NOT NULL,
          total_sales REAL NOT NULL DEFAULT 0,
          total_payments REAL NOT NULL DEFAULT 0,
          remaining_amount REAL NOT NULL,
          transaction_type TEXT NOT NULL,
          description TEXT,
          created_at DATETIME,
          updated_at DATETIME
        );
        `;
        db.exec(ddl, (err) => {
          if (err) {
            console.error('فشل إنشاء الجداول:', err);
          } else {
            console.log('تم إنشاء جميع الجداول أو موجودة بالفعل');
          }
        });
      });
    }
  });
}

// إعداد API بسيط (مثال: تسجيل مستخدم)
backend.use(express.json());
backend.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'جميع الحقول مطلوبة.' });
  }
  // تحقق من البريد الإلكتروني المكرر
  db.get('SELECT id FROM users WHERE email = ?', [email], async (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'خطأ في قاعدة البيانات.' });
    }
    if (row) {
      return res.status(400).json({ error: 'البريد الإلكتروني مستخدم بالفعل.' });
    }
    // تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(password, 10);
    db.run('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hashedPassword], function(err) {
      if (err) {
        return res.status(400).json({ error: 'خطأ في التسجيل.' });
      }
      res.json({ id: this.lastID, name, email });
    });
  });
});

// تسجيل دخول المستخدم
backend.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'جميع الحقول مطلوبة.' });
  }
  db.get('SELECT id, name, email, password FROM users WHERE email = ?', [email], async (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'خطأ في قاعدة البيانات.' });
    }
    if (!row) {
      return res.status(400).json({ error: 'بيانات اعتماد غير صحيحة.' });
    }
    const match = await bcrypt.compare(password, row.password);
    if (!match) {
      return res.status(400).json({ error: 'بيانات اعتماد غير صحيحة.' });
    }
    res.json({ id: row.id, name: row.name, email: row.email });
  });
});

// Sales endpoints
backend.get('/api/sales', (req, res) => {
  db.all('SELECT * FROM sales', [], (err, sales) => {
    if (err) return res.status(500).json({ error: 'خطأ في استرجاع المبيعات' });
    const result = [];
    let count = sales.length;
    if (count === 0) return res.json([]);
    sales.forEach(sale => {
      db.all('SELECT sd.*, p.ProductName, p.UnitPrice, p.UnitCost FROM sale_details sd JOIN products p ON sd.ProductID = p.ProductID WHERE sd.SaleID = ?', [sale.SaleID], (err, details) => {
        if (err) details = [];
        db.get('SELECT TraderID, TraderName FROM traders WHERE TraderID = ?', [sale.TraderID], (err, trader) => {
          result.push({ ...sale, trader: trader || null, details });
          if (--count === 0) res.json(result);
        });
      });
    });
  });
});

backend.post('/api/sales', (req, res) => {
  const { TraderID, PaidAmount, products } = req.body;
  if (!TraderID || PaidAmount == null || !Array.isArray(products)) {
    return res.status(400).json({ error: 'بيانات غير كاملة' });
  }
  const now = new Date().toISOString();
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');
    db.run(
      'INSERT INTO sales (TraderID, SaleDate, TotalAmount, PaidAmount, RemainingAmount, Status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [TraderID, now, 0, PaidAmount, 0, 'pending', now, now],
      function(err) {
        if (err) {
          db.run('ROLLBACK');
          return res.status(500).json({ error: 'خطأ في إنشاء الفاتورة' });
        }
        const saleID = this.lastID;
        let totalAmount = 0;
        products.forEach(item => {
          const subTotal = item.Quantity * item.UnitPrice;
          totalAmount += subTotal;
          db.run(
            'INSERT INTO sale_details (SaleID, ProductID, Quantity, UnitPrice, SubTotal, Profit, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [saleID, item.ProductID, item.Quantity, item.UnitPrice, subTotal, subTotal - (item.Quantity * item.UnitCost), now, now]
          );
          db.run(
            'UPDATE products SET StockQuantity = StockQuantity - ? WHERE ProductID = ?',
            [item.Quantity, item.ProductID]
          );
        });
        const remaining = totalAmount - PaidAmount;
        db.run(
          'UPDATE sales SET TotalAmount = ?, RemainingAmount = ?, updated_at = ? WHERE SaleID = ?',
          [totalAmount, remaining, now, saleID]
        );
        db.run(
          'UPDATE traders SET Balance = Balance + ?, TotalSales = TotalSales + ?, updated_at = ? WHERE TraderID = ?',
          [totalAmount, totalAmount, now, TraderID]
        );
        db.run('COMMIT', err => {
          if (err) return res.status(500).json({ error: 'خطأ في حفظ المعاملة' });
          res.json({ saleID, totalAmount, remaining });
        });
      }
    );
  });
});

// Products endpoints
backend.get('/api/products', (req, res) => {
  db.all('SELECT * FROM products', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'خطأ في استرجاع المنتجات' });
    res.json(rows);
  });
});
backend.get('/api/products/:id', (req, res) => {
  db.get('SELECT * FROM products WHERE ProductID = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: 'خطأ في استرجاع المنتج' });
    if (!row) return res.status(404).json({ error: 'المنتج غير موجود' });
    res.json(row);
  });
});
backend.post('/api/products', (req, res) => {
  const { ProductName, Category, StockQuantity, UnitPrice, UnitCost, IsActive } = req.body;
  if (!ProductName) return res.status(400).json({ error: 'اسم المنتج مطلوب' });
  const now = new Date().toISOString();
  db.run(
    'INSERT INTO products (ProductName, Category, StockQuantity, UnitPrice, UnitCost, IsActive, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [ProductName, Category || 'General', StockQuantity || 0, UnitPrice || 0, UnitCost || 0, IsActive ? 1 : 0, now, now],
    function(err) {
      if (err) return res.status(500).json({ error: 'خطأ في إنشاء المنتج' });
      res.json({ ProductID: this.lastID });
    }
  );
});
backend.put('/api/products/:id', (req, res) => {
  const { ProductName, Category, StockQuantity, UnitPrice, UnitCost, IsActive } = req.body;
  const now = new Date().toISOString();
  db.run(
    'UPDATE products SET ProductName = ?, Category = ?, StockQuantity = ?, UnitPrice = ?, UnitCost = ?, IsActive = ?, updated_at = ? WHERE ProductID = ?',
    [ProductName, Category || 'General', StockQuantity || 0, UnitPrice || 0, UnitCost || 0, IsActive ? 1 : 0, now, req.params.id],
    function(err) {
      if (err) return res.status(500).json({ error: 'خطأ في تحديث المنتج' });
      res.json({ changes: this.changes });
    }
  );
});
backend.delete('/api/products/:id', (req, res) => {
  db.run('DELETE FROM products WHERE ProductID = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: 'خطأ في حذف المنتج' });
    res.json({ deleted: this.changes });
  });
});

// Traders endpoints
backend.get('/api/traders', (req, res) => {
  db.all('SELECT * FROM traders', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'خطأ في استرجاع التجار' });
    res.json(rows);
  });
});
backend.get('/api/traders/:id', (req, res) => {
  db.get('SELECT * FROM traders WHERE TraderID = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: 'خطأ في استرجاع التاجر' });
    if (!row) return res.status(404).json({ error: 'التاجر غير موجود' });
    res.json(row);
  });
});
// Trader financials
backend.get('/api/traders/financials', (req, res) => {
  db.all('SELECT * FROM trader_financials', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'خطأ في استرجاع السجلات المالية' });
    res.json(rows);
  });
});

// Routes للمشتريات
backend.get('/api/purchases', (req, res) => {
  db.all(`
    SELECT p.*,
    pd.Quantity AS detail_quantity,
    pd.UnitCost AS detail_unit_cost,
    pr.ProductName,
    s.Name AS SupplierName
    FROM purchases p
    LEFT JOIN purchase_details pd ON p.PurchaseID = pd.PurchaseID
    LEFT JOIN products pr ON p.ProductID = pr.ProductID
    LEFT JOIN suppliers s ON p.SupplierName = s.Name
  `, (err, rows) => {
    if (err) {
      console.error('خطأ في استعلام المشتريات:', err);
      return res.status(500).json({ error: 'خطأ في استرجاع البيانات' });
    }
    res.json(rows);
  });
});

backend.post('/api/purchases', (req, res) => {
  const purchase = req.body;
  if (!purchase.ProductID || !purchase.Quantity || !purchase.UnitCost || !purchase.SupplierName) {
    return res.status(400).json({ error: 'البيانات الأساسية للمشتريات مطلوبة' });
  }

  db.run(
    `INSERT INTO purchases (
      ProductID,
      Quantity,
      UnitCost,
      SupplierName,
      TraderID,
      created_at,
      updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      purchase.ProductID,
      purchase.Quantity,
      purchase.UnitCost,
      purchase.SupplierName,
      purchase.TraderID || null,
      new Date().toISOString(),
      new Date().toISOString()
    ],
    function(err) {
      if (err) {
        console.error('خطأ في قاعدة البيانات:', err);
        return res.status(500).json({ error: 'فشل في تسجيل المشتريات' });
      }
      res.json({
        id: this.lastID,
        message: 'تم تسجيل المشتريات بنجاح'
      });
    }
  );
});

// Routes للمصروفات
backend.get('/api/expenses', (req, res) => {
  const { startDate, endDate } = req.query;
  let query = 'SELECT * FROM expenses';
  const params = [];

  if (startDate && endDate) {
    query += ' WHERE ExpenseDate BETWEEN ? AND ?';
    params.push(startDate, endDate);
  }

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('خطأ في استعلام المصروفات:', err);
      return res.status(500).json({ error: 'خطأ في استرجاع البيانات' });
    }
    res.json(rows);
  });
});

backend.post('/api/expenses', (req, res) => {
  const expense = req.body;
  db.run(
    'INSERT INTO expenses (ExpenseDate, Description, Amount) VALUES (?, ?, ?)',
    [new Date().toISOString(), expense.description, expense.amount],
    function(err) {
      err ? res.status(500).send() : res.json({ id: this.lastID });
    }
  );
});

// Routes للدفعات
backend.get('/api/payments', (req, res) => {
  db.all('SELECT * FROM payments', (err, rows) => res.json(rows));
});

backend.get('/api/payments/:id', (req, res) => {
  db.get('SELECT * FROM payments WHERE PaymentID = ?', [req.params.id], (err, row) => {
    row ? res.json(row) : res.status(404).json({ error: 'غير موجود' });
  });
});

backend.get('/api/traders/:id/financials', (req, res) => {
  db.all('SELECT * FROM trader_financials WHERE trader_id = ?', [req.params.id], (err, rows) => {
    if (err) return res.status(500).json({ error: 'خطأ في استرجاع السجلات المالية للتاجر' });
    res.json(rows);
  });
});

// Routes للدفعات
backend.get('/api/payments/:id', (req, res) => {
  db.get('SELECT * FROM payments WHERE PaymentID = ?', [req.params.id], (err, row) => row ? res.json(row) : res.status(404).json({ error: 'غير موجود' }));
});

// CRUD Sales
backend.get('/api/sales/:id', (req, res) => {
  db.get('SELECT * FROM sales WHERE SaleID = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: 'خطأ في استرجاع الفاتورة' });
    if (!row) return res.status(404).json({ error: 'الفاتورة غير موجودة' });
    res.json(row);
  });
});
backend.put('/api/sales/:id', (req, res) => {
  const { TraderID, PaidAmount, Status } = req.body;
  const now = new Date().toISOString();
  db.run(
    'UPDATE sales SET TraderID = ?, PaidAmount = ?, Status = ?, updated_at = ? WHERE SaleID = ?',
    [TraderID, PaidAmount, Status, now, req.params.id],
    function(err) {
      if (err) return res.status(500).json({ error: 'خطأ في تحديث الفاتورة' });
      res.json({ changes: this.changes });
    }
  );
});
backend.delete('/api/sales/:id', (req, res) => {
  db.run('DELETE FROM sales WHERE SaleID = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: 'خطأ في حذف الفاتورة' });
    res.json({ deleted: this.changes });
  });
});

// CRUD Purchases
backend.put('/api/purchases/:id', (req, res) => {
  const p = req.body;
  const now = new Date().toISOString();
  db.run(
    'UPDATE purchases SET ProductID = ?, Quantity = ?, UnitCost = ?, SupplierName = ?, TraderID = ?, updated_at = ? WHERE PurchaseID = ?',
    [p.ProductID, p.Quantity, p.UnitCost, p.SupplierName, p.TraderID, now, req.params.id],
    function(err) {
      if (err) return res.status(500).json({ error: 'خطأ في تحديث المشتريات' });
      res.json({ changes: this.changes });
    }
  );
});
backend.delete('/api/purchases/:id', (req, res) => {
  db.run('DELETE FROM purchases WHERE PurchaseID = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: 'خطأ في حذف المشتريات' });
    res.json({ deleted: this.changes });
  });
});

// CRUD Expenses
backend.put('/api/expenses/:id', (req, res) => {
  const { description, amount, ExpenseDate } = req.body;
  const now = new Date().toISOString();
  db.run(
    'UPDATE expenses SET Description = ?, Amount = ?, ExpenseDate = ?, updated_at = ? WHERE ExpenseID = ?',
    [description, amount, ExpenseDate, now, req.params.id],
    function(err) {
      if (err) return res.status(500).json({ error: 'خطأ في تحديث المصروف' });
      res.json({ changes: this.changes });
    }
  );
});
backend.delete('/api/expenses/:id', (req, res) => {
  db.run('DELETE FROM expenses WHERE ExpenseID = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: 'خطأ في حذف المصروف' });
    res.json({ deleted: this.changes });
  });
});

// CRUD Payments
backend.post('/api/payments', (req, res) => {
  const { TraderID, Amount, PaymentDate, SaleID } = req.body;
  const now = new Date().toISOString();
  db.run(
    'INSERT INTO payments (TraderID, Amount, PaymentDate, SaleID, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
    [TraderID, Amount, PaymentDate || now, SaleID || null, now, now],
    function(err) {
      if (err) return res.status(500).json({ error: 'خطأ في إنشاء الدفعة' });
      res.json({ id: this.lastID });
    }
  );
});
backend.put('/api/payments/:id', (req, res) => {
  const { Amount, PaymentDate, SaleID } = req.body;
  const now = new Date().toISOString();
  db.run(
    'UPDATE payments SET Amount = ?, PaymentDate = ?, SaleID = ?, updated_at = ? WHERE PaymentID = ?',
    [Amount, PaymentDate, SaleID, now, req.params.id],
    function(err) {
      if (err) return res.status(500).json({ error: 'خطأ في تحديث الدفعة' });
      res.json({ changes: this.changes });
    }
  );
});
backend.delete('/api/payments/:id', (req, res) => {
  db.run('DELETE FROM payments WHERE PaymentID = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: 'خطأ في حذف الدفعة' });
    res.json({ deleted: this.changes });
  });
});

// CRUD Traders
backend.post('/api/traders', (req, res) => {
  const { TraderName, Phone, Address, IsActive } = req.body;
  if (!TraderName) return res.status(400).json({ error: 'اسم التاجر مطلوب' });
  const now = new Date().toISOString();
  db.run(
    'INSERT INTO traders (TraderName, Phone, Address, IsActive, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
    [TraderName, Phone, Address, IsActive ? 1 : 0, now, now],
    function(err) {
      if (err) return res.status(500).json({ error: 'خطأ في إنشاء التاجر' });
      res.json({ TraderID: this.lastID });
    }
  );
});
backend.put('/api/traders/:id', (req, res) => {
  const { TraderName, Phone, Address, IsActive } = req.body;
  const now = new Date().toISOString();
  db.run(
    'UPDATE traders SET TraderName = ?, Phone = ?, Address = ?, IsActive = ?, updated_at = ? WHERE TraderID = ?',
    [TraderName, Phone, Address, IsActive ? 1 : 0, now, req.params.id],
    function(err) {
      if (err) return res.status(500).json({ error: 'خطأ في تحديث التاجر' });
      res.json({ changes: this.changes });
    }
  );
});
backend.delete('/api/traders/:id', (req, res) => {
  db.run('DELETE FROM traders WHERE TraderID = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: 'خطأ في حذف التاجر' });
    res.json({ deleted: this.changes });
  });
});

backend.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  win.loadFile(path.join(__dirname, 'index.html'));
}

app.whenReady().then(() => {
  initDatabase();
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  if (db) {
    db.close((err) => {
      if (err) {
        console.error('خطأ عند إغلاق قاعدة البيانات:', err);
      } else {
        console.log('تم إغلاق قاعدة البيانات');
      }
    });
  }
});
