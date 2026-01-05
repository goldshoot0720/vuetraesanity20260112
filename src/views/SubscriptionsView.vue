<template>
  <section class="page">
    <div class="header">
      <div class="badge">🧾</div>
      <h2>訂閱管理系統</h2>
      <div class="actions">
        <button class="btn" @click="fetchData">重新載入</button>
        <button class="btn primary" @click="openModal(null)">新增訂閱</button>
      </div>
    </div>
    <div class="toolbar">
      <input class="search" placeholder="搜尋訂閱名稱或網站..." />
      <button class="btn">🔍 搜尋</button>
    </div>
    <div class="list">
      <div class="item" v-for="item in subscriptions" :key="item.id">
        <div class="main-info">
          <div class="name">{{ item.get('name') || '未命名' }}</div>
          <div class="site-link" v-if="item.get('site')">
            <a :href="item.get('site')" target="_blank" rel="noopener">🌐 前往網站</a>
          </div>
        </div>
        <div class="meta">
          <div class="price">價格：${{ item.get('price') || 0 }}</div>
          <div class="date">下期：{{ item.get('nextdate') ? new Date(item.get('nextdate')).toLocaleDateString() : '未設定' }}</div>
          <div class="note" v-if="item.get('note')">備註：{{ item.get('note') }}</div>
        </div>
        <div class="ops">
          <button class="btn" @click="openModal(item)">編輯</button>
          <button class="btn danger" @click="deleteSubscription(item)">刪除</button>
        </div>
      </div>
      <div v-if="subscriptions.length === 0" class="no-data">
        暫無資料或載入中...
      </div>
    </div>

    <!-- 編輯/新增 Modal -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal">
        <h3>{{ editingItem ? '編輯訂閱' : '新增訂閱' }}</h3>
        <div class="form-group">
          <label>名稱</label>
          <input v-model="formData.name" placeholder="請輸入訂閱名稱" />
        </div>
        <div class="form-group">
          <label>價格</label>
          <input type="number" v-model.number="formData.price" placeholder="請輸入價格" />
        </div>
        <div class="form-group">
          <label>下期扣款日</label>
          <input type="date" v-model="formData.nextdate" />
        </div>
        <div class="form-group">
          <label>網站連結</label>
          <input v-model="formData.site" placeholder="https://..." />
        </div>
        <div class="form-group">
          <label>備註</label>
          <input v-model="formData.note" placeholder="備註事項" />
        </div>
        <div class="modal-actions">
          <button class="btn" @click="closeModal">取消</button>
          <button class="btn primary" @click="saveSubscription">儲存</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import Parse from '../services/parse';

const subscriptions = ref([]);
const showModal = ref(false);
const editingItem = ref(null);
const formData = reactive({
  name: '',
  price: 0,
  nextdate: '',
  site: '',
  note: ''
});

const openModal = (item = null) => {
  editingItem.value = item;
  if (item) {
    formData.name = item.get('name');
    formData.price = item.get('price');
    // Format date for input[type="date"]
    const date = item.get('nextdate');
    formData.nextdate = date ? new Date(date).toISOString().split('T')[0] : '';
    formData.site = item.get('site');
    formData.note = item.get('note');
  } else {
    // Reset form
    formData.name = '';
    formData.price = 0;
    formData.nextdate = '';
    formData.site = '';
    formData.note = '';
  }
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  editingItem.value = null;
};

const saveSubscription = async () => {
  try {
    const Subscriptions = Parse.Object.extend('subscription');
    let subscription;

    if (editingItem.value) {
      subscription = editingItem.value;
    } else {
      subscription = new Subscriptions();
    }

    subscription.set('name', formData.name);
    subscription.set('price', Number(formData.price));
    if (formData.nextdate) {
      subscription.set('nextdate', new Date(formData.nextdate));
    }
    subscription.set('site', formData.site);
    subscription.set('note', formData.note);

    await subscription.save();
    closeModal();
    fetchData(); // Refresh list
  } catch (error) {
    console.error('Error saving subscription:', error);
    alert('儲存失敗：' + error.message);
  }
};

const deleteSubscription = async (item) => {
  if (!confirm('確定要刪除此訂閱嗎？')) return;
  
  try {
    await item.destroy();
    fetchData(); // Refresh list
  } catch (error) {
    console.error('Error deleting subscription:', error);
    alert('刪除失敗：' + error.message);
  }
};

const fetchData = async () => {
  try {
    // 根據截圖，Class 名稱是小寫的 'subscription'
    const Subscriptions = Parse.Object.extend('subscription');
    const query = new Parse.Query(Subscriptions);
    query.ascending('nextdate');
    // 根據截圖欄位：name, nextdate, price, site, note
    subscriptions.value = await query.find();
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
  }
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
.list {
  display: grid;
  gap: 10px;
}
.item {
  background: rgba(255,255,255,0.08);
  border-radius: 12px;
  padding: 12px;
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  align-items: center;
  gap: 10px;
}
.main-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.name {
  font-weight: 600;
  font-size: 16px;
}
.site-link a {
  color: #4facfe;
  text-decoration: none;
  font-size: 13px;
}
.meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 14px;
  opacity: 0.9;
}
.note {
  font-size: 12px;
  opacity: 0.7;
  color: #ffeb3b;
}
.ops .btn {
  background: rgba(255,255,255,0.2);
  border: none;
  color: #fff;
  padding: 6px 10px;
  border-radius: 8px;
  margin-left: 6px;
}
.ops .danger {
  background: #ff5a5f;
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
