<template>
  <section class="home">
    <div class="hero">
      <div class="logo">鋒</div>
      <h1 class="title">鋒兄AI資訊系統</h1>
      <p class="subtitle">智能管理您的影片和圖片收藏 · 支援智能分類和快速搜尋</p>
      <div class="copyright">鋒兄塗哥公關資訊© 版權所有 2025 ~ 2125</div>
      <div class="tech">
        <div class="card">
          <div class="card-title">⚡ 前端技術</div>
          <ul class="list">
            <li>Vue 3 (Vite)</li>
            <li>網頁存放於 Local</li>
            <li>響應式設計 + CSS</li>
          </ul>
        </div>
        <div class="card">
          <div class="card-title">🚀 後端技術</div>
          <ul class="list">
            <li>Sanity CMS</li>
            <li>資料存放於 Sanity Cloud</li>
            <li>GROQ API + Sanity Client</li>
          </ul>
        </div>
      </div>
    </div>
    <div class="dashboard">
      <div class="panel">
        <div class="panel-title">🧾 訂閱管理</div>
        <div class="stats">
          <div class="stat">
            <div class="label">項目數</div>
            <div class="value">{{ subscriptionTotal }}</div>
          </div>
          <div class="stat">
            <div class="label">7天提醒</div>
            <div class="value">{{ subscription7 }}</div>
            <div class="hint">最近：{{ subscription7Date }}</div>
          </div>
          <div class="stat">
            <div class="label">30天提醒</div>
            <div class="value">{{ subscription30 }}</div>
            <div class="hint">最近：{{ subscription30Date }}</div>
          </div>
        </div>
      </div>
      <div class="panel">
        <div class="panel-title">🍎 食品管理</div>
        <div class="stats">
          <div class="stat">
            <div class="label">項目數</div>
            <div class="value">{{ foodTotal }}</div>
          </div>
          <div class="stat">
            <div class="label">3天提醒</div>
            <div class="value">{{ food3 }}</div>
            <div class="hint">最近：{{ food3Date }}</div>
          </div>
          <div class="stat">
            <div class="label">7天提醒</div>
            <div class="value">{{ food7 }}</div>
            <div class="hint">最近：{{ food7Date }}</div>
          </div>
        </div>
      </div>
    </div>
    <div class="section-title">☀️ 系統功能選單</div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import client from '../services/sanity';

const subscriptionTotal = ref(0);
const subscription7 = ref(0);
const subscription30 = ref(0);
const subscription7Date = ref('-');
const subscription30Date = ref('-');
const foodTotal = ref(0);
const food3 = ref(0);
const food7 = ref(0);
const food3Date = ref('-');
const food7Date = ref('-');

const addDays = (base, days) => {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
};

const formatDate = (d) => {
  if (!d) return '-';
  const x = new Date(d);
  return x.toLocaleDateString();
};

const fetchDashboard = async () => {
  if (!client) {
    console.warn('Sanity client not initialized');
    return;
  }

  const now = new Date();
  
  // Prepare params for GROQ
  const params = {
    now: now.toISOString(),
    day3: addDays(now, 3).toISOString(),
    day7: addDays(now, 7).toISOString(),
    day30: addDays(now, 30).toISOString()
  };

  // Using a single query to fetch all stats efficiently
  const query = `{
    "subTotal": count(*[_type == "subscription"]),
    "sub7": count(*[_type == "subscription" && nextdate >= $now && nextdate <= $day7]),
    "sub7Date": *[_type == "subscription" && nextdate >= $now && nextdate <= $day7] | order(nextdate asc)[0].nextdate,
    "sub30": count(*[_type == "subscription" && nextdate >= $now && nextdate <= $day30]),
    "sub30Date": *[_type == "subscription" && nextdate >= $now && nextdate <= $day30] | order(nextdate asc)[0].nextdate,
    "foodTotal": count(*[_type == "food"]),
    "food3": count(*[_type == "food" && todate >= $now && todate <= $day3]),
    "food3Date": *[_type == "food" && todate >= $now && todate <= $day3] | order(todate asc)[0].todate,
    "food7": count(*[_type == "food" && todate >= $now && todate <= $day7]),
    "food7Date": *[_type == "food" && todate >= $now && todate <= $day7] | order(todate asc)[0].todate
  }`;

  try {
    const result = await client.fetch(query, params);
    
    subscriptionTotal.value = result.subTotal;
    subscription7.value = result.sub7;
    subscription7Date.value = formatDate(result.sub7Date);
    subscription30.value = result.sub30;
    subscription30Date.value = formatDate(result.sub30Date);
    
    foodTotal.value = result.foodTotal;
    food3.value = result.food3;
    food3Date.value = formatDate(result.food3Date);
    food7.value = result.food7;
    food7Date.value = formatDate(result.food7Date);
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error);
  }
};

onMounted(() => {
  fetchDashboard();
});
</script>

<style scoped>
.home {
  color: #fff;
}
.hero {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 32px;
  text-align: center;
  max-width: 980px;
  margin: 0 auto;
}
.logo {
  width: 60px;
  height: 60px;
  border-radius: 14px;
  background: #ff5a5f;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  margin-bottom: 12px;
}
.title {
  font-size: 32px;
  margin-bottom: 8px;
}
.subtitle {
  opacity: 0.95;
  margin-bottom: 8px;
}
.copyright {
  font-size: 14px;
  opacity: 0.85;
  margin-bottom: 20px;
}
.tech {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.card {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 16px;
  text-align: left;
}
.card-title {
  font-weight: 600;
  margin-bottom: 8px;
}
.list {
  padding-left: 18px;
}
.section-title {
  text-align: center;
  margin-top: 24px;
  font-weight: 600;
}
@media (max-width: 680px) {
  .tech {
    grid-template-columns: 1fr;
  }
}
.dashboard {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  max-width: 980px;
  margin: 18px auto 0;
}
.panel {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 16px;
}
.panel-title {
  font-weight: 600;
  margin-bottom: 8px;
}
.stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}
.stat {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 12px;
  text-align: center;
}
.stat .label {
  font-size: 13px;
  opacity: 0.9;
}
.stat .value {
  font-size: 22px;
  font-weight: 700;
}
.stat .hint {
  margin-top: 4px;
  font-size: 12px;
  opacity: 0.9;
}
@media (max-width: 680px) {
  .dashboard {
    grid-template-columns: 1fr;
  }
  .stats {
    grid-template-columns: 1fr 1fr;
  }
}
@media (max-width: 480px) {
  .stats {
    grid-template-columns: 1fr;
  }
}
</style>
