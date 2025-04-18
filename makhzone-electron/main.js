const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const backend = express();
backend.use(cors());
backend.use(express.json());
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

    // Create sale
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

        // Add sale details
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

        // Update sale totals
        const remaining = totalAmount - PaidAmount;
        db.run(
          'UPDATE sales SET TotalAmount = ?, RemainingAmount = ?, updated_at = ? WHERE SaleID = ?',
          [totalAmount, remaining, now, saleID]
        );

        // Record payment in payments table if PaidAmount > 0
        if (PaidAmount > 0) {
          db.run(
            'INSERT INTO payments (TraderID, SaleID, PaymentDate, Amount, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
            [TraderID, saleID, now, PaidAmount, now, now],
            function(err) {
              if (err) {
                db.run('ROLLBACK');
                return res.status(500).json({ error: 'خطأ في تسجيل الدفعة' });
              }
              const paymentID = this.lastID;

              // Update trader_financials
              db.run(
                'INSERT INTO trader_financials (trader_id, sale_id, payment_id, sale_amount, payment_amount, balance, total_sales, total_payments, remaining_amount, transaction_type, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [TraderID, saleID, paymentID, totalAmount, PaidAmount, totalAmount - PaidAmount, totalAmount, PaidAmount, remaining, 'sale', 'فاتورة مبيعات', now, now]
              );
            }
          );
        } else {
          // Update trader_financials without payment
          db.run(
            'INSERT INTO trader_financials (trader_id, sale_id, sale_amount, balance, total_sales, remaining_amount, transaction_type, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [TraderID, saleID, totalAmount, totalAmount, totalAmount, remaining, 'sale', 'فاتورة مبيعات', now, now]
          );
        }

        // Update trader's totals using the latest financial record
        db.get(
          'SELECT total_sales, total_payments FROM trader_financials WHERE trader_id = ? ORDER BY created_at DESC LIMIT 1',
          [TraderID],
          (err, lastRecord) => {
            if (err) {
              db.run('ROLLBACK');
              return res.status(500).json({ error: 'خطأ في تحديث رصيد التاجر' });
            }
            const totalSales = (lastRecord?.total_sales || 0) + totalAmount;
            const totalPayments = (lastRecord?.total_payments || 0) + (PaidAmount || 0);

            db.run(
              'UPDATE traders SET Balance = Balance + ?, TotalSales = ?, TotalPayments = ?, updated_at = ? WHERE TraderID = ?',
              [totalAmount - PaidAmount, totalSales, totalPayments, now, TraderID]
            );

            db.run('COMMIT', err => {
              if (err) {
                db.run('ROLLBACK');
                return res.status(500).json({ error: 'خطأ في حفظ المعاملة' });
              }
              res.json({ saleID: this.lastID, totalAmount, remaining });
            });
          }
        );
      }
    );
  });
});

backend.get('/api/sales/:id', (req, res) => {
  const id = req.params.id;
  db.get('SELECT * FROM sales WHERE SaleID = ?', [id], (err, sale) => {
    if (err || !sale) return res.status(404).json({ error: 'فاتورة غير موجودة' });
    db.all(
      'SELECT sd.*, p.ProductName, p.UnitPrice, p.UnitCost FROM sale_details sd JOIN products p ON sd.ProductID = p.ProductID WHERE sd.SaleID = ?',
      [id],
      (err, details) => {
        if (err) details = [];
        db.get('SELECT TraderID, TraderName FROM traders WHERE TraderID = ?', [sale.TraderID], (err, trader) => {
          res.json({ ...sale, trader: trader || null, details });
        });
      }
    );
  });
});

backend.put('/api/sales/:id', (req, res) => {
  const id = req.params.id;
  const { TraderID, PaidAmount, products } = req.body;
  if (!TraderID || PaidAmount == null || !Array.isArray(products)) return res.status(400).json({ error: 'بيانات غير كاملة' });
  const now = new Date().toISOString();
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');
    db.get('SELECT * FROM sales WHERE SaleID = ?', [id], (err, sale) => {
      if (err || !sale) return res.status(404).json({ error: 'فاتورة غير موجودة' });
      db.all('SELECT * FROM sale_details WHERE SaleID = ?', [id], (err, oldDetails) => {
        oldDetails.forEach(d => { db.run('UPDATE products SET StockQuantity = StockQuantity + ? WHERE ProductID = ?', [d.Quantity, d.ProductID]); });
        db.run('UPDATE traders SET Balance = Balance - ?, TotalSales = TotalSales - ? WHERE TraderID = ?', [sale.TotalAmount, sale.TotalAmount, sale.TraderID]);
        db.run('DELETE FROM sale_details WHERE SaleID = ?', [id]);
        let totalAmount = 0;
        products.forEach(item => {
          const subTotal = item.Quantity * item.UnitPrice;
          totalAmount += subTotal;
          db.run(
            'INSERT INTO sale_details (SaleID, ProductID, Quantity, UnitPrice, SubTotal, Profit, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [id, item.ProductID, item.Quantity, item.UnitPrice, subTotal, subTotal - (item.Quantity * item.UnitCost), now, now]
          );
          db.run(
            'UPDATE products SET StockQuantity = StockQuantity - ? WHERE ProductID = ?',
            [item.Quantity, item.ProductID]
          );
        });
        const remaining = totalAmount - PaidAmount;
        db.run(
          'UPDATE sales SET TotalAmount = ?, PaidAmount = ?, RemainingAmount = ?, updated_at = ? WHERE SaleID = ?',
          [totalAmount, PaidAmount, remaining, now, id]
        );
        db.run('UPDATE traders SET Balance = Balance + ?, TotalSales = TotalSales + ? WHERE TraderID = ?', [totalAmount, totalAmount, TraderID]);
        db.run('COMMIT', err => {
          if (err) { db.run('ROLLBACK'); return res.status(500).json({ error: 'فشل تحديث الفاتورة' }); }
          res.json({ saleID: id, totalAmount, remaining });
        });
      });
    });
  });
});

backend.delete('/api/sales/:id', (req, res) => {
  const id = req.params.id;
  db.serialize(() => {
    db.get('SELECT * FROM sales WHERE SaleID = ?', [id], (err, sale) => {
      if (err || !sale) return res.status(404).json({ error: 'فاتورة غير موجودة' });
      db.all('SELECT * FROM sale_details WHERE SaleID = ?', [id], (err, details) => {
        details.forEach(d => {
          db.run('UPDATE products SET StockQuantity = StockQuantity + ? WHERE ProductID = ?', [d.Quantity, d.ProductID]);
        });
        db.run('UPDATE traders SET Balance = Balance - ?, TotalSales = TotalSales - ? WHERE TraderID = ?', [sale.TotalAmount, sale.TotalAmount, sale.TraderID]);
        db.run('DELETE FROM sale_details WHERE SaleID = ?', [id]);
        db.run('DELETE FROM sales WHERE SaleID = ?', [id], function(err) {
          if (err) return res.status(500).json({ error: 'خطأ في حذف الفاتورة' });
          res.json({ deleted: this.changes });
        });
      });
    });
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

// نقاط نهاية المصروفات
backend.get('/api/expenses', (req, res) => {
  db.all('SELECT * FROM expenses', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'خطأ في استرجاع المصروفات' });
    res.json(rows);
  });
});

backend.get('/api/expenses/:id', (req, res) => {
  db.get('SELECT * FROM expenses WHERE ExpenseID = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: 'خطأ في استرجاع المصروف' });
    if (!row) return res.status(404).json({ error: 'المصروف غير موجود' });
    res.json(row);
  });
});

backend.post('/api/expenses', (req, res) => {
  const { ExpenseDate, Description, Amount } = req.body;
  if (!ExpenseDate || !Description || !Amount) return res.status(400).json({ error: 'جميع الحقول مطلوبة' });
  const now = new Date().toISOString();
  db.run(
    'INSERT INTO expenses (ExpenseDate, Description, Amount, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
    [ExpenseDate, Description, Amount, now, now],
    function(err) {
      if (err) return res.status(500).json({ error: 'خطأ في إنشاء المصروف' });
      res.json({ ExpenseID: this.lastID });
    }
  );
});

backend.put('/api/expenses/:id', (req, res) => {
  const { ExpenseDate, Description, Amount } = req.body;
  const now = new Date().toISOString();
  db.run(
    'UPDATE expenses SET ExpenseDate = ?, Description = ?, Amount = ?, updated_at = ? WHERE ExpenseID = ?',
    [ExpenseDate, Description, Amount, now, req.params.id],
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
    LEFT JOIN products pr ON pd.ProductID = pr.ProductID

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
  const { supplier_name, notes, products } = req.body;
  if (!supplier_name || !Array.isArray(products)) return res.status(400).json({ error: 'بيانات غير كاملة' });
  const now = new Date().toISOString();
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');
    
    // Create purchase record
    db.run(
      'INSERT INTO purchases (SupplierName, PurchaseDate, TotalAmount, Notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
      [supplier_name, now, 0, notes || '', now, now],
      function(err) {
        if (err) {
          db.run('ROLLBACK');
          return res.status(500).json({ error: 'خطأ في إنشاء المشتريات' });
        }
        const purchaseID = this.lastID;
        let totalAmount = 0;
        
        products.forEach(item => {
          const { product_id, product_name, category, quantity, unit_cost, unit_price } = item;
          
          // If product exists, update its cost
          if (product_id) {
            db.get('SELECT StockQuantity, UnitCost FROM products WHERE ProductID = ?', [product_id], (err, product) => {
              if (err) {
                db.run('ROLLBACK');
                return res.status(500).json({ error: 'خطأ في تحديث المنتج' });
              }
              
              const oldQuantity = product.StockQuantity || 0;
              const oldCost = product.UnitCost || 0;
              const newQuantity = quantity;
              const newCost = unit_cost;
              
              // Calculate weighted average cost
              const totalOldCost = oldQuantity * oldCost;
              const totalNewCost = newQuantity * newCost;
              const totalQuantity = oldQuantity + newQuantity;
              const newUnitCost = (totalOldCost + totalNewCost) / totalQuantity;
              
              // Update product
              db.run(
                'UPDATE products SET StockQuantity = StockQuantity + ?, UnitCost = ?, updated_at = ? WHERE ProductID = ?',
                [quantity, newUnitCost, now, product_id]
              );
            });
          } else {
            // New product
            db.run(
              'INSERT INTO products (ProductName, Category, StockQuantity, UnitPrice, UnitCost, IsActive, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
              [product_name, category, quantity, unit_price, unit_cost, 1, now, now],
              function(err) { 
                if (err) {
                  db.run('ROLLBACK');
                  return res.status(500).json({ error: 'خطأ في إضافة المنتج الجديد' });
                }
              }
            );
          }
          
          // Calculate subtotal for purchase details
          const subTotal = quantity * unit_cost;
          totalAmount += subTotal;
          
          // Add purchase detail
          db.run(
            'INSERT INTO purchase_details (PurchaseID, ProductID, Quantity, UnitCost, SubTotal, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [purchaseID, product_id, quantity, unit_cost, subTotal, now, now]
          );
        });
        
        // Update total amount in purchase
        db.run(
          'UPDATE purchases SET TotalAmount = ?, updated_at = ? WHERE PurchaseID = ?',
          [totalAmount, now, purchaseID]
        );
        
        db.run('COMMIT', err => {
          if (err) {
            db.run('ROLLBACK');
            return res.status(500).json({ error: 'خطأ في حفظ المشتريات' });
          }
          res.json({ purchaseID, totalAmount });
        });
      }
    );
  });
});

backend.put('/api/purchases/:id', (req, res) => {
  const purchaseID = req.params.id;
  const { supplier_name, notes, products } = req.body;
  
  if (!supplier_name || !Array.isArray(products)) {
    return res.status(400).json({ error: 'بيانات غير كاملة' });
  }
  
  const now = new Date().toISOString();
  
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');
    
    // Get current purchase details
    db.get(
      'SELECT * FROM purchases WHERE PurchaseID = ?',
      [purchaseID],
      (err, purchase) => {
        if (err || !purchase) {
          db.run('ROLLBACK');
          return res.status(404).json({ error: 'المشتريات غير موجودة' });
        }
        
        // Get current purchase details
        db.all(
          'SELECT * FROM purchase_details WHERE PurchaseID = ?',
          [purchaseID],
          (err, oldDetails) => {
            if (err) {
              db.run('ROLLBACK');
              return res.status(500).json({ error: 'خطأ في استرجاع تفاصيل المشتريات' });
            }
            
            // Update purchase record
            db.run(
              'UPDATE purchases SET SupplierName = ?, Notes = ?, updated_at = ? WHERE PurchaseID = ?',
              [supplier_name, notes || '', now, purchaseID]
            );
            
            // Update product quantities for old details (subtract old quantities)
            oldDetails.forEach(detail => {
              db.run(
                'UPDATE products SET StockQuantity = StockQuantity - ? WHERE ProductID = ?',
                [detail.Quantity, detail.ProductID]
              );
            });
            
            // Delete old purchase details
            db.run('DELETE FROM purchase_details WHERE PurchaseID = ?', [purchaseID]);
            
            let totalAmount = 0;
            
            // Add new purchase details and update product quantities
            products.forEach(item => {
              const { product_id, product_name, category, quantity, unit_cost, unit_price } = item;
              
              // If product exists, update its cost
              if (product_id) {
                db.get('SELECT StockQuantity, UnitCost FROM products WHERE ProductID = ?', [product_id], (err, product) => {
                  if (err) {
                    db.run('ROLLBACK');
                    return res.status(500).json({ error: 'خطأ في تحديث المنتج' });
                  }
                  
                  const oldQuantity = product.StockQuantity || 0;
                  const oldCost = product.UnitCost || 0;
                  const newQuantity = quantity;
                  const newCost = unit_cost;
                  
                  // Calculate weighted average cost
                  const totalOldCost = oldQuantity * oldCost;
                  const totalNewCost = newQuantity * newCost;
                  const totalQuantity = oldQuantity + newQuantity;
                  const newUnitCost = (totalOldCost + totalNewCost) / totalQuantity;
                  
                  // Update product
                  db.run(
                    'UPDATE products SET StockQuantity = StockQuantity + ?, UnitCost = ?, updated_at = ? WHERE ProductID = ?',
                    [quantity, newUnitCost, now, product_id]
                  );
                });
              } else {
                // New product
                db.run(
                  'INSERT INTO products (ProductName, Category, StockQuantity, UnitPrice, UnitCost, IsActive, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                  [product_name, category, quantity, unit_price, unit_cost, 1, now, now],
                  function(err) {
                    if (err) {
                      db.run('ROLLBACK');
                      return res.status(500).json({ error: 'خطأ في إضافة المنتج الجديد' });
                    }
                  }
                );
              }
              
              // Calculate subtotal for purchase details
              const subTotal = quantity * unit_cost;
              totalAmount += subTotal;
              
              // Add purchase detail
              db.run(
                'INSERT INTO purchase_details (PurchaseID, ProductID, Quantity, UnitCost, SubTotal, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [purchaseID, product_id, quantity, unit_cost, subTotal, now, now]
              );
            });
            
            // Update total amount in purchase
            db.run(
              'UPDATE purchases SET TotalAmount = ?, updated_at = ? WHERE PurchaseID = ?',
              [totalAmount, now, purchaseID]
            );
            
            db.run('COMMIT', err => {
              if (err) {
                db.run('ROLLBACK');
                return res.status(500).json({ error: 'خطأ في تحديث المشتريات' });
              }
              res.json({ purchaseID, totalAmount });
            });
          }
        );
      }
    );
  });
});

backend.delete('/api/purchases/:id', (req, res) => {
  const purchaseID = req.params.id;
  const now = new Date().toISOString();
  
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');
    
    // Get purchase details to update product quantities
    db.all(
      'SELECT * FROM purchase_details WHERE PurchaseID = ?',
      [purchaseID],
      (err, details) => {
        if (err) {
          db.run('ROLLBACK');
          return res.status(500).json({ error: 'خطأ في استرجاع تفاصيل المشتريات' });
        }
        
        // Update product quantities (subtract quantities)
        details.forEach(detail => {
          db.run(
            'UPDATE products SET StockQuantity = StockQuantity - ? WHERE ProductID = ?',
            [detail.Quantity, detail.ProductID]
          );
        });
        
        // Delete purchase details
        db.run('DELETE FROM purchase_details WHERE PurchaseID = ?', [purchaseID]);
        
        // Delete purchase
        db.run('DELETE FROM purchases WHERE PurchaseID = ?', [purchaseID], function(err) {
          if (err) {
            db.run('ROLLBACK');
            return res.status(500).json({ error: 'خطأ في حذف المشتريات' });
          }
          
          db.run('COMMIT', err => {
            if (err) {
              db.run('ROLLBACK');
              return res.status(500).json({ error: 'خطأ في حفظ التغييرات' });
            }
            res.json({ deleted: this.changes });
          });
        });
      }
    );
  });
});

// Get single purchase details
backend.get('/api/purchases/:id', (req, res) => {
  const id = req.params.id;
  db.get('SELECT * FROM purchases WHERE PurchaseID = ?', [id], (err, purchase) => {
    if (err || !purchase) return res.status(404).json({ error: 'المشتريات غير موجودة' });
    db.all(
      'SELECT pd.Quantity AS quantity, pd.UnitCost AS unit_cost, pd.SubTotal AS sub_total, pr.ProductName FROM purchase_details pd JOIN products pr ON pd.ProductID = pr.ProductID WHERE pd.PurchaseID = ?',
      [id],
      (err, details) => {
        if (err) details = [];
        res.json({ ...purchase, details });
      }
    );
  });
});

// Get all expenses
backend.get('/api/expenses', (req, res) => {
  db.all('SELECT * FROM expenses ORDER BY ExpenseDate DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'خطأ في جلب بيانات المصروفات' });
    res.json(rows);
  });
});

// Delete expense
backend.delete('/api/expenses/:id', (req, res) => {
  db.run('DELETE FROM expenses WHERE ExpenseID = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: 'خطأ في حذف المصروف' });
    res.json({ deleted: this.changes });
  });
});

// CRUD Payments
backend.post('/api/payments', (req, res) => {
  const { TraderID, Amount, PaymentDate, SaleID } = req.body;
  if (!TraderID || Amount == null) {
    return res.status(400).json({ error: 'بيانات غير كاملة' });
  }
  const now = PaymentDate || new Date().toISOString();
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');

    // Record the payment
    db.run(
      'INSERT INTO payments (TraderID, SaleID, PaymentDate, Amount, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
      [TraderID, SaleID || null, now, Amount, now, now],
      function(err) {
        if (err) {
          db.run('ROLLBACK');
          return res.status(500).json({ error: 'خطأ في تسجيل الدفعة' });
        }

        // Update the sale if SaleID is provided
        if (SaleID) {
          db.get('SELECT * FROM sales WHERE SaleID = ?', [SaleID], (err, sale) => {
            if (err || !sale) {
              db.run('ROLLBACK');
              return res.status(500).json({ error: 'فاتورة غير موجودة' });
            }
            const newPaidAmount = sale.PaidAmount + Amount;
            const newRemaining = sale.TotalAmount - newPaidAmount;

            db.run(
              'UPDATE sales SET PaidAmount = ?, RemainingAmount = ?, updated_at = ? WHERE SaleID = ?',
              [newPaidAmount, newRemaining, now, SaleID]
            );
          });
        }

        // Get current financial data for the trader
        db.get(
          'SELECT t.Balance, t.TotalSales, t.TotalPayments, f.balance as last_balance, f.total_sales as last_total_sales, f.total_payments as last_total_payments FROM traders t LEFT JOIN trader_financials f ON t.TraderID = f.trader_id WHERE t.TraderID = ? ORDER BY f.created_at DESC LIMIT 1',
          [TraderID],
          (err, financials) => {
            if (err) {
              db.run('ROLLBACK');
              return res.status(500).json({ error: 'خطأ في تحديث الرصيد' });
            }

            const currentBalance = financials.last_balance || 0;
            const currentTotalSales = financials.last_total_sales || 0;
            const currentTotalPayments = financials.last_total_payments || 0;

            const newTotalPayments = currentTotalPayments + Amount;
            const newBalance = currentTotalSales - newTotalPayments;

            // Update trader's record
            db.run(
              'UPDATE traders SET Balance = ?, TotalPayments = ?, updated_at = ? WHERE TraderID = ?',
              [newBalance, newTotalPayments, now, TraderID]
            );

            // Update trader financials
            db.run(
              'INSERT INTO trader_financials (trader_id, payment_id, payment_amount, balance, total_sales, total_payments, remaining_amount, transaction_type, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
              [TraderID, this.lastID, Amount, newBalance, currentTotalSales, newTotalPayments, newBalance, 'payment', 'دفعة جديدة', now, now]
            );

            db.run('COMMIT', err => {
              if (err) {
                db.run('ROLLBACK');
                return res.status(500).json({ error: 'خطأ في حفظ المعاملة' });
              }
              res.json({ success: true, paymentID: this.lastID });
            });
          }
        );
      }
    );
  });
});

backend.get('/api/payments/:traderId', (req, res) => {
  const traderId = req.params.traderId;
  db.all(
    'SELECT p.*, s.InvoiceNumber, s.TotalAmount FROM payments p LEFT JOIN sales s ON p.SaleID = s.SaleID WHERE p.TraderID = ? ORDER BY p.PaymentDate DESC',
    [traderId],
    (err, payments) => {
      if (err) return res.status(500).json({ error: 'خطأ في استرجاع الدفعات' });
      res.json(payments);
    }
  );
});

// CRUD Payments
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
    'INSERT INTO traders (TraderName, Phone, Address, Balance, TotalSales, TotalPayments, IsActive, created_at, updated_at) VALUES (?, ?, ?, 0, 0, 0, ?, ?, ?)',
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

// Manual payments endpoint
backend.post('/api/manual-payments', (req, res) => {
  const { TraderID, Amount, PaymentDate, Note } = req.body;
  console.log('Received payment data:', { TraderID, Amount, PaymentDate, Note });

  // Validate input
  if (!TraderID || !Amount || !PaymentDate) {
    return res.status(400).json({ error: 'جميع الحقول المطلوبة غير مكتملة' });
  }

  const amount = parseFloat(Amount);
  if (isNaN(amount) || amount <= 0) {
    return res.status(400).json({ error: 'المبلغ غير صالح' });
  }

  const now = new Date().toISOString();

  db.serialize(() => {
    db.run('BEGIN TRANSACTION');

    // First check if trader exists
    db.get('SELECT * FROM traders WHERE TraderID = ?', [TraderID], (err, trader) => {
      if (err) {
        console.error('Error checking trader:', err);
        db.run('ROLLBACK');
        return res.status(500).json({ error: 'خطأ في التحقق من التاجر' });
      }
      if (!trader) {
        db.run('ROLLBACK');
        return res.status(400).json({ error: 'التاجر غير موجود' });
      }

      // Record payment
      db.run(
        'INSERT INTO payments (TraderID, Amount, PaymentDate, Notes, created_at) VALUES (?, ?, ?, ?, datetime(\'now\'))',
        [TraderID, Amount, PaymentDate || new Date().toISOString(), Note || ''],
        function(err) {
          if (err) {
            console.error('Error inserting payment:', err);
            db.run('ROLLBACK');
            return res.status(500).json({ error: 'خطأ في تسجيل الدفعة', details: err.message });
          }
          const paymentID = this.lastID;
          console.log('Payment inserted successfully with ID:', paymentID);

          // Update trader_financials
          db.get(
            'SELECT total_payments, total_sales FROM trader_financials WHERE trader_id = ? ORDER BY created_at DESC LIMIT 1',
            [TraderID],
            (err, lastRecord) => {
              if (err) {
                console.error('Error getting last record:', err);
                db.run('ROLLBACK');
                return res.status(500).json({ error: 'خطأ في تحديث رصيد التاجر', details: err.message });
              }

              const totalPayments = (lastRecord?.total_payments || 0) + amount;
              const totalSales = lastRecord?.total_sales || 0;
              const balance = totalSales - totalPayments;

              db.run(
                'INSERT INTO trader_financials (trader_id, payment_id, payment_amount, balance, total_sales, total_payments, remaining_amount, transaction_type, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [TraderID, paymentID, amount, balance, totalSales, totalPayments, balance, 'payment', 'دفعة يدوية', now, now]
              );

              db.run('COMMIT', function(err) {
                if (err) {
                  console.error('Error committing transaction:', err);
                  return res.status(500).json({ error: 'خطأ في إكمال المعاملة', details: err.message });
                }

                return res.json({
                  message: 'تم إضافة الدفعة بنجاح',
                  paymentID: paymentID,
                  updatedBalance: balance
                });
              });
            }
          );
        }
      );
    });
  });
});

// Get all payments
backend.get('/api/payments', (req, res) => {
  db.all(
    `SELECT p.PaymentID, p.TraderID, t.TraderName, p.SaleID, p.PaymentDate, p.Amount, p.created_at, p.updated_at
     FROM payments p
     LEFT JOIN traders t ON p.TraderID = t.TraderID
     ORDER BY p.PaymentDate DESC`,
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: 'خطأ في استرجاع الدفعات' });
      res.json(rows);
    }
  );
});

// Get all payments for a trader
backend.get('/api/payments/trader/:traderId', (req, res) => {
  const traderId = req.params.traderId;
  db.all(
    'SELECT p.*, s.InvoiceNumber, s.TotalAmount, s.PaidAmount FROM payments p LEFT JOIN sales s ON p.SaleID = s.SaleID WHERE p.TraderID = ? ORDER BY p.PaymentDate DESC',
    [traderId],
    (err, payments) => {
      if (err) return res.status(500).json({ error: 'خطأ في استرجاع الدفعات' });
      res.json(payments);
    }
  );
});

// Clear all data
backend.post('/api/clear-data', (req, res) => {
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');
    
    // Clear all tables while maintaining the schema
    const tables = [
      'payments',
      'sales',
      'sale_details',
      'products',
      'purchases',
      'purchase_details',
      'expenses',
      'trader_financials',
      'traders'
    ];

    tables.forEach(table => {
      db.run(`DELETE FROM ${table}`);
    });

    db.run('COMMIT', err => {
      if (err) {
        db.run('ROLLBACK');
        return res.status(500).json({ error: 'خطأ في مسح البيانات' });
      }
      res.json({ success: true, message: 'تم مسح جميع البيانات بنجاح' });
    });
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
// Add this with your other IPC handlers
ipcMain.handle('addManualPayment', async (event, payload) => {
  const db = await getDatabaseConnection();
  try {
    await db.run('BEGIN TRANSACTION');

    // 1. Insert payment record
    const paymentResult = await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO payments (TraderID, Amount, PaymentDate, Notes, created_at)
         VALUES (?, ?, ?, ?, datetime('now'))`,
        [payload.TraderID, payload.Amount, payload.PaymentDate || new Date().toISOString(), payload.Note || ''],
        function(err) {
          if (err) reject(err);
          resolve(this.lastID);
        }
      );
    });

    // 2. Update trader's balance
    await db.run(
      `UPDATE traders
       SET Balance = Balance - ?,
           TotalPayments = TotalPayments + ?,
           updated_at = datetime('now')
       WHERE TraderID = ?`,
      [payload.Amount, payload.Amount, payload.TraderID]
    );

    // 3. Record in financials
    await db.run(
      `INSERT INTO trader_financials
       (trader_id, payment_id, payment_amount, balance, total_payments, transaction_type, description, created_at)
       VALUES (?, ?, ?,
               (SELECT Balance FROM traders WHERE TraderID = ?),
               (SELECT TotalPayments FROM traders WHERE TraderID = ?),
               'payment', ?, datetime('now'))`,
      [payload.TraderID, paymentResult, payload.Amount, payload.TraderID, payload.TraderID, payload.Note || 'Manual Payment']
    );

    await db.run('COMMIT');
    return { success: true, paymentID: paymentResult };

  } catch (error) {
    await db.run('ROLLBACK');
    console.error('Payment processing error:', error);
    return { success: false, error: error.message };
  }
});
