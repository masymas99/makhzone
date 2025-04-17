// dashboard.js: handles UI interactions, data loading and routing for dashboard page
// Auth guard and logout
const user = JSON.parse(localStorage.getItem('user') || 'null');
if (!user) window.location.href = 'index.html';
document.getElementById('userName').innerText = user.name;
document.getElementById('logout').addEventListener('click', () => {
  localStorage.removeItem('user');
  window.location.href = 'index.html';
});

// Loader functions
async function loadSales() {
  const res = await fetch('http://localhost:3001/api/sales');
  const data = await res.json();
  let html = '<h2 class="text-2xl mb-4">قائمة الفواتير</h2>';
  if (!res.ok) html += `<p class="text-red-600">${data.error}</p>`;
  else if (data.length === 0) html += '<p>لا توجد فواتير.</p>';
  else {
    html += '<table class="min-w-full bg-white border"><thead><tr><th class="border px-2 py-1">ID</th><th class="border px-2 py-1">التاجر</th><th class="border px-2 py-1">التاريخ</th><th class="border px-2 py-1">الإجمالي</th></tr></thead><tbody>';
    data.forEach(s => {
      html += `<tr><td class="border px-2 py-1">${s.SaleID}</td><td class="border px-2 py-1">${s.trader?.TraderName || '-'}<\/td><td class="border px-2 py-1">${s.SaleDate}</td><td class="border px-2 py-1">${s.TotalAmount}</td><\/tr>`;
    });
    html += '<\/tbody><\/table>';
  }
  document.getElementById('content').innerHTML = html;
}

async function loadProducts() {
  const res = await fetch('http://localhost:3001/api/products');
  const data = await res.json();
  let html = '<div class="flex justify-between items-center mb-4">'
    + '<h2 class="text-2xl">المنتجات</h2>'
    + '<button id="addProductBtn" class="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600">+ إضافة منتج</button>'
  + '</div>';
  html += '<table class="min-w-full bg-white border">';
  html += '<thead><tr><th class="border px-2 py-1">ID</th><th class="border px-2 py-1">الاسم</th><th class="border px-2 py-1">الصنف</th><th class="border px-2 py-1">الكمية</th><th class="border px-2 py-1">السعر</th><th class="border px-2 py-1">الإجراءات</th></tr></thead>';
  html += '<tbody>';
  if (res.ok && data.length) {
    data.forEach(p => {
      html += '<tr>' +
        `<td class="border px-2 py-1">${p.ProductID}</td>` +
        `<td class="border px-2 py-1">${p.ProductName}</td>` +
        `<td class="border px-2 py-1">${p.Category}</td>` +
        `<td class="border px-2 py-1">${p.StockQuantity}</td>` +
        `<td class="border px-2 py-1">${p.UnitPrice}</td>` +
        '<td class="border px-2 py-1">' +
          `<button data-id="${p.ProductID}" class="edit-product bg-yellow-400 px-2 py-1 rounded mr-1">تعديل</button>` +
          `<button data-id="${p.ProductID}" class="delete-product bg-red-500 text-white px-2 py-1 rounded">حذف</button>` +
        '</td></tr>';
    });
  } else html += '<tr><td colspan="6" class="text-center py-2">لا توجد بيانات</td></tr>';
  html += '</tbody></table>';
  document.getElementById('content').innerHTML = html;
  document.getElementById('addProductBtn').addEventListener('click', showAddProductForm);
  document.querySelectorAll('.edit-product').forEach(btn => btn.addEventListener('click', () => showEditProductForm(btn.dataset.id)));
  document.querySelectorAll('.delete-product').forEach(btn => btn.addEventListener('click', () => deleteProduct(btn.dataset.id)));
}

async function loadTraders() {
  const res = await fetch('http://localhost:3001/api/traders');
  const data = await res.json();
  let html = '<div class="flex justify-between items-center mb-4">'
    + '<h2 class="text-2xl">التجار</h2>'
    + '<button id="addTraderBtn" class="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600">+ إضافة تاجر</button>'
  + '</div>';
  html += '<table class="min-w-full bg-white border"><thead><tr><th class="border px-2 py-1">ID</th><th class="border px-2 py-1">الاسم</th><th class="border px-2 py-1">الرصيد</th></tr></thead><tbody>';
  if (res.ok && data.length) {
    data.forEach(t => {
      html += `<tr><td class="border px-2 py-1">${t.TraderID}</td><td class="border px-2 py-1">${t.TraderName}</td><td class="border px-2 py-1">${t.Balance}</td><\/tr>`;
    });
  } else html += '<tr><td colspan="3" class="text-center py-2">لا توجد بيانات</td></tr>';
  html += '<\/tbody><\/table>';
  document.getElementById('content').innerHTML = html;
  document.getElementById('addTraderBtn').addEventListener('click', showAddTraderForm);
}

async function loadPurchases() {
  const res = await fetch('http://localhost:3001/api/purchases');
  const data = await res.json();
  let html = `
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-2xl">المشتريات</h2>
      <button id="addPurchaseBtn" class="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600">+ إنشاء مشتريات</button>
    </div>
  `;
  html += '<table class="min-w-full bg-white border"><thead><tr><th class="border px-2 py-1">ID</th><th class="border px-2 py-1">المنتج</th><th class="border px-2 py-1">المورد</th><th class="border px-2 py-1">الكمية</th><th class="border px-2 py-1">التكلفة</th></tr></thead><tbody>';
  if (res.ok && data.length) {
    data.forEach(p => {
      html += `<tr><td class="border px-2 py-1">${p.PurchaseID}</td><td class="border px-2 py-1">${p.ProductName}</td><td class="border px-2 py-1">${p.SupplierName}</td><td class="border px-2 py-1">${p.Quantity}</td><td class="border px-2 py-1">${p.UnitCost}</td><\/tr>`;
    });
  } else html += '<tr><td colspan="5" class="text-center py-2">لا توجد بيانات</td><\/tr>';
  html += '<\/tbody><\/table>';
  document.getElementById('content').innerHTML = html;
  document.getElementById('addPurchaseBtn').addEventListener('click', showAddPurchaseForm);
}

async function loadExpenses() {
  const res = await fetch('http://localhost:3001/api/expenses');
  const data = await res.json();
  let html = '<h2 class="text-2xl mb-4">المصروفات</h2>';
  html += '<table class="min-w-full bg-white border"><thead><tr><th class="border px-2 py-1">ID</th><th class="border px-2 py-1">الوصف</th><th class="border px-2 py-1">المبلغ</th><th class="border px-2 py-1">التاريخ</th></tr></thead><tbody>';
  if (res.ok && data.length) {
    data.forEach(e => {
      html += `<tr><td class="border px-2 py-1">${e.id}</td><td class="border px-2 py-1">${e.description}</td><td class="border px-2 py-1">${e.Amount}</td><td class="border px-2 py-1">${e.ExpenseDate}</td><\/tr>`;
    });
  } else html += '<tr><td colspan="4" class="text-center py-2">لا توجد بيانات</td></tr>';
  html += '<\/tbody><\/table>';
  document.getElementById('content').innerHTML = html;
}

async function loadPayments() {
  const res = await fetch('http://localhost:3001/api/payments');
  const data = await res.json();
  let html = '<h2 class="text-2xl mb-4">الدفعات</h2>';
  html += '<table class="min-w-full bg-white border"><thead><tr><th class="border px-2 py-1">ID</th><th class="border px-2 py-1">ID التاجر</th><th class="border px-2 py-1">المبلغ</th><th class="border px-2 py-1">التاريخ</th></tr></thead><tbody>';
  if (res.ok && data.length) {
    data.forEach(p => {
      html += `<tr><td class="border px-2 py-1">${p.PaymentID}</td><td class="border px-2 py-1">${p.TraderID}</td><td class="border px-2 py-1">${p.Amount}</td><td class="border px-2 py-1">${p.PaymentDate}</td><\/tr>`;
    });
  } else html += '<tr><td colspan="4" class="text-center py-2">لا توجد بيانات</td></tr>';
  html += '<\/tbody><\/table>';
  document.getElementById('content').innerHTML = html;
}

function showAddProductForm() {
  const html = `
    <div class="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h3 class="text-xl mb-4">إضافة منتج</h3>
      <div id="productMsg"></div>
      <form id="productForm" class="space-y-4">
        <input type="text" id="pName" placeholder="الاسم" class="w-full border px-3 py-2 rounded" required />
        <input type="text" id="pCategory" placeholder="الصنف" class="w-full border px-3 py-2 rounded" required />
        <input type="number" id="pStock" placeholder="الكمية" class="w-full border px-3 py-2 rounded" required />
        <input type="number" step="0.01" id="pPrice" placeholder="سعر الوحدة" class="w-full border px-3 py-2 rounded" required />
        <input type="number" step="0.01" id="pCost" placeholder="تكلفة الوحدة" class="w-full border px-3 py-2 rounded" required />
        <button type="submit" class="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">حفظ</button>
      </form>
    </div>
  `;
  document.getElementById('content').innerHTML = html;
  document.getElementById('productForm').addEventListener('submit', async e => {
    e.preventDefault();
    const payload = { ProductName: document.getElementById('pName').value, Category: document.getElementById('pCategory').value, StockQuantity: +document.getElementById('pStock').value, UnitPrice: +document.getElementById('pPrice').value, UnitCost: +document.getElementById('pCost').value, IsActive: true };
    try {
      const res = await fetch('http://localhost:3001/api/products', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) });
      const data = await res.json();
      if (res.ok) loadProducts(); else document.getElementById('productMsg').innerHTML = `<p class="text-red-600">${data.error}</p>`;
    } catch {
      document.getElementById('productMsg').innerHTML = '<p class="text-red-600">خطأ في الاتصال</p>';
    }
  });
}

function showAddTraderForm() {
  const html = `
    <div class="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h3 class="text-xl mb-4">إضافة تاجر</h3>
      <div id="traderMsg"></div>
      <form id="traderForm" class="space-y-4">
        <input type="text" id="tName" placeholder="الاسم" class="w-full border px-3 py-2 rounded" required />
        <input type="text" id="tPhone" placeholder="الهاتف" class="w-full border px-3 py-2 rounded" required />
        <input type="text" id="tAddress" placeholder="العنوان" class="w-full border px-3 py-2 rounded" required />
        <button type="submit" class="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">حفظ</button>
      </form>
    </div>
  `;
  document.getElementById('content').innerHTML = html;
  document.getElementById('traderForm').addEventListener('submit', async e => {
    e.preventDefault();
    const payload = { TraderName: document.getElementById('tName').value, Phone: document.getElementById('tPhone').value, Address: document.getElementById('tAddress').value, IsActive: true };
    try {
      const res = await fetch('http://localhost:3001/api/traders', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) });
      const data = await res.json();
      if (res.ok) loadTraders(); else document.getElementById('traderMsg').innerHTML = `<p class="text-red-600">${data.error}</p>`;
    } catch {
      document.getElementById('traderMsg').innerHTML = '<p class="text-red-600">خطأ في الاتصال</p>';
    }
  });
}

// edit product
function showEditProductForm(id) {
  fetch(`http://localhost:3001/api/products/${id}`)
    .then(res => res.json())
    .then(p => {
      const html = `
        <div class="max-w-md mx-auto bg-white p-6 rounded shadow">
          <h3 class="text-xl mb-4">تعديل منتج</h3>
          <div id="productMsg"></div>
          <form id="editProductForm" class="space-y-4">
            <input type="text" id="eName" value="${p.ProductName}" class="w-full border px-3 py-2 rounded" required />
            <input type="text" id="eCategory" value="${p.Category}" class="w-full border px-3 py-2 rounded" required />
            <input type="number" id="eStock" value="${p.StockQuantity}" class="w-full border px-3 py-2 rounded" required />
            <input type="number" step="0.01" id="ePrice" value="${p.UnitPrice}" class="w-full border px-3 py-2 rounded" required />
            <input type="number" step="0.01" id="eCost" value="${p.UnitCost}" class="w-full border px-3 py-2 rounded" required />
            <button type="submit" class="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">حفظ التعديلات</button>
          </form>
        </div>
      `;
      document.getElementById('content').innerHTML = html;
      document.getElementById('editProductForm').addEventListener('submit', async e => {
        e.preventDefault();
        const payload = {
          ProductName: document.getElementById('eName').value,
          Category: document.getElementById('eCategory').value,
          StockQuantity: +document.getElementById('eStock').value,
          UnitPrice: +document.getElementById('ePrice').value,
          UnitCost: +document.getElementById('eCost').value,
          IsActive: true
        };
        try {
          const res = await fetch(`http://localhost:3001/api/products/${id}`, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) });
          const data = await res.json();
          if (res.ok) loadProducts(); else document.getElementById('productMsg').innerHTML = `<p class="text-red-600">${data.error}</p>`;
        } catch { document.getElementById('productMsg').innerHTML = '<p class="text-red-600">خطأ في الاتصال</p>'; }
      });
    });
}

// delete product
function deleteProduct(id) {
  if (!confirm('هل أنت متأكد من حذف المنتج؟')) return;
  fetch(`http://localhost:3001/api/products/${id}`, { method: 'DELETE' })
    .then(res => res.json())
    .then(() => loadProducts());
}

// Navigation handler
document.querySelectorAll('nav a').forEach(a => a.addEventListener('click', e => {
  e.preventDefault();
  const page = a.getAttribute('data-page');
  if (page === 'sales') loadSales();
  else if (page === 'products') loadProducts();
  else if (page === 'traders') loadTraders();
  else if (page === 'purchases') loadPurchases();
  else if (page === 'expenses') loadExpenses();
  else if (page === 'payments') loadPayments();
}));

// Initial load
loadSales();
