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

      <div class="card" style="margin-top: 20px;">
        <h3>資料匯入</h3>
        <p class="desc">請選擇 CSV 檔案匯入資料至 Sanity。請確保 CSV 欄位名稱與系統相符。</p>
        
        <div class="form-group">
          <label>匯入食品資料 (Food)</label>
          <div class="input-wrapper">
            <input type="file" accept=".csv" @change="e => importCSV(e, 'food')" :disabled="isImporting" />
          </div>
        </div>

        <div class="form-group">
          <label>匯入訂閱資料 (Subscription)</label>
          <div class="input-wrapper">
            <input type="file" accept=".csv" @change="e => importCSV(e, 'subscription')" :disabled="isImporting" />
          </div>
        </div>
        
        <p v-if="isImporting" class="status-text">🔄 資料匯入中，請稍候...</p>
      </div>

      <div class="card" style="margin-top: 20px;">
        <h3>資料初始化</h3>
        <p class="desc">若您的 Sanity 資料集為空，可由此自動建立範例資料以供測試。</p>
        <div class="actions start">
          <button class="btn secondary" @click="createSampleData" :disabled="isCreating">
            {{ isCreating ? '建立中...' : '建立範例資料 (Food & Subscription)' }}
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
const isImporting = ref(false);
const isCreating = ref(false);

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

// Helper to parse CSV line handling quotes
const parseCSVLine = (line) => {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
};

const importCSV = async (event, type) => {
  const file = event.target.files[0];
  if (!file) return;

  if (!confirm(`確定要匯入 ${file.name} 嗎？\n這將會新增資料至 ${type}。`)) {
    event.target.value = ''; // Reset input
    return;
  }

  isImporting.value = true;
  const reader = new FileReader();

  reader.onload = async (e) => {
    try {
      const text = e.target.result;
      // Remove BOM if exists
      const content = text.startsWith('\uFEFF') ? text.slice(1) : text;
      
      const lines = content.split(/\r\n|\n/).filter(line => line.trim());
      if (lines.length < 2) {
        throw new Error('CSV 檔案內容為空或格式錯誤');
      }

      const headers = parseCSVLine(lines[0]).map(h => h.trim());
      const transaction = client.transaction();
      let count = 0;

      for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        if (values.length !== headers.length) continue;

        const doc = { _type: type };
        headers.forEach((header, index) => {
          let value = values[index];
          
          // Type conversion based on field name
          if (['amount', 'price'].includes(header)) {
            value = value ? Number(value) : 0;
          } else if (header === 'todate' || header === 'nextdate') {
            // Ensure date format or null
            value = value ? value : null;
          }
          
          if (header) doc[header] = value;
        });

        transaction.create(doc);
        count++;
      }

      await transaction.commit();
      alert(`✅ 成功匯入 ${count} 筆資料！`);
      
    } catch (error) {
      console.error('Import failed:', error);
      alert('❌ 匯入失敗：' + error.message);
    } finally {
      isImporting.value = false;
      event.target.value = ''; // Reset input
    }
  };

  reader.onerror = () => {
    alert('❌ 讀取檔案失敗');
    isImporting.value = false;
    event.target.value = '';
  };

  reader.readAsText(file);
};

const createSampleData = async () => {
  if (!confirm('確定要建立範例資料嗎？這將會在您的 Sanity 資料集中新增一筆 Food 和一筆 Subscription 資料。')) {
    return;
  }

  isCreating.value = true;
  try {
    // 1. Create Sample Food
    const foodDoc = {
      _type: 'food',
      name: '範例蘋果 (Sample Apple)',
      amount: 5,
      price: 100,
      shop: '全聯',
      todate: new Date().toISOString().split('T')[0], // Today
      photourl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6'
    };

    // 2. Create Sample Subscription
    const subDoc = {
      _type: 'subscription',
      name: '範例 Netflix (Sample)',
      site: 'https://www.netflix.com',
      price: 390,
      nextdate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +30 days
      note: '家庭方案',
      account: 'test@example.com'
    };

    // Transaction to ensure both are created or none
    const transaction = client.transaction()
      .create(foodDoc)
      .create(subDoc);

    await transaction.commit();
    
    alert('✅ 範例資料建立成功！\n請至「食品管理」與「訂閱管理」頁面查看。');
  } catch (error) {
    console.error('Create sample data failed:', error);
    alert('❌ 建立失敗：' + (error.message || '未知錯誤') + '\n請確認您的 Token 具有寫入權限 (Editor)。');
  } finally {
    isCreating.value = false;
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
