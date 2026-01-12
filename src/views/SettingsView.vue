<template>
  <section class="page">
    <div class="header">
      <div class="badge">⚙️</div>
      <h2>Sanity 設定</h2>
    </div>

    <div class="content">
      <div class="card">
        <h3>Sanity 連線資訊</h3>
        <p class="desc">請輸入您的 Sanity 專案資訊以連結至 CMS。</p>
        
        <div class="form-group">
          <label>Project ID</label>
          <div class="input-wrapper">
            <input type="text" v-model="projectId" placeholder="例如: zp7mbokg" />
            <button class="copy-btn" @click="copyToClipboard(projectId)">複製</button>
          </div>
        </div>

        <div class="form-group">
          <label>Dataset</label>
          <div class="input-wrapper">
            <input type="text" v-model="dataset" placeholder="例如: production" />
            <button class="copy-btn" @click="copyToClipboard(dataset)">複製</button>
          </div>
        </div>

        <div class="form-group">
          <label>API Token (Optional)</label>
          <div class="input-wrapper">
            <input type="password" v-model="token" placeholder="若需寫入權限請填寫" />
            <button class="copy-btn" @click="copyToClipboard(token)">複製</button>
          </div>
          <p class="help-text">需具備寫入權限 (Editor 或更高) 才能進行資料修改。</p>
        </div>

        <div class="form-group">
          <label>API Version</label>
          <div class="input-wrapper">
            <input type="text" v-model="apiVersion" placeholder="YYYY-MM-DD" />
            <button class="copy-btn" @click="copyToClipboard(apiVersion)">複製</button>
          </div>
        </div>

        <div class="actions">
          <button class="btn secondary" @click="testConnection" :disabled="isTesting">
            {{ isTesting ? '測試中...' : '測試 API 連線' }}
          </button>
          <button class="btn primary" @click="saveSettings">儲存設定</button>
        </div>
      </div>

      <div class="card" style="margin-top: 20px;">
        <h3>資料匯出</h3>
        <p class="desc">匯出目前系統中的資料為 CSV 格式。</p>
        <div class="actions start">
          <button class="btn secondary" @click="exportFoodCSV" :disabled="isExporting">
            {{ isExporting ? '匯出中...' : '匯出食品資料 (CSV)' }}
          </button>
          <button class="btn secondary" @click="exportSubscriptionCSV" :disabled="isExporting">
            {{ isExporting ? '匯出中...' : '匯出訂閱資料 (CSV)' }}
          </button>
        </div>
      </div>

    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { createClient } from '@sanity/client';
import client from '../services/sanity';

const projectId = ref('');
const dataset = ref('');
const token = ref('');
const apiVersion = ref('');
const isTesting = ref(false);
const isExporting = ref(false);

onMounted(() => {
  projectId.value = localStorage.getItem('sanity_project_id') || import.meta.env.VITE_SANITY_PROJECT_ID || '';
  dataset.value = localStorage.getItem('sanity_dataset') || import.meta.env.VITE_SANITY_DATASET || 'production';
  token.value = localStorage.getItem('sanity_token') || import.meta.env.VITE_SANITY_TOKEN || '';
  apiVersion.value = localStorage.getItem('sanity_api_version') || import.meta.env.VITE_SANITY_API_VERSION || '2023-05-03';
});

const saveSettings = () => {
  localStorage.setItem('sanity_project_id', projectId.value);
  localStorage.setItem('sanity_dataset', dataset.value);
  localStorage.setItem('sanity_token', token.value);
  localStorage.setItem('sanity_api_version', apiVersion.value);
  alert('設定已儲存，頁面將重新載入以生效。');
  window.location.reload();
};

const testConnection = async () => {
  if (!projectId.value) {
    alert('請先輸入 Project ID');
    return;
  }

  isTesting.value = true;
  try {
    const tempClient = createClient({
      projectId: projectId.value,
      dataset: dataset.value || 'production',
      useCdn: false,
      apiVersion: apiVersion.value || '2023-05-03',
      token: token.value || undefined,
      ignoreBrowserTokenWarning: true
    });

    // 1. Basic Connectivity Test
    await tempClient.fetch('count(*[0...1])');
    
    let message = '連線成功！您的 Sanity 設定正確。';

    // 2. Token Validation (if provided)
    if (token.value) {
      try {
        // Try to fetch current user info. This requires a valid token.
        // Note: @sanity/client request method usually handles auth automatically if token is provided.
        // The endpoint /users/me returns info about the token bearer.
        const user = await tempClient.request({uri: '/users/me'});
        
        const userName = user.name || user.email || user.id || 'Unknown User';
        message += `\n\n✅ Token 驗證成功\n使用者：${userName}\n權限：${user.role || '已授權'}`;
      } catch (tokenError) {
        console.warn('Token validation failed:', tokenError);
        message += '\n\n⚠️ 注意：基本連線成功，但 Token 驗證失敗。';
        message += '\n可能原因：Token 無效、權限不足，或是公開資料集允許無 Token 存取。';
        message += '\n若您需要寫入權限，請檢查 Token 是否正確。';
      }
    } else {
      message += '\n\nℹ️ 未設定 Token，僅測試公開讀取權限。';
    }
    
    alert(message);
  } catch (error) {
    console.error('Connection test failed:', error);
    alert('連線失敗：' + (error.message || '未知錯誤'));
  } finally {
    isTesting.value = false;
  }
};

const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text || '').then(() => {
    alert('已複製到剪貼簿')
  }).catch(() => {})
}

// Helper to download CSV
const downloadCSV = (content, filename) => {
  const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Escape CSV field
const escapeCSV = (field) => {
  if (field === null || field === undefined) return '';
  const stringField = String(field);
  if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
    return `"${stringField.replace(/"/g, '""')}"`;
  }
  return stringField;
};

const exportFoodCSV = async () => {
  isExporting.value = true;
  try {
    const data = await client.fetch('*[_type == "food"] | order(todate desc)');
    
    // CSV Header
    const headers = ['name', 'amount', 'price', 'shop', 'todate', 'photourl'];
    let csvContent = headers.join(',') + '\n';
    
    // CSV Rows
    data.forEach(item => {
      const row = [
        escapeCSV(item.name),
        escapeCSV(item.amount),
        escapeCSV(item.price),
        escapeCSV(item.shop),
        escapeCSV(item.todate),
        escapeCSV(item.photourl)
      ];
      csvContent += row.join(',') + '\n';
    });
    
    downloadCSV(csvContent, 'sanityfood.csv');
  } catch (error) {
    console.error('Export failed:', error);
    alert('匯出失敗：' + error.message);
  } finally {
    isExporting.value = false;
  }
};

const exportSubscriptionCSV = async () => {
  isExporting.value = true;
  try {
    const data = await client.fetch('*[_type == "subscription"] | order(nextdate asc)');
    
    // CSV Header
    const headers = ['name', 'site', 'price', 'nextdate', 'note', 'account'];
    let csvContent = headers.join(',') + '\n';
    
    // CSV Rows
    data.forEach(item => {
      const row = [
        escapeCSV(item.name),
        escapeCSV(item.site),
        escapeCSV(item.price),
        escapeCSV(item.nextdate),
        escapeCSV(item.note),
        escapeCSV(item.account)
      ];
      csvContent += row.join(',') + '\n';
    });
    
    downloadCSV(csvContent, 'sanitysubscription.csv');
  } catch (error) {
    console.error('Export failed:', error);
    alert('匯出失敗：' + error.message);
  } finally {
    isExporting.value = false;
  }
};
</script>

<style scoped>
.actions {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 12px;
}
.actions.start {
  justify-content: flex-start;
}
.btn {
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: opacity 0.2s;
}
.btn:hover {
  opacity: 0.9;
}
.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.primary {
  background: #ff5a5f;
  color: #fff;
}
.secondary {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
}
.page {
  color: #fff;
  max-width: 800px;
}
.header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}
.badge {
  width: 36px;
  height: 36px;
  border-radius: 9px;
  background: rgba(255,255,255,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}
.card {
  background: rgba(255,255,255,0.1);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(255,255,255,0.1);
}
h3 {
  margin-bottom: 8px;
  font-size: 1.2rem;
}
.desc {
  opacity: 0.7;
  margin-bottom: 24px;
  font-size: 0.9rem;
}
.form-group {
  margin-bottom: 20px;
}
.form-group:last-child {
  margin-bottom: 0;
}
label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  opacity: 0.9;
}
.help-text {
  font-size: 0.8rem;
  opacity: 0.6;
  margin-top: 6px;
}
.input-wrapper {
  display: flex;
  gap: 10px;
}
input {
  flex: 1;
  background: rgba(0,0,0,0.2);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  padding: 10px 14px;
  color: #fff;
  font-family: monospace;
  font-size: 0.95rem;
}
input:focus {
  outline: none;
  border-color: rgba(255,255,255,0.3);
}
.copy-btn {
  background: rgba(255,255,255,0.15);
  border: none;
  color: #fff;
  padding: 0 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
  white-space: nowrap;
  flex-shrink: 0;
}
.copy-btn:hover {
  background: rgba(255,255,255,0.25);
}

@media (max-width: 600px) {
  .actions {
    justify-content: flex-start;
  }
  .actions .btn {
    width: 100%;
  }
}
</style>
