const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs'); // Keep if using user login

// --- Backend Server Setup ---
const backend = express();
backend.use(cors());
backend.use(express.json());
const PORT = 3001; // Port for the API

// --- Database Setup ---
const dbPath = path.join(app.getPath('userData'), 'makhzone.db');
let db;

function initDatabase() {
  db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
      console.error('Database Opening Error:', err.message);
      // Handle critical error (e.g., quit the app or show an error dialog)
      app.quit();
    } else {
      console.log('Database connected successfully to:', dbPath);
      db.run("PRAGMA foreign_keys = ON;", (fkErr) => {
          if(fkErr) {
              console.error("Failed to enable foreign keys:", fkErr.message);
          } else {
              console.log("Foreign key support enabled.");
              createTables();
          }
      });
    }
  });
}

function createTables() {
    db.serialize(() => {
        const ddl = `
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          email_verified_at DATETIME,
          remember_token TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS suppliers (
          SupplierID INTEGER PRIMARY KEY AUTOINCREMENT,
          Name TEXT NOT NULL UNIQUE, -- Added UNIQUE constraint
          Phone TEXT,
          Address TEXT,
          IsActive INTEGER NOT NULL DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS products (
          ProductID INTEGER PRIMARY KEY AUTOINCREMENT,
          ProductName TEXT NOT NULL UNIQUE,
          Category TEXT DEFAULT 'General',
          StockQuantity INTEGER NOT NULL DEFAULT 0,
          UnitPrice REAL NOT NULL DEFAULT 0, -- Selling Price
          UnitCost REAL NOT NULL DEFAULT 0, -- Weighted Average Cost
          IsActive INTEGER NOT NULL DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS traders (
          TraderID INTEGER PRIMARY KEY AUTOINCREMENT,
          TraderName TEXT NOT NULL,
          Phone TEXT,
          Address TEXT,
          -- Balance, TotalSales, TotalPayments removed - Calculate dynamically
          IsActive INTEGER NOT NULL DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS sales (
          SaleID INTEGER PRIMARY KEY AUTOINCREMENT,
          InvoiceNumber TEXT UNIQUE, -- Should likely be unique
          TraderID INTEGER NOT NULL,
          SaleDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          TotalAmount REAL NOT NULL DEFAULT 0,
          PaidAmount REAL NOT NULL DEFAULT 0,
          RemainingAmount REAL NOT NULL DEFAULT 0, -- Calculated: TotalAmount - PaidAmount
          Status TEXT NOT NULL DEFAULT 'completed', -- e.g., completed, pending, returned
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (TraderID) REFERENCES traders(TraderID) ON DELETE RESTRICT -- Prevent deleting trader with sales
        );

        CREATE TABLE IF NOT EXISTS sale_details (
          SaleDetailID INTEGER PRIMARY KEY AUTOINCREMENT,
          SaleID INTEGER NOT NULL,
          ProductID INTEGER NOT NULL,
          Quantity INTEGER NOT NULL,
          UnitPrice REAL NOT NULL, -- Price at the time of sale
          UnitCost REAL NOT NULL, -- Cost at the time of sale (for profit calc)
          SubTotal REAL NOT NULL, -- Calculated: Quantity * UnitPrice
          Profit REAL NOT NULL DEFAULT 0, -- Calculated: SubTotal - (Quantity * UnitCost)
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (SaleID) REFERENCES sales(SaleID) ON DELETE CASCADE, -- Delete details if sale is deleted
          FOREIGN KEY (ProductID) REFERENCES products(ProductID) ON DELETE RESTRICT -- Prevent deleting product in a sale
        );

        CREATE TABLE IF NOT EXISTS purchases (
          PurchaseID INTEGER PRIMARY KEY AUTOINCREMENT,
          SupplierName TEXT, -- Can be linked to suppliers table via FOREIGN KEY if needed
          Notes TEXT,
          PurchaseDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          TotalAmount REAL NOT NULL DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          -- Add FOREIGN KEY (SupplierID) REFERENCES suppliers(SupplierID) if using ID link
        );

        CREATE TABLE IF NOT EXISTS purchase_details (
          PurchaseDetailID INTEGER PRIMARY KEY AUTOINCREMENT,
          PurchaseID INTEGER NOT NULL,
          ProductID INTEGER NOT NULL,
          Quantity INTEGER NOT NULL,
          UnitCost REAL NOT NULL, -- Cost for this specific purchase line
          SubTotal REAL NOT NULL, -- Calculated: Quantity * UnitCost
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (PurchaseID) REFERENCES purchases(PurchaseID) ON DELETE CASCADE,
          FOREIGN KEY (ProductID) REFERENCES products(ProductID) ON DELETE RESTRICT
        );

        CREATE TABLE IF NOT EXISTS expenses (
          ExpenseID INTEGER PRIMARY KEY AUTOINCREMENT,
          ExpenseDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          Description TEXT NOT NULL,
          Amount REAL NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS payments (
          PaymentID INTEGER PRIMARY KEY AUTOINCREMENT,
          TraderID INTEGER NOT NULL,
          SaleID INTEGER, -- Optional link to a specific sale invoice
          PaymentDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          Amount REAL NOT NULL,
          Notes TEXT, -- Added Notes field
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (TraderID) REFERENCES traders(TraderID) ON DELETE CASCADE, -- If trader deleted, payments are too (or SET NULL)
          FOREIGN KEY (SaleID) REFERENCES sales(SaleID) ON DELETE SET NULL -- If sale deleted, keep payment but unlink invoice
        );

        -- Add trader_financials table if implementing detailed ledger
        /*
        CREATE TABLE IF NOT EXISTS trader_financials (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            trader_id INTEGER NOT NULL,
            transaction_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            transaction_type TEXT NOT NULL, -- 'sale', 'payment', 'adjustment'
            reference_id INTEGER, -- SaleID or PaymentID
            debit REAL DEFAULT 0, -- Amount owed by trader increases
            credit REAL DEFAULT 0, -- Amount paid by trader or credit given
            balance REAL NOT NULL, -- Running balance after transaction
            description TEXT,
            FOREIGN KEY (trader_id) REFERENCES traders(TraderID) ON DELETE CASCADE
        );
        */
        `;
        db.exec(ddl, (err) => {
          if (err) {
            console.error('Table Creation Error:', err.message);
          } else {
            console.log('All tables created or already exist.');
            // addDefaultUser(); // Optional: Add a default user if needed
          }
        });
      });
}

// --- Helper functions for DB operations with Promises ---
function dbRun(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) { // Use function() to access 'this'
            if (err) {
                console.error('DB Run Error:', sql, params, err.message);
                reject(err);
            } else {
                resolve(this); // 'this' contains lastID and changes
            }
        });
    });
}

function dbGet(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) {
                 console.error('DB Get Error:', sql, params, err.message);
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}

function dbAll(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) {
                 console.error('DB All Error:', sql, params, err.message);
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

// --- Product Cost Update Helper Functions ---

/**
 * Updates product stock and calculates new weighted average cost when adding a purchase.
 * @param {number} productId
 * @param {number} purchasedQuantity
 * @param {number} purchaseCost Cost for this specific purchase line item
 */
async function updateProductCostOnPurchaseAdd(productId, purchasedQuantity, purchaseCost) {
    try {
        const product = await dbGet('SELECT StockQuantity, UnitCost FROM products WHERE ProductID = ?', [productId]);
        if (!product) {
            throw new Error(`Product with ID ${productId} not found during cost update on add.`);
        }

        const oldQ = Number(product.StockQuantity) || 0;
        const oldC = Number(product.UnitCost) || 0;
        const newQ = Number(purchasedQuantity);
        const newC = Number(purchaseCost);

        if (newQ <= 0 || newC < 0) {
             throw new Error(`Invalid quantity (${newQ}) or cost (${newC}) for product ${productId}.`);
        }

        const totalQuantity = oldQ + newQ;
        let newAvgCost = 0;

        if (totalQuantity > 0) {
            const currentTotalValue = oldQ * oldC;
            const addedValue = newQ * newC;
            newAvgCost = (currentTotalValue + addedValue) / totalQuantity;
        } else {
            newAvgCost = newC; // Should not happen if newQ > 0
        }

        newAvgCost = Math.max(0, newAvgCost); // Ensure cost is not negative

        const now = new Date().toISOString();
        await dbRun(
            'UPDATE products SET StockQuantity = ?, UnitCost = ?, updated_at = ? WHERE ProductID = ?',
            [totalQuantity, newAvgCost, now, productId]
        );
         console.log(`Product ${productId} cost updated on ADD: Qty=${totalQuantity}, AvgCost=${newAvgCost.toFixed(4)}`); // Log with more precision

    } catch (error) {
        console.error(`Error updating cost on ADD for product ${productId}:`, error.message);
        throw error;
    }
}

/**
 * Updates product stock and recalculates weighted average cost when deleting a purchase detail.
 * @param {number} productId
 * @param {number} deletedQuantity Quantity from the deleted purchase detail
 * @param {number} deletedCost Cost from the deleted purchase detail
 * @param {number} deletedPurchaseID PurchaseID of the deleted purchase detail
 */
async function updateProductCostOnPurchaseDelete(productId, deletedQuantity, deletedCost, deletedPurchaseID) {
     try {
         const product = await dbGet('SELECT StockQuantity, UnitCost FROM products WHERE ProductID = ?', [productId]);
         if (!product) {
             console.warn(`Product with ID ${productId} not found during cost update on delete. Skipping cost update.`);
             return;
         }

         // Get all purchase details for this product (excluding the one being deleted)
         const purchaseDetails = await dbAll(
             `SELECT Quantity, UnitCost FROM purchase_details
              WHERE ProductID = ? AND PurchaseID != ?`,
             [productId, deletedPurchaseID]
         );

         const currentQ = Number(product.StockQuantity) || 0;
         const delQ = Number(deletedQuantity);

         if (delQ <= 0) {
             console.warn(`Skipping cost update for product ${productId}: Deleted quantity (${delQ}) is not positive.`);
             return;
         }

         // Calculate new quantity
         const newQuantity = currentQ - delQ;
         let newAvgCost = 0;

         // If there are remaining purchase details, recalculate weighted average
         if (purchaseDetails.length > 0) {
             let totalQuantity = 0;
             let totalValue = 0;

             // Calculate total quantity and value of remaining purchases
             purchaseDetails.forEach(detail => {
                 const q = Number(detail.Quantity);
                 const c = Number(detail.UnitCost);
                 totalQuantity += q;
                 totalValue += q * c;
             });

             // Calculate new weighted average cost
             if (totalQuantity > 0) {
                 newAvgCost = totalValue / totalQuantity;
             } else {
                 // If no remaining purchases, set cost to 0
                 newAvgCost = 0;
             }
         } else {
             // If no remaining purchase details, set cost to 0
             newAvgCost = 0;
         }

         newAvgCost = Math.max(0, newAvgCost); // Ensure cost is not negative

         const now = new Date().toISOString();
         await dbRun(
             'UPDATE products SET StockQuantity = ?, UnitCost = ?, updated_at = ? WHERE ProductID = ?',
             [Math.max(0, newQuantity), newAvgCost, now, productId]
         );

         console.log(`Product ${productId} cost updated on DELETE: Qty=${Math.max(0, newQuantity)}, AvgCost=${newAvgCost.toFixed(4)}`);

     } catch (error) {
         console.error(`Error updating cost on DELETE for product ${productId}:`, error.message);
         throw error;
     }
}


// --- API Endpoints ---

// --- Users/Auth Endpoints (Example) ---
backend.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'جميع الحقول مطلوبة.' });

  try {
    const existing = await dbGet('SELECT id FROM users WHERE email = ?', [email]);
    if (existing) return res.status(400).json({ error: 'البريد الإلكتروني مستخدم بالفعل.' });

    const hashedPassword = await bcrypt.hash(password, 10); // Salt rounds = 10
    const result = await dbRun('INSERT INTO users (name, email, password, created_at, updated_at) VALUES (?, ?, ?, datetime("now"), datetime("now"))', [name, email, hashedPassword]);
    res.status(201).json({ id: result.lastID, name, email });
  } catch (err) {
    res.status(500).json({ error: 'خطأ في التسجيل.', details: err.message });
  }
});

backend.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'جميع الحقول مطلوبة.' });

  try {
    const user = await dbGet('SELECT id, name, email, password FROM users WHERE email = ?', [email]);
    if (!user) return res.status(401).json({ error: 'بيانات اعتماد غير صحيحة.' }); // 401 Unauthorized

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'بيانات اعتماد غير صحيحة.' });

    // Don't send password back
    res.json({ id: user.id, name: user.name, email: user.email });
  } catch (err) {
    res.status(500).json({ error: 'خطأ في تسجيل الدخول.', details: err.message });
  }
});


// --- Products Endpoints ---
backend.get('/api/products', async (req, res) => {
  try {
    const rows = await dbAll('SELECT ProductID, ProductName, Category, StockQuantity, UnitPrice, UnitCost, IsActive FROM products WHERE IsActive = 1 ORDER BY ProductName');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'خطأ في استرجاع المنتجات' });
  }
});

backend.get('/api/products/:id', async (req, res) => {
   try {
    const row = await dbGet('SELECT ProductID, ProductName, Category, StockQuantity, UnitPrice, UnitCost, IsActive FROM products WHERE ProductID = ?', [req.params.id]);
    if (!row) return res.status(404).json({ error: 'المنتج غير موجود' });
    res.json(row);
   } catch (err) {
       res.status(500).json({ error: 'خطأ في استرجاع المنتج' });
   }
});

backend.post('/api/products', async (req, res) => {
  const { ProductName, Category, UnitPrice, IsActive = 1 } = req.body;
  if (!ProductName || UnitPrice == null || UnitPrice < 0) {
      return res.status(400).json({ error: 'اسم المنتج وسعر البيع مطلوبان ويجب أن يكون السعر >= 0' });
  }
  const now = new Date().toISOString();
  try {
       const existing = await dbGet('SELECT ProductID FROM products WHERE ProductName = ?', [ProductName]);
       if (existing) {
           return res.status(400).json({ error: `المنتج "${ProductName}" موجود بالفعل.` });
       }
      const result = await dbRun(
        'INSERT INTO products (ProductName, Category, StockQuantity, UnitPrice, UnitCost, IsActive, created_at, updated_at) VALUES (?, ?, 0, ?, 0, ?, ?, ?)',
        [ProductName, Category || 'General', UnitPrice, IsActive ? 1 : 0, now, now]
      );
      res.status(201).json({ ProductID: result.lastID, ProductName, Category: Category || 'General', UnitPrice, StockQuantity: 0, UnitCost: 0, IsActive });
  } catch (err) {
      if (err.message.includes('UNIQUE constraint failed')) { // More specific error check
           res.status(400).json({ error: `المنتج "${ProductName}" موجود بالفعل.` });
      } else {
          res.status(500).json({ error: 'خطأ في إنشاء المنتج', details: err.message });
      }
  }
});

backend.put('/api/products/:id', async (req, res) => {
  const productId = req.params.id;
  const { ProductName, Category, UnitPrice, IsActive } = req.body;
   if (!ProductName || UnitPrice == null || UnitPrice < 0) {
       return res.status(400).json({ error: 'اسم المنتج وسعر البيع مطلوبان ويجب أن يكون السعر >= 0' });
   }
  const now = new Date().toISOString();
  try {
      const existing = await dbGet('SELECT ProductID FROM products WHERE ProductName = ? AND ProductID != ?', [ProductName, productId]);
      if (existing) {
          return res.status(400).json({ error: `اسم المنتج "${ProductName}" مستخدم بالفعل لمنتج آخر.` });
      }
      const result = await dbRun(
        'UPDATE products SET ProductName = ?, Category = ?, UnitPrice = ?, IsActive = ?, updated_at = ? WHERE ProductID = ?',
        [ProductName, Category || 'General', UnitPrice, IsActive !== undefined ? (IsActive ? 1 : 0) : 1, now, productId]
      );
      if (result.changes === 0) {
           return res.status(404).json({ error: 'المنتج غير موجود' });
      }
      res.json({ message: 'تم تحديث المنتج بنجاح', changes: result.changes });
  } catch (err) {
       if (err.message.includes('UNIQUE constraint failed')) {
            res.status(400).json({ error: `اسم المنتج "${ProductName}" مستخدم بالفعل لمنتج آخر.` });
       } else {
           res.status(500).json({ error: 'خطأ في تحديث المنتج', details: err.message });
       }
  }
});

backend.delete('/api/products/:id', async (req, res) => {
    const productId = req.params.id;
    try {
        const saleDetail = await dbGet('SELECT 1 FROM sale_details WHERE ProductID = ? LIMIT 1', [productId]);
        const purchaseDetail = await dbGet('SELECT 1 FROM purchase_details WHERE ProductID = ? LIMIT 1', [productId]);

        if (saleDetail || purchaseDetail) {
             // Soft delete
             const now = new Date().toISOString();
             const result = await dbRun('UPDATE products SET IsActive = 0, updated_at = ? WHERE ProductID = ?', [now, productId]);
             if (result.changes === 0) return res.status(404).json({ error: 'المنتج غير موجود' });
             return res.json({ message: 'تم تعطيل المنتج (حذف ناعم) لوجود تعاملات مرتبطة.', changes: result.changes });
        } else {
            // Hard delete
            const result = await dbRun('DELETE FROM products WHERE ProductID = ?', [productId]);
            if (result.changes === 0) return res.status(404).json({ error: 'المنتج غير موجود' });
            return res.json({ message: 'تم حذف المنتج بنجاح', deleted: result.changes });
        }
    } catch (err) {
        if (err.message.includes('FOREIGN KEY constraint failed')) { // Should be caught by the check above, but as fallback
             res.status(400).json({ error: 'لا يمكن حذف المنتج لوجود تعاملات مرتبطة به.' });
        } else {
            console.error(`Error deleting product ${productId}:`, err);
            res.status(500).json({ error: 'خطأ في حذف المنتج', details: err.message });
        }
    }
});


// --- Purchases Endpoints ---
backend.get('/api/purchases', async (req, res) => {
  try {
    const purchases = await dbAll(`
        SELECT p.PurchaseID, p.SupplierName, p.Notes, p.PurchaseDate, p.TotalAmount
        FROM purchases p
        ORDER BY p.PurchaseDate DESC, p.PurchaseID DESC
    `);
    res.json(purchases);
  } catch (err) {
      res.status(500).json({ error: 'خطأ في استرجاع المشتريات' });
  }
});

backend.get('/api/purchases/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const purchase = await dbGet('SELECT PurchaseID, SupplierName, Notes, PurchaseDate, TotalAmount FROM purchases WHERE PurchaseID = ?', [id]);
    if (!purchase) return res.status(404).json({ error: 'فاتورة المشتريات غير موجودة' });

    const details = await dbAll(
      `SELECT pd.PurchaseDetailID, pd.ProductID, pd.Quantity, pd.UnitCost, pd.SubTotal, pr.ProductName
       FROM purchase_details pd
       JOIN products pr ON pd.ProductID = pr.ProductID
       WHERE pd.PurchaseID = ?`,
      [id]
    );
    res.json({ ...purchase, details: details });
  } catch (err) {
      res.status(500).json({ error: 'خطأ في استرجاع تفاصيل المشتريات' });
  }
});

backend.post('/api/purchases', async (req, res) => {
  const { supplier_name, notes, products: purchaseItems } = req.body;

  if (!Array.isArray(purchaseItems) || purchaseItems.length === 0) return res.status(400).json({ error: 'يجب إضافة منتج واحد على الأقل للمشتريات.' });

  // Deeper validation of items
  for (const item of purchaseItems) {
      if (!item.product_id || !item.quantity || item.quantity <= 0 || item.unit_cost == null || item.unit_cost < 0) {
          return res.status(400).json({ error: `بيانات المنتج غير صالحة: ${JSON.stringify(item)} (ID, Quantity > 0, Cost >= 0 مطلوب).` });
      }
      try {
        const productExists = await dbGet('SELECT 1 FROM products WHERE ProductID = ? AND IsActive = 1', [item.product_id]);
        if (!productExists) {
            return res.status(400).json({ error: `المنتج بالمعرف ${item.product_id} غير موجود أو غير نشط.` });
        }
      } catch (checkErr) {
         return res.status(500).json({ error: 'خطأ أثناء التحقق من المنتج.', details: checkErr.message });
      }
  }

  const now = new Date().toISOString();
  let purchaseID;
  let totalAmount = 0;

  try {
    await dbRun('BEGIN TRANSACTION');
    const purchaseResult = await dbRun(
      'INSERT INTO purchases (SupplierName, Notes, PurchaseDate, TotalAmount, created_at, updated_at) VALUES (?, ?, ?, 0, ?, ?)',
      [supplier_name || null, notes || null, now, now, now] // Allow nulls
    );
    purchaseID = purchaseResult.lastID;

    for (const item of purchaseItems) {
      const { product_id, quantity, unit_cost } = item;
      const subTotal = quantity * unit_cost;
      totalAmount += subTotal;
      await dbRun(
        'INSERT INTO purchase_details (PurchaseID, ProductID, Quantity, UnitCost, SubTotal, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [purchaseID, product_id, quantity, unit_cost, subTotal, now, now]
      );
      await updateProductCostOnPurchaseAdd(product_id, quantity, unit_cost);
    }

    await dbRun('UPDATE purchases SET TotalAmount = ? WHERE PurchaseID = ?', [totalAmount, purchaseID]);
    await dbRun('COMMIT');
    res.status(201).json({ message: 'تم إنشاء فاتورة المشتريات بنجاح', purchaseID, totalAmount });
  } catch (error) {
    await dbRun('ROLLBACK');
    res.status(500).json({ error: `خطأ في حفظ المشتريات: ${error.message}` });
  }
});

backend.delete('/api/purchases/:id', async (req, res) => {
  const purchaseID = req.params.id;
  if (!purchaseID || isNaN(parseInt(purchaseID))) return res.status(400).json({ error: 'معرف المشتريات غير صالح.' });

  try {
      await dbRun('BEGIN TRANSACTION');
      const details = await dbAll('SELECT ProductID, Quantity, UnitCost FROM purchase_details WHERE PurchaseID = ?', [purchaseID]);
      const purchaseHeader = await dbGet('SELECT 1 FROM purchases WHERE PurchaseID = ?', [purchaseID]);

      if (!purchaseHeader) {
          await dbRun('ROLLBACK');
          return res.status(404).json({ error: 'فاتورة المشتريات غير موجودة.' });
      }

      if (details.length > 0) {
          console.log(`Reverting costs/stock for ${details.length} details in purchase ${purchaseID}...`);
          for (const detail of details) {
              await updateProductCostOnPurchaseDelete(detail.ProductID, detail.Quantity, detail.UnitCost, purchaseID);
          }
      } else {
           console.log(`Purchase ${purchaseID} has no details. No product updates needed.`);
      }

      const deleteResult = await dbRun('DELETE FROM purchases WHERE PurchaseID = ?', [purchaseID]); // CASCADE should handle details
      console.log(`Deleted purchase header ${purchaseID}. Changes: ${deleteResult.changes}`);

      await dbRun('COMMIT');
      res.json({ message: 'تم حذف فاتورة المشتريات وتحديث المنتجات بنجاح.', deleted: deleteResult.changes });
  } catch (error) {
      await dbRun('ROLLBACK');
      res.status(500).json({ error: `خطأ في حذف المشتريات: ${error.message}` });
  }
});

backend.put('/api/purchases/:id', async (req, res) => {
    const purchaseID = req.params.id;
    const { supplier_name, notes, products: newPurchaseItems } = req.body;

    if (isNaN(parseInt(purchaseID))) return res.status(400).json({ error: 'معرف المشتريات غير صالح.' });
    if (!Array.isArray(newPurchaseItems) || newPurchaseItems.length === 0) return res.status(400).json({ error: 'يجب إضافة منتج واحد على الأقل للمشتريات.' });

    // Deeper validation of new items
    for (const item of newPurchaseItems) {
        if (!item.product_id || !item.quantity || item.quantity <= 0 || item.unit_cost == null || item.unit_cost < 0) {
             return res.status(400).json({ error: `بيانات المنتج المحدثة غير صالحة: ${JSON.stringify(item)}.` });
        }
         try {
            const productExists = await dbGet('SELECT 1 FROM products WHERE ProductID = ? AND IsActive = 1', [item.product_id]);
            if (!productExists) return res.status(400).json({ error: `المنتج بالمعرف ${item.product_id} غير موجود أو غير نشط.` });
        } catch (checkErr) {
            return res.status(500).json({ error: 'خطأ أثناء التحقق من المنتج.', details: checkErr.message });
        }
    }

    const now = new Date().toISOString();
    let newTotalAmount = 0;

    try {
        await dbRun('BEGIN TRANSACTION');
        const oldDetails = await dbAll('SELECT ProductID, Quantity, UnitCost FROM purchase_details WHERE PurchaseID = ?', [purchaseID]);
        const purchaseHeader = await dbGet('SELECT 1 FROM purchases WHERE PurchaseID = ?', [purchaseID]);

        if (!purchaseHeader) {
             await dbRun('ROLLBACK');
             return res.status(404).json({ error: 'فاتورة المشتريات المراد تعديلها غير موجودة.' });
        }

        // Reverse old details
        if (oldDetails.length > 0) {
             console.log(`Reversing costs/stock for ${oldDetails.length} old details in purchase PUT ${purchaseID}...`);
             for (const detail of oldDetails) {
                 await updateProductCostOnPurchaseDelete(detail.ProductID, detail.Quantity, detail.UnitCost, purchaseID);
             }
        }

        // Delete old details explicitly (safer than relying purely on manual reversal logic if something goes wrong)
        await dbRun('DELETE FROM purchase_details WHERE PurchaseID = ?', [purchaseID]);
        console.log(`Deleted old details for purchase ${purchaseID}.`);

        // Add new details and update costs
        console.log(`Adding/Updating costs/stock for ${newPurchaseItems.length} new details in purchase PUT ${purchaseID}...`);
        for (const item of newPurchaseItems) {
            const { product_id, quantity, unit_cost } = item;
            const subTotal = quantity * unit_cost;
            newTotalAmount += subTotal;
            await dbRun(
                'INSERT INTO purchase_details (PurchaseID, ProductID, Quantity, UnitCost, SubTotal, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [purchaseID, product_id, quantity, unit_cost, subTotal, now, now]
            );
            await updateProductCostOnPurchaseAdd(product_id, quantity, unit_cost);
        }

        // Update purchase header
        const updateResult = await dbRun(
            'UPDATE purchases SET SupplierName = ?, Notes = ?, TotalAmount = ?, updated_at = ? WHERE PurchaseID = ?',
            [supplier_name || null, notes || null, newTotalAmount, now, purchaseID]
        );
        console.log(`Updated purchase header ${purchaseID}. Changes: ${updateResult.changes}`);

        await dbRun('COMMIT');
        res.json({ message: 'تم تحديث فاتورة المشتريات بنجاح', purchaseID, totalAmount: newTotalAmount });
    } catch (error) {
        await dbRun('ROLLBACK');
        res.status(500).json({ error: `خطأ في تحديث المشتريات: ${error.message}` });
    }
});


// --- Sales Endpoints ---
// GET /api/sales (List Sales with Trader Name)
backend.get('/api/sales', async (req, res) => {
    try {
        const sales = await dbAll(`
            SELECT s.SaleID, s.InvoiceNumber, s.TraderID, t.TraderName, s.SaleDate, s.TotalAmount, s.PaidAmount, s.RemainingAmount, s.Status
            FROM sales s
            LEFT JOIN traders t ON s.TraderID = t.TraderID
            ORDER BY s.SaleDate DESC, s.SaleID DESC
        `);
        res.json(sales);
    } catch (err) {
        res.status(500).json({ error: 'خطأ في استرجاع المبيعات' });
    }
});

// GET /api/sales/:id (Get Specific Sale with Details)
backend.get('/api/sales/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const sale = await dbGet(`
            SELECT s.SaleID, s.InvoiceNumber, s.TraderID, t.TraderName, s.SaleDate, s.TotalAmount, s.PaidAmount, s.RemainingAmount, s.Status
            FROM sales s
            LEFT JOIN traders t ON s.TraderID = t.TraderID
            WHERE s.SaleID = ?
        `, [id]);

        if (!sale) return res.status(404).json({ error: 'فاتورة المبيعات غير موجودة' });

        const details = await dbAll(`
            SELECT sd.SaleDetailID, sd.ProductID, p.ProductName, sd.Quantity, sd.UnitPrice, sd.UnitCost, sd.SubTotal, sd.Profit
            FROM sale_details sd
            JOIN products p ON sd.ProductID = p.ProductID
            WHERE sd.SaleID = ?
        `, [id]);

        res.json({ ...sale, details: details });
    } catch (err) {
        res.status(500).json({ error: 'خطأ في استرجاع تفاصيل المبيعات' });
    }
});

// POST /api/sales (Add New Sale)
backend.post('/api/sales', async (req, res) => {
    const { TraderID, PaidAmount = 0, products: saleItems } = req.body; // products is the array of items

    // Validation
    if (!TraderID || !Array.isArray(saleItems) || saleItems.length === 0) {
        return res.status(400).json({ error: 'معرف التاجر وقائمة المنتجات مطلوبان.' });
    }

    const now = new Date().toISOString();
    let saleID;
    let totalAmount = 0;
    let totalCost = 0; // To calculate profit later if needed

    try {
        await dbRun('BEGIN TRANSACTION');

        // Check trader exists
        const trader = await dbGet('SELECT 1 FROM traders WHERE TraderID = ? AND IsActive = 1', [TraderID]);
        if (!trader) {
             await dbRun('ROLLBACK');
             return res.status(400).json({ error: 'التاجر غير موجود أو غير نشط.' });
        }

        // Validate items, check stock, get current cost
        const processedItems = [];
        for (const item of saleItems) {
            if (!item.ProductID || !item.Quantity || item.Quantity <= 0 || item.UnitPrice == null || item.UnitPrice < 0) {
                throw new Error(`بيانات المنتج غير صالحة: ${JSON.stringify(item)}`);
            }
            const product = await dbGet('SELECT StockQuantity, UnitCost FROM products WHERE ProductID = ? AND IsActive = 1', [item.ProductID]);
            if (!product) {
                throw new Error(`المنتج بالمعرف ${item.ProductID} غير موجود أو غير نشط.`);
            }
            if (product.StockQuantity < item.Quantity) {
                throw new Error(`كمية غير كافية للمنتج ID ${item.ProductID}. المتوفر: ${product.StockQuantity}, المطلوب: ${item.Quantity}.`);
            }
            processedItems.push({
                ...item,
                CurrentUnitCost: product.UnitCost // Get cost at time of sale
            });
        }

        // Create Sale Header (TotalAmount=0 initially)
        const saleResult = await dbRun(
            'INSERT INTO sales (TraderID, SaleDate, TotalAmount, PaidAmount, RemainingAmount, Status, created_at, updated_at) VALUES (?, ?, 0, ?, 0, ?, ?, ?)',
            [TraderID, now, PaidAmount, 'completed', now, now]
        );
        saleID = saleResult.lastID;

        // Process Details: Insert, Update Stock
        for (const item of processedItems) {
            const subTotal = item.Quantity * item.UnitPrice;
            const itemCost = item.Quantity * item.CurrentUnitCost;
            const profit = subTotal - itemCost;
            totalAmount += subTotal;
            totalCost += itemCost; // Accumulate total cost if needed

            await dbRun(
                'INSERT INTO sale_details (SaleID, ProductID, Quantity, UnitPrice, UnitCost, SubTotal, Profit, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [saleID, item.ProductID, item.Quantity, item.UnitPrice, item.CurrentUnitCost, subTotal, profit, now, now]
            );

            // Decrease product stock
            await dbRun(
                'UPDATE products SET StockQuantity = StockQuantity - ?, updated_at = ? WHERE ProductID = ?',
                [item.Quantity, now, item.ProductID]
            );
        }

        // Update Sale Header with final amounts
        const remainingAmount = totalAmount - PaidAmount;
        await dbRun(
            'UPDATE sales SET TotalAmount = ?, RemainingAmount = ?, updated_at = ? WHERE SaleID = ?',
            [totalAmount, remainingAmount, now, saleID]
        );

        // Optional: Record payment if PaidAmount > 0
        if (PaidAmount > 0) {
             await dbRun(
                'INSERT INTO payments (TraderID, SaleID, PaymentDate, Amount, Notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [TraderID, saleID, now, PaidAmount, `Payment for Sale #${saleID}`, now, now]
            );
        }

        // Optional: Update trader financials/balance (complex - requires careful ledger logic)
        // await updateTraderFinancials(TraderID, 'sale', saleID, totalAmount, PaidAmount);

        await dbRun('COMMIT');
        res.status(201).json({ message: 'تم إنشاء فاتورة المبيعات بنجاح.', saleID, totalAmount, remainingAmount });

    } catch (error) {
        await dbRun('ROLLBACK');
        res.status(500).json({ error: `خطأ في إنشاء المبيعات: ${error.message}` });
    }
});

// DELETE /api/sales/:id (Delete Sale and Revert Stock)
backend.delete('/api/sales/:id', async (req, res) => {
    const saleID = req.params.id;
    if (isNaN(parseInt(saleID))) return res.status(400).json({ error: 'معرف المبيعات غير صالح.' });

    try {
        await dbRun('BEGIN TRANSACTION');

        // Get sale details before deleting
        const details = await dbAll('SELECT ProductID, Quantity FROM sale_details WHERE SaleID = ?', [saleID]);

        // Check if sale exists
         const saleHeader = await dbGet('SELECT 1 FROM sales WHERE SaleID = ?', [saleID]);
         if (!saleHeader) {
              await dbRun('ROLLBACK');
              return res.status(404).json({ error: 'فاتورة المبيعات غير موجودة.' });
         }

        // Revert stock quantities
        if (details.length > 0) {
             const now = new Date().toISOString();
             console.log(`Reverting stock for ${details.length} details in sale ${saleID}...`);
             for (const detail of details) {
                 await dbRun(
                     'UPDATE products SET StockQuantity = StockQuantity + ?, updated_at = ? WHERE ProductID = ?',
                     [detail.Quantity, now, detail.ProductID]
                 );
             }
        }

        // Delete the sale (CASCADE should handle details and set payments SaleID to NULL)
        const deleteResult = await dbRun('DELETE FROM sales WHERE SaleID = ?', [saleID]);
        console.log(`Deleted sale header ${saleID}. Changes: ${deleteResult.changes}`);

         // Optional: Revert trader financials (Requires complex ledger reversal logic)
         // await revertTraderFinancialsForSale(saleID);

        await dbRun('COMMIT');
        res.json({ message: 'تم حذف فاتورة المبيعات وتحديث مخزون المنتجات.', deleted: deleteResult.changes });

    } catch (error) {
        await dbRun('ROLLBACK');
        res.status(500).json({ error: `خطأ في حذف المبيعات: ${error.message}` });
    }
});

// PUT /api/sales/:id (Update Sale - Complex: Requires Reverting Old, Applying New)
// This is very complex due to stock changes. Often it's easier to delete and recreate,
// or create a "return" transaction instead of directly editing a completed sale.
// Basic structure provided, but needs careful implementation if required.
backend.put('/api/sales/:id', async (req, res) => {
    const saleID = req.params.id;
     const { TraderID, PaidAmount = 0, products: newSaleItems } = req.body;

     if (isNaN(parseInt(saleID))) return res.status(400).json({ error: 'معرف المبيعات غير صالح.' });
     // ... Add validation similar to POST ...

     const now = new Date().toISOString();
     let newTotalAmount = 0;

     try {
        await dbRun('BEGIN TRANSACTION');

        // 1. Get OLD Sale Details & Header
        const oldSale = await dbGet('SELECT * FROM sales WHERE SaleID = ?', [saleID]);
        if (!oldSale) throw new Error('الفاتورة غير موجودة.');
        const oldDetails = await dbAll('SELECT ProductID, Quantity FROM sale_details WHERE SaleID = ?', [saleID]);

        // 2. Revert OLD Stock Changes
        for (const detail of oldDetails) {
            await dbRun('UPDATE products SET StockQuantity = StockQuantity + ?, updated_at = ? WHERE ProductID = ?', [detail.Quantity, now, detail.ProductID]);
        }

        // 3. Delete OLD Sale Details
        await dbRun('DELETE FROM sale_details WHERE SaleID = ?', [saleID]);

        // 4. Validate NEW Items (Stock Check, etc.) - Similar to POST validation
         const processedNewItems = [];
         for (const item of newSaleItems) {
            // ... validation logic like in POST ...
            const product = await dbGet('SELECT StockQuantity, UnitCost FROM products WHERE ProductID = ? AND IsActive = 1', [item.ProductID]);
             if (!product) throw new Error(`المنتج ID ${item.ProductID} غير موجود.`);
             if (product.StockQuantity < item.Quantity) throw new Error(`كمية غير كافية للمنتج ID ${item.ProductID}.`);
             processedNewItems.push({ ...item, CurrentUnitCost: product.UnitCost });
         }


        // 5. Insert NEW Sale Details & Apply NEW Stock Changes
        for (const item of processedNewItems) {
             const subTotal = item.Quantity * item.UnitPrice;
             const itemCost = item.Quantity * item.CurrentUnitCost;
             const profit = subTotal - itemCost;
             newTotalAmount += subTotal;

             await dbRun(
                 'INSERT INTO sale_details (SaleID, ProductID, Quantity, UnitPrice, UnitCost, SubTotal, Profit, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                 [saleID, item.ProductID, item.Quantity, item.UnitPrice, item.CurrentUnitCost, subTotal, profit, now, now]
             );
             await dbRun(
                 'UPDATE products SET StockQuantity = StockQuantity - ?, updated_at = ? WHERE ProductID = ?',
                 [item.Quantity, now, item.ProductID]
             );
         }

         // 6. Update Sale Header
         const newRemainingAmount = newTotalAmount - PaidAmount;
         await dbRun(
             'UPDATE sales SET TraderID = ?, TotalAmount = ?, PaidAmount = ?, RemainingAmount = ?, updated_at = ? WHERE SaleID = ?',
             [TraderID, newTotalAmount, PaidAmount, newRemainingAmount, now, saleID]
         );

        // 7. Update Payments (Delete old linked payment? Add new one? Adjust existing?) - Complex!
        // 8. Update Trader Financials - Complex!

        await dbRun('COMMIT');
        res.json({ message: 'تم تحديث الفاتورة بنجاح (تحذير: تحديث الدفعات/المالية قد يتطلب منطقًا إضافيًا)', saleID, totalAmount: newTotalAmount });

     } catch (error) {
         await dbRun('ROLLBACK');
         res.status(500).json({ error: `خطأ في تحديث المبيعات: ${error.message}` });
     }
});


// --- Traders Endpoints ---
backend.get('/api/traders', async (req, res) => {
    try {
        // Fetch basic trader info
        const traders = await dbAll('SELECT TraderID, TraderName, Phone, Address, IsActive FROM traders WHERE IsActive = 1 ORDER BY TraderName');

        // Optionally calculate balance dynamically for each trader (can be slow with many traders/transactions)
        // For better performance, calculate balance on demand when viewing a specific trader or use a dedicated financials table/view.
        /*
        for (const trader of traders) {
            const salesTotal = await dbGet('SELECT SUM(TotalAmount) as total FROM sales WHERE TraderID = ?', [trader.TraderID]);
            const paymentsTotal = await dbGet('SELECT SUM(Amount) as total FROM payments WHERE TraderID = ?', [trader.TraderID]);
            trader.Balance = (paymentsTotal?.total || 0) - (salesTotal?.total || 0); // Example: Payment - Sale = Balance
        }
        */
        res.json(traders);
    } catch (err) {
        res.status(500).json({ error: 'خطأ في استرجاع التجار' });
    }
});

backend.get('/api/traders/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const trader = await dbGet('SELECT TraderID, TraderName, Phone, Address, IsActive FROM traders WHERE TraderID = ?', [id]);
        if (!trader) return res.status(404).json({ error: 'التاجر غير موجود' });

        // Calculate balance and totals dynamically for the specific trader
        const sales = await dbGet('SELECT SUM(TotalAmount) as totalSales, SUM(PaidAmount) as totalPaid FROM sales WHERE TraderID = ?', [id]);
        const payments = await dbGet('SELECT SUM(Amount) as totalPayments FROM payments WHERE TraderID = ?', [id]); // Includes sale payments + manual

        const totalSales = sales?.totalSales || 0;
        const totalPaymentsReceived = payments?.totalPayments || 0; // All payments received for this trader
        const balance = totalPaymentsReceived - totalSales; // Positive: Trader owes us; Negative: We owe trader

        res.json({
            ...trader,
            CalculatedTotalSales: totalSales,
            CalculatedTotalPayments: totalPaymentsReceived,
            CalculatedBalance: balance
         });
    } catch (err) {
        res.status(500).json({ error: 'خطأ في استرجاع التاجر' });
    }
});

backend.post('/api/traders', async (req, res) => {
  const { TraderName, Phone, Address, IsActive = 1 } = req.body;
  if (!TraderName) return res.status(400).json({ error: 'اسم التاجر مطلوب' });
  const now = new Date().toISOString();
  try {
    const result = await dbRun(
      'INSERT INTO traders (TraderName, Phone, Address, IsActive, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
      [TraderName, Phone || null, Address || null, IsActive ? 1 : 0, now, now]
    );
    res.status(201).json({ TraderID: result.lastID, TraderName, Phone, Address, IsActive });
  } catch (err) {
    res.status(500).json({ error: 'خطأ في إنشاء التاجر', details: err.message });
  }
});

backend.put('/api/traders/:id', async (req, res) => {
  const id = req.params.id;
  const { TraderName, Phone, Address, IsActive } = req.body;
  if (!TraderName) return res.status(400).json({ error: 'اسم التاجر مطلوب' });
  const now = new Date().toISOString();
  try {
    const result = await dbRun(
      'UPDATE traders SET TraderName = ?, Phone = ?, Address = ?, IsActive = ?, updated_at = ? WHERE TraderID = ?',
      [TraderName, Phone || null, Address || null, IsActive !== undefined ? (IsActive ? 1 : 0) : 1, now, id]
    );
    if (result.changes === 0) return res.status(404).json({ error: 'التاجر غير موجود' });
    res.json({ message: 'تم تحديث التاجر بنجاح', changes: result.changes });
  } catch (err) {
    res.status(500).json({ error: 'خطأ في تحديث التاجر', details: err.message });
  }
});

// Soft delete trader (set IsActive=0)
backend.delete('/api/traders/:id', async (req, res) => {
    const id = req.params.id;
    try {
         // Check if trader has active sales/payments (optional, depends on FK constraints)
         /*
         const hasSales = await dbGet('SELECT 1 FROM sales WHERE TraderID = ? LIMIT 1', [id]);
         if (hasSales) {
              return res.status(400).json({ error: 'لا يمكن حذف التاجر لوجود مبيعات مرتبطة. يمكنك تعطيله.' });
         }
         */
        const now = new Date().toISOString();
        const result = await dbRun('UPDATE traders SET IsActive = 0, updated_at = ? WHERE TraderID = ?', [now, id]);
        if (result.changes === 0) return res.status(404).json({ error: 'التاجر غير موجود' });
        res.json({ message: 'تم تعطيل التاجر بنجاح.', changes: result.changes });
    } catch (err) {
         if (err.message.includes('FOREIGN KEY constraint failed')) {
              res.status(400).json({ error: 'لا يمكن حذف التاجر لوجود تعاملات مرتبطة.' });
         } else {
             res.status(500).json({ error: 'خطأ في حذف التاجر', details: err.message });
         }
    }
});


// --- Expenses Endpoints ---
backend.get('/api/expenses', async (req, res) => {
    try {
        const expenses = await dbAll('SELECT ExpenseID, ExpenseDate, Description, Amount FROM expenses ORDER BY ExpenseDate DESC');
        res.json(expenses);
    } catch (err) {
        res.status(500).json({ error: 'خطأ في استرجاع المصروفات' });
    }
});

backend.post('/api/expenses', async (req, res) => {
    const { ExpenseDate, Description, Amount } = req.body;
    if (!Description || Amount == null || Amount <= 0 || !ExpenseDate) {
        return res.status(400).json({ error: 'التاريخ والوصف ومبلغ موجب مطلوب.' });
    }
    const now = new Date().toISOString();
    try {
        const result = await dbRun(
            'INSERT INTO expenses (ExpenseDate, Description, Amount, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
            [ExpenseDate, Description, Amount, now, now]
        );
        res.status(201).json({ ExpenseID: result.lastID, ExpenseDate, Description, Amount });
    } catch (err) {
        res.status(500).json({ error: 'خطأ في إضافة المصروف', details: err.message });
    }
});

// Add PUT and DELETE for expenses if needed


// --- Payments Endpoints ---
// POST /api/payments (Manual Payment or Payment towards a Sale)
backend.post('/api/payments', async (req, res) => {
    const { TraderID, Amount, PaymentDate, SaleID = null, Notes } = req.body; // SaleID is optional

    if (!TraderID || Amount == null || Amount <= 0 || !PaymentDate) {
        return res.status(400).json({ error: 'معرف التاجر، مبلغ موجب، والتاريخ مطلوبون.' });
    }

    const now = new Date().toISOString();

    try {
        await dbRun('BEGIN TRANSACTION');

        // Check trader exists
        const trader = await dbGet('SELECT 1 FROM traders WHERE TraderID = ? AND IsActive = 1', [TraderID]);
        if (!trader) throw new Error('التاجر غير موجود أو غير نشط.');

        // If linked to a sale, check if sale exists and update its PaidAmount
        if (SaleID) {
            const sale = await dbGet('SELECT TotalAmount, PaidAmount FROM sales WHERE SaleID = ? AND TraderID = ?', [SaleID, TraderID]);
            if (!sale) throw new Error(`الفاتورة رقم ${SaleID} غير موجودة لهذا التاجر.`);

            // Potentially prevent overpayment? Or allow it?
            // if (sale.PaidAmount + Amount > sale.TotalAmount) {
            //     throw new Error('المبلغ المدفوع يتجاوز المبلغ المتبقي للفاتورة.');
            // }

            const newPaidAmount = sale.PaidAmount + Amount;
            const newRemainingAmount = sale.TotalAmount - newPaidAmount;
            await dbRun(
                'UPDATE sales SET PaidAmount = ?, RemainingAmount = ?, updated_at = ? WHERE SaleID = ?',
                [newPaidAmount, newRemainingAmount, now, SaleID]
            );
        }

        // Insert the payment record
        const paymentResult = await dbRun(
            'INSERT INTO payments (TraderID, SaleID, PaymentDate, Amount, Notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [TraderID, SaleID, PaymentDate, Amount, Notes || null, now, now]
        );

        // Optional: Update trader financials/ledger here

        await dbRun('COMMIT');
        res.status(201).json({ message: 'تم تسجيل الدفعة بنجاح.', paymentID: paymentResult.lastID });

    } catch (error) {
        await dbRun('ROLLBACK');
        res.status(500).json({ error: `خطأ في تسجيل الدفعة: ${error.message}` });
    }
});

// GET /api/payments (Get all payments, possibly filtered by trader)
backend.get('/api/payments', async (req, res) => {
    const { traderId } = req.query; // Optional query parameter
    let sql = `
        SELECT p.PaymentID, p.TraderID, t.TraderName, p.SaleID, p.PaymentDate, p.Amount, p.Notes
        FROM payments p
        LEFT JOIN traders t ON p.TraderID = t.TraderID
    `;
    const params = [];
    if (traderId) {
        sql += ' WHERE p.TraderID = ?';
        params.push(traderId);
    }
    sql += ' ORDER BY p.PaymentDate DESC, p.PaymentID DESC';

    try {
        const payments = await dbAll(sql, params);
        res.json(payments);
    } catch (err) {
        res.status(500).json({ error: 'خطأ في استرجاع الدفعات' });
    }
});

// Add PUT /api/payments/:id (Careful: requires recalculating sale remaining/financials)
// Add DELETE /api/payments/:id (Careful: requires recalculating sale remaining/financials)


// --- Start Backend Server ---
backend.listen(PORT, () => {
  console.log(`Backend API server running on http://localhost:${PORT}`);
});


// --- Electron Window Setup & Lifecycle ---
let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1366, // Wider default
    height: 768, // Taller default
    webPreferences: {
      nodeIntegration: false, // Best practice: Disable Node integration in renderer
      contextIsolation: true,  // Best practice: Enable context isolation
      preload: path.join(__dirname, 'preload.js') // Use a preload script
      // Note: With contextIsolation: true and nodeIntegration: false,
      // you CANNOT directly use require('electron') or Node modules in dashboard.html's script tag.
      // Communication happens via the preload script and IPC (ipcRenderer.invoke/send).
      // For simplicity matching the original request's structure, we might revert this later if needed,
      // but this is the more secure standard.
      // ---> REVERTING FOR SIMPLICITY TO MATCH ORIGINAL CODE's ABILITY TO USE fetch DIRECTLY <---
      // nodeIntegration: true,
      // contextIsolation: false,
      // preload: undefined // Remove preload if using nodeIntegration: true
    }
  });

  // Load the HTML file
  mainWindow.loadFile(path.join(__dirname, 'dashboard.html'));

  // Open DevTools automatically (optional)
  mainWindow.webContents.openDevTools();

   mainWindow.on('closed', () => {
       mainWindow = null;
   });
}

// --- Preload Script (`preload.js`) - Needed if contextIsolation: true ---
/* Create a file named preload.js with content like this:
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Example: Expose a function to invoke a main process handler
  // invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args),
  // Example: Expose a function to send a message to main process
  // send: (channel, ...args) => ipcRenderer.send(channel, ...args),
  // Example: Expose a function to receive messages from main process
  // on: (channel, callback) => ipcRenderer.on(channel, (event, ...args) => callback(...args))
});
// You would then use window.electronAPI.invoke(...) in dashboard.html
*/


// --- Electron App Lifecycle ---
app.whenReady().then(() => {
  initDatabase(); // Initialize DB *before* creating window or starting server
  createWindow(); // Create the application window

  app.on('activate', () => {
    // On macOS it's common to re-create a window when the dock icon is clicked
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  // Quit when all windows are closed, except on macOS
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  // Close the database connection gracefully
  if (db) {
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err.message);
      } else {
        console.log('Database connection closed.');
      }
    });
  }
});

// --- IPC Handlers (Example if using preload.js) ---
/*
ipcMain.handle('some-action', async (event, arg1, arg2) => {
  // Process action in the main process
  try {
    const result = await someAsyncFunction(arg1, arg2);
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
*/
ipcMain.handle('some-action', async (event, arg1, arg2) => {
  // Process action in the main process
  try {
    const result = await someAsyncFunction(arg1, arg2);
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
