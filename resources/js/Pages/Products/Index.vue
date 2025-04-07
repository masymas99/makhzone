<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">إدارة المنتجات</h1>
      <Link href="{{ route('products.create') }}" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        إضافة منتج جديد
      </Link>
    </div>

    <div class="bg-white rounded-lg shadow overflow-hidden">
      <table class="min-w-full">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">الاسم</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">الفئة</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">الكمية</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">سعر الوحدة</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">السعر التكلفة</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">العمليات</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="product in products.data" :key="product.ProductID">
            <td class="px-6 py-4 whitespace-nowrap">{{ product.ProductName }}</td>
            <td class="px-6 py-4 whitespace-nowrap">{{ product.Category }}</td>
            <td class="px-6 py-4 whitespace-nowrap">{{ product.StockQuantity }}</td>
            <td class="px-6 py-4 whitespace-nowrap">{{ product.UnitPrice }}</td>
            <td class="px-6 py-4 whitespace-nowrap">{{ product.UnitCost }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <Link :href="route('products.edit', product.ProductID)" class="text-indigo-600 hover:text-indigo-900 mr-2">
                تعديل
              </Link>
              <button @click="deleteProduct(product.ProductID)" class="text-red-600 hover:text-red-900">
                حذف
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <Pagination :links="products.links" />
    </div>
  </div>
</template>

<script setup>
import { Link } from '@inertiajs/vue3';
import Pagination from '@/Components/Pagination.vue';
import { router } from '@inertiajs/vue3';

const props = defineProps({
  products: Object,
});

const deleteProduct = (id) => {
  if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
    router.delete(route('products.destroy', id));
  }
};
</script>
