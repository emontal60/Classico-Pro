<template>
  <div class="dashboard-wrapper">
    <main class="main-area glass-panel page-watermark" style="width: 100%;">
      <!-- Premium Header -->
      <div class="section-header-premium">
        <h2 class="premium-title-main">📜 قائمة الأسعار والخدمات</h2>
        
        <div class="header-actions">
          <div class="search-wrapper">
            <input type="text" v-model="searchQuery" placeholder="بحث عن صنف..." class="search-input-glass">
          </div>
          <button v-if="selectedIds.length > 0 && store.canAccess('menu', 'edit')" @click="deleteSelected" class="btn-delete-multi">
             🗑️ حذف المختار ({{ selectedIds.length }})
          </button>
          <button v-if="store.canAccess('menu', 'edit')" @click="showAddModal = true" class="btn-add-premium">+ إضافة صنف جديد</button>
        </div>
      </div>

      <div class="table-container-modern">
        <table class="premium-table">
          <thead>
            <tr>
              <th style="width: 50px; text-align: center;">
                <input type="checkbox" :checked="isAllSelected" @change="toggleSelectAll" class="checkbox-modern">
              </th>
              <th style="width: 80px;">ID</th>
              <th style="text-align: right; padding-right: 2rem;">اسم الصنف والخدمة</th>
              <th style="text-align: center;">السعر الحالي</th>
              <th style="text-align: center;">إجراءات التحكم</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in filteredMenu" :key="item.id" class="premium-row" :class="{ 'row-selected': selectedIds.includes(item.id) }">
              <td style="text-align: center;">
                <input type="checkbox" v-model="selectedIds" :value="item.id" class="checkbox-modern">
              </td>
              <td class="id-cell">#{{ item.id }}</td>
              <td style="text-align: right; padding-right: 2rem;">
                <span class="item-name-styled">{{ getItemIcon(item.name) }} {{ item.name }}</span>
              </td>
              <td style="text-align: center;">
                <span class="price-badge">{{ formatCurrency(item.price) }} ج</span>
              </td>
              <td style="text-align: center;">
                <div v-if="store.canAccess('menu', 'edit')" class="action-group">
                  <button @click="editItem(item)" class="btn-action edit" title="تعديل">✏️</button>
                  <button @click="deleteItem(item.id)" class="btn-action delete" title="حذف">🗑️</button>
                </div>
              </td>
            </tr>
            <tr v-if="!filteredMenu.length">
              <td colspan="5" style="text-align: center; padding: 5rem; color: var(--text-muted);">
                لا توجد أصناف تطابق بحثك حالياً 🔍
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>

    <!-- Add/Edit Modal (Modern - Locked to X) -->
    <div v-if="showAddModal" class="overlay">
      <div class="modal glass-panel" style="width: 450px;">
        <div class="modal-header">
          <h2 style="color: var(--accent-cyan);">{{ editingId ? 'تعديل الصنف' : 'إضافة صنف جديد' }}</h2>
          <button @click="closeModal" class="btn-icon">✖</button>
        </div>
        <div class="modal-body" style="padding: 1.5rem 0;">
          <div class="form-group-modern">
            <label>اسم الصنف</label>
            <input type="text" v-model="form.name" placeholder="مثال: قهوة تركي" class="input-field-modern">
          </div>
          <div class="form-group-modern" style="margin-top: 1.5rem;">
            <label>السعر (بالجنيه)</label>
            <input type="number" v-model="form.price" placeholder="0.00" class="input-field-modern price-input">
          </div>
        </div>
        <div class="modal-footer" style="margin-top: 1rem;">
          <button @click="saveItem" class="btn-save-modern" style="width:100%;">{{ editingId ? 'حفظ التعديلات' : 'إضافة للقائمة' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue';
import { useAppStore } from '../stores/appStore';
import { useUIStore } from '../stores/uiStore';

const store = useAppStore();
const ui = useUIStore();

const searchQuery = ref('');
const showAddModal = ref(false);
const editingId = ref(null);
const form = reactive({ name: '', price: 0 });
const selectedIds = ref([]);

const menu = computed(() => store.menu);

const filteredMenu = computed(() => {
  return menu.value.filter(m => m.name.toLowerCase().includes(searchQuery.value.toLowerCase()));
});

// Selection Logic
const isAllSelected = computed(() => {
  return filteredMenu.value.length > 0 && filteredMenu.value.every(item => selectedIds.value.includes(item.id));
});

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    // Unselect only the currently filtered items
    const filteredIds = filteredMenu.value.map(i => i.id);
    selectedIds.value = selectedIds.value.filter(id => !filteredIds.includes(id));
  } else {
    // Select all filtered items + keep previous selections
    const newSelections = [...selectedIds.value];
    filteredMenu.value.forEach(item => {
      if (!newSelections.includes(item.id)) newSelections.push(item.id);
    });
    selectedIds.value = newSelections;
  }
};

const deleteSelected = async () => {
  const confirmed = await ui.confirm({
    title: 'حذف عناصر مختارة',
    message: `هل أنت متأكد من حذف ${selectedIds.value.length} صنف مختار؟`,
    type: 'danger'
  });
  if (confirmed) {
    store.menu = store.menu.filter(m => !selectedIds.value.includes(m.id));
    store.saveToServer();
    selectedIds.value = [];
    ui.showToast('تم حذف الأصناف المختارة');
  }
};

const editItem = (item) => {
  editingId.value = item.id;
  form.name = item.name;
  form.price = item.price;
  showAddModal.value = true;
};

const deleteItem = async (id) => {
  const confirmed = await ui.confirm({
    title: 'حذف صنف',
    message: 'هل أنت متأكد من حذف هذا الصنف نهائياً؟',
    type: 'danger'
  });
  if (confirmed) {
    store.menu = store.menu.filter(m => m.id !== id);
    store.saveToServer();
    ui.showToast('تم حذف الصنف بنجاح');
  }
};

const saveItem = () => {
  if (!form.name || form.price <= 0) {
    ui.showToast('يرجى إدخال اسم وسعر صحيح', 'error');
    return;
  }

  if (editingId.value) {
    const idx = store.menu.findIndex(m => m.id === editingId.value);
    if (idx !== -1) {
      store.menu[idx] = { id: editingId.value, ...form };
    }
  } else {
    const newId = store.menu.length > 0 ? Math.max(...store.menu.map(m => m.id)) + 1 : 1;
    store.menu.push({ id: newId, ...form });
  }

  store.saveToServer();
  ui.showToast('تم حفظ الصنف بنجاح ✅');
  closeModal();
};

const closeModal = () => {
  showAddModal.value = false;
  editingId.value = null;
  form.name = '';
  form.price = 0;
};

const getItemIcon = (name = '') => {
  const n = name.toLowerCase();
  
  // 1. Waffles (الوافلز) -> Waffle dessert emoji 🧇
  if (n.includes('وافل') || n.includes('waffle')) {
    return '🧇';
  }
  
  // 2. Pancakes (بان كيك) -> Pancakes/Dessert emoji 🥞
  if (n.includes('بان كيك') || n.includes('pancake')) {
    return '🥞';
  }
  
  // 3. Sandwiches (الساندوتشات) -> Sandwich logo 🥪
  if (n.includes('ساندوتش') || n.includes('sandwich')) {
    return '🥪';
  }
  
  // 4. Stroop (الستروب) -> Juice emoji 🍹
  if (n.includes('ستروب') || n.includes('stroop')) {
    return '🍹';
  }
  
  // 5. Mojitos (موهيتو) -> Summer refreshing juice 🍹
  if (n.includes('موهيتو') || n.includes('mojito')) {
    return '🍹';
  }
  
  // 6. Cans & Pepsi (الكانز والبيبسي) -> Pepsi icon 🥤
  if (n.includes('بيبسي') || n.includes('pepsi') || n.includes('كولا') || n.includes('cola') || n.includes('سفن') || n.includes('7up') || n.includes('كان') || n.includes('كانز') || n.includes('ريدبول') || n.includes('redbull') || n.includes('شويبس') || n.includes('سبرايت') || n.includes('sprite')) {
    return '🥤';
  }
  
  // 7. Indomie & Noodles (الأندومي والنودلز والشعيرية) -> Indomie noodle bowl 🍜
  if (n.includes('اندومي') || n.includes('أندومي') || n.includes('إندومي') || n.includes('indomie') || n.includes('نودلز') || n.includes('noodles') || n.includes('شعريه') || n.includes('شعرية')) {
    return '🍜';
  }
  
  // 8. Milk & Milkshakes (منتجات الحليب أو اللبن أو الميلك) -> Milk drink logo 🥛
  if (n.includes('ميلك') || n.includes('milk') || n.includes('لبن') || n.includes('حليب')) {
    return '🥛';
  }
  
  // 9. Ice & Smoothies (آيس و سموزي) -> Iced/cold drink icon 🧊
  if (n.includes('ايس') || n.includes('آيس') || n.includes('ice') || n.includes('iced') || n.includes('cold') || n.includes('سموزى') || n.includes('سموذي') || n.includes('smoothie')) {
    return '🧊';
  }
  
  // 10. Fresh Juices & Fruits (عصائر الفواكه الطبيعية الأخرى) -> Fruit/Juice emoji 🍹
  if (n.includes('مانجو') || n.includes('mango') || n.includes('فراولة') || n.includes('strawber') || n.includes('جوافة') || n.includes('guava') || n.includes('موز') || n.includes('banana') || n.includes('بلح') || n.includes('dates') || n.includes('عصير') || n.includes('juice') || n.includes('ليمون') || n.includes('lemon') || n.includes('عناب') || n.includes('تمر هندي') || n.includes('فروت سلاد') || n.includes('فواكه') || n.includes('خوخ')) {
    return '🍹';
  }
  
  // 11. Hot Drinks & Coffees (القهوة والمشروبات الساخنة) -> Hot Beverage ☕
  if (n.includes('هوت') || n.includes('ساخن') || n.includes('hot') || n.includes('قهوة') || n.includes('coffee') || n.includes('نسكافيه') || n.includes('اسبريسو') || n.includes('espresso') || n.includes('لاتيه') || n.includes('latte') || n.includes('كابتشينو') || n.includes('سخاكنية') || n.includes('سحلب') || n.includes('قرفة') || n.includes('موكا') || n.includes('mocha')) {
    return '☕';
  }
  
  // 12. Teas & Herbs (الشاي والأعشاب) -> Teapot 🫖
  if (n.includes('شاي') || n.includes('tea') || n.includes('كركديه') || n.includes('ينسون') || n.includes('نعناع') || n.includes('حلبه') || n.includes('حلبة')) {
    return '🫖';
  }
  
  // 13. Water (المياه) -> Water drop 💧
  if (n.includes('ماء') || n.includes('مياه') || n.includes('water')) {
    return '💧';
  }
  
  // 14. Shisha (الشيشة والمعسل) -> Smoke 💨
  if (n.includes('شيشة') || n.includes('شيشه') || n.includes('معسل') || n.includes('حجر') || n.includes('لي') || n.includes('تفاحين')) {
    return '💨';
  }
  
  // 15. Games & Lounge (ألعاب وصالة) -> Gamepad 🎮
  if (n.includes('لعب') || n.includes('ساعة') || n.includes('ساعه') || n.includes('بلايستيشن') || n.includes('playstation') || n.includes('ps') || n.includes('دراع') || n.includes('جيم') || n.includes('بلياردو') || n.includes('تنس') || n.includes('طاولة')) {
    return '🎮';
  }
  
  return '🏷️'; // Fallback tag emoji for general/miscellaneous items
};

const formatCurrency = (val) => new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val || 0);
</script>

<style scoped>
/* Header Styling */
.section-header-premium {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.5rem;
  gap: 2rem;
}
.header-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}
.btn-add-premium {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.7rem 1.5rem;
  border-radius: 10px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}
.btn-add-premium:hover {
  background: #2563eb;
}
.btn-delete-multi {
  background: #ef4444;
  color: white;
  border: none;
  padding: 0.7rem 1.5rem;
  border-radius: 10px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}
.btn-delete-multi:hover {
  background: #dc2626;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(239, 68, 68, 0.3);
}

.search-input-glass {
  background: rgba(255,255,255,0.05);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 0.7rem 1.2rem;
  color: white;
  width: 280px;
}
.search-input-glass:focus {
  border-color: var(--accent-cyan);
  outline: none;
  box-shadow: 0 0 15px rgba(0, 229, 255, 0.2);
}

/* Modern Table */
.table-container-modern {
  background: rgba(0,0,0,0.2);
  border-radius: 15px;
  overflow-y: auto;
  max-height: calc(100vh - 240px); /* Dynamic height to fill the screen */
  border: 1px solid rgba(255,255,255,0.05);
  margin-bottom: 2rem;
}
.premium-table {
  width: 100%;
  border-collapse: collapse;
}
.premium-table th {
  background: rgba(30, 41, 59, 0.95);
  padding: 1.2rem;
  font-size: 0.9rem;
  color: var(--text-muted);
  text-transform: uppercase;
  position: sticky;
  top: 0;
  z-index: 10;
}
.premium-row {
  border-bottom: 1px solid rgba(255,255,255,0.03);
  transition: all 0.2s ease;
}
.premium-row:hover {
  background: rgba(255,255,255,0.02);
}
.row-selected {
  background: rgba(0, 229, 255, 0.05) !important;
}
.checkbox-modern {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: var(--accent-cyan);
}
.premium-row td {
  padding: 1.2rem;
}

.id-cell {
  color: var(--text-muted);
  font-family: monospace;
  font-size: 0.85rem;
  text-align: center;
}
.item-name-styled {
  font-weight: 700;
  color: var(--text-main);
  font-size: 1.05rem;
}
.price-badge {
  background: rgba(0, 229, 255, 0.1);
  color: var(--accent-cyan);
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-weight: 800;
  border: 1px solid rgba(0, 229, 255, 0.2);
}

/* Actions */
.action-group {
  display: flex;
  gap: 0.8rem;
  justify-content: center;
}
.btn-action {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  padding: 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.btn-action.edit:hover { background: rgba(59, 130, 246, 0.2); border-color: #3b82f6; }
.btn-action.delete:hover { background: rgba(239, 68, 68, 0.2); border-color: #ef4444; }

/* Modal Modern */
.form-group-modern label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-muted);
  font-size: 0.9rem;
}
.input-field-modern {
  width: 100%;
  background: rgba(0,0,0,0.3);
  border: 1px solid var(--border-color);
  padding: 0.8rem;
  border-radius: 8px;
  color: white;
}
.price-input {
  color: var(--accent-cyan);
  font-weight: 800;
  font-size: 1.2rem;
}
.btn-save-modern {
  width: 100%;
  background: #10b981;
  color: white;
  border: none;
  padding: 1rem;
  border-radius: 10px;
  font-weight: 800;
  cursor: pointer;
}
.btn-save-modern:hover {
  background: #059669;
}
</style>
