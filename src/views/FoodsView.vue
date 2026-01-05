<template>
  <section class="page">
    <div class="header">
      <div class="badge">🍎</div>
      <h2>食品管理系統</h2>
      <div class="actions">
        <button class="btn" @click="fetchData">重新載入</button>
        <button class="btn primary" @click="openModal(null)">新增食品</button>
      </div>
    </div>
    <div class="toolbar">
      <input class="search" placeholder="搜尋食品名稱或商店..." />
      <button class="btn">🔍 搜尋</button>
    </div>
    <div class="cards">
      <div class="card" v-for="item in foods" :key="item.id">
        <div class="thumb food" :style="item.get('photo') ? { backgroundImage: `url(${item.get('photo')})` } : {}"></div>
        <div class="meta">
          <div class="name">{{ item.get('name') || '未命名' }}</div>
          <div class="info">
            <span v-if="item.get('shop')" class="shop-tag">🏠 {{ item.get('shop') }}</span>
            <div class="details">
              <span>數量：{{ item.get('amount') || 0 }}</span>
              <span>價格：${{ (item.get('price') || 0).toLocaleString() }}</span>
            </div>
            <div class="expiry" :class="{ expired: isExpired(item.get('todate')), warning: isExpiringSoon(item.get('todate')) }">
              📅 {{ item.get('todate') ? new Date(item.get('todate')).toLocaleDateString() : '未設定' }}
              <span v-if="item.get('todate')">({{ getDaysRemaining(item.get('todate')) }})</span>
            </div>
          </div>
          <div class="ops">
            <button class="btn" @click="openModal(item)">編輯</button>
            <button class="btn danger" @click="deleteFood(item)">刪除</button>
          </div>
        </div>
      </div>
      <div v-if="foods.length === 0" class="no-data">
        暫無資料或載入中...
      </div>
    </div>

    <!-- 編輯/新增 Modal -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal">
        <h3>{{ editingItem ? '編輯食品' : '新增食品' }}</h3>
        <div class="form-group">
          <label>名稱</label>
          <input v-model="formData.name" placeholder="請輸入食品名稱" />
        </div>
        <div class="form-group">
          <label>數量</label>
          <input type="number" v-model.number="formData.amount" placeholder="請輸入數量" />
        </div>
        <div class="form-group">
          <label>價格</label>
          <input type="number" v-model.number="formData.price" placeholder="請輸入價格" />
        </div>
        <div class="form-group">
          <label>商店</label>
          <input v-model="formData.shop" placeholder="購買商店" />
        </div>
        <div class="form-group">
          <label>到期日</label>
          <input type="date" v-model="formData.todate" />
        </div>
        <div class="form-group">
          <label>圖片連結</label>
          <input v-model="formData.photo" placeholder="https://..." />
        </div>
        <div class="modal-actions">
          <button class="btn" @click="closeModal">取消</button>
          <button class="btn primary" @click="saveFood">儲存</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import Parse from '../services/parse';

const foods = ref([]);
const showModal = ref(false);
const editingItem = ref(null);
const formData = reactive({
  name: '',
  amount: 0,
  price: 0,
  shop: '',
  todate: '',
  photo: ''
});

const openModal = (item = null) => {
  editingItem.value = item;
  if (item) {
    formData.name = item.get('name');
    formData.amount = item.get('amount');
    formData.price = item.get('price');
    formData.shop = item.get('shop');
    const date = item.get('todate');
    formData.todate = date ? new Date(date).toISOString().split('T')[0] : '';
    formData.photo = item.get('photo');
  } else {
    // Reset form
    formData.name = '';
    formData.amount = 0;
    formData.price = 0;
    formData.shop = '';
    formData.todate = '';
    formData.photo = '';
  }
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  editingItem.value = null;
};

const saveFood = async () => {
  try {
    const Food = Parse.Object.extend('food');
    let food;

    if (editingItem.value) {
      food = editingItem.value;
    } else {
      food = new Food();
    }

    food.set('name', formData.name);
    food.set('amount', Number(formData.amount));
    food.set('price', Number(formData.price));
    food.set('shop', formData.shop);
    if (formData.todate) {
      food.set('todate', new Date(formData.todate));
    }
    food.set('photo', formData.photo);

    await food.save();
    closeModal();
    fetchData(); // Refresh list
  } catch (error) {
    console.error('Error saving food:', error);
    alert('儲存失敗：' + error.message);
  }
};

const deleteFood = async (item) => {
  if (!confirm('確定要刪除此食品嗎？')) return;
  
  try {
    await item.destroy();
    fetchData(); // Refresh list
  } catch (error) {
    console.error('Error deleting food:', error);
    alert('刪除失敗：' + error.message);
  }
};

const fetchData = async () => {
  try {
    // 根據截圖，Class 名稱是小寫的 'food'
    const Food = Parse.Object.extend('food');
    const query = new Parse.Query(Food);
    
    // 依據到期日排序，快過期的排前面
    query.ascending('todate');

    // 根據截圖欄位：name, amount, todate, photo, price, shop
    foods.value = await query.find();
  } catch (error) {
    console.error('Error fetching foods:', error);
  }
};

const getDaysRemaining = (date) => {
  if (!date) return '';
  const now = new Date();
  const target = new Date(date);
  const diffTime = target - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return '已過期';
  if (diffDays === 0) return '今天到期';
  return `剩 ${diffDays} 天`;
};

const isExpired = (date) => {
  if (!date) return false;
  return new Date(date) < new Date();
};

const isExpiringSoon = (date) => {
  if (!date) return false;
  const now = new Date();
  const target = new Date(date);
  const diffTime = target - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays >= 0 && diffDays <= 7;
};

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.page {
  color: #fff;
}
.header {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}
.badge {
  width: 36px;
  height: 36px;
  border-radius: 9px;
  background: rgba(255,255,255,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}
.actions .btn {
  background: rgba(255,255,255,0.2);
  border: none;
  color: #fff;
  padding: 8px 12px;
  border-radius: 8px;
  margin-left: 8px;
}
.actions .primary {
  background: #ff5a5f;
}
.toolbar {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}
.search {
  flex: 1;
  padding: 8px 12px;
  border-radius: 10px;
  border: none;
}
.cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}
.card {
  background: rgba(255,255,255,0.08);
  border-radius: 12px;
  overflow: hidden;
  display: grid;
  grid-template-columns: 140px 1fr;
}
.thumb.food {
  background: linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.05));
  background-size: cover;
  background-position: center;
}
.meta {
  padding: 10px 12px;
}
.name {
  font-weight: 600;
}
.info {
  font-size: 12px;
  opacity: 0.9;
  margin: 6px 0;
}
.ops .btn {
  background: rgba(255,255,255,0.2);
  border: none;
  color: #fff;
  padding: 6px 10px;
  border-radius: 8px;
  margin-right: 6px;
}
.ops .danger {
  background: #ff5a5f;
}
@media (max-width: 1000px) {
  .cards {
    grid-template-columns: 1fr;
  }
}
.shop-tag {
  display: inline-block;
  background: rgba(255, 255, 255, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  margin-bottom: 4px;
}
.details {
  display: flex;
  gap: 8px;
  font-size: 13px;
  opacity: 0.9;
  margin-bottom: 4px;
}
.expiry {
  font-size: 13px;
  color: #fff;
}
.expiry.expired {
  color: #ff5a5f;
  font-weight: bold;
}
.expiry.warning {
  color: #ffc107;
  font-weight: bold;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal {
  background: #2a2a2a;
  padding: 24px;
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  color: #fff;
}
.modal h3 {
  margin-top: 0;
  margin-bottom: 20px;
}
.form-group {
  margin-bottom: 16px;
}
.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  opacity: 0.8;
}
.form-group input {
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
  box-sizing: border-box;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 24px;
}
.modal-actions .btn {
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}
.modal-actions .btn.primary {
  background: #4facfe;
}
</style>
