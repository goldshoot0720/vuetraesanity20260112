<template>
  <section class="page">
    <div class="header">
      <div class="badge">🎞️</div>
      <h2>鋒兄影片庫</h2>
      <div class="actions">
        <button class="btn primary">新增影片</button>
      </div>
    </div>
    <div class="toolbar">
      <input class="search" placeholder="搜尋影片名稱..." />
      <button class="btn">🔍 搜尋</button>
    </div>
    <div class="cards">
      <div class="card" v-for="n in 2" :key="n">
        <div class="thumb video"></div>
        <div class="meta">
          <div class="name">示例影片 {{ n }}</div>
          <div class="info">MP4 · 時長 01:23</div>
        </div>
      </div>
    </div>
  </section>
</template>

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
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}
.card {
  background: rgba(255,255,255,0.08);
  border-radius: 12px;
  overflow: hidden;
}
.thumb.video {
  height: 140px;
  background: linear-gradient(180deg, rgba(255,255,255,0.2), rgba(255,255,255,0.05));
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
}
@media (max-width: 800px) {
  .cards {
    grid-template-columns: 1fr;
  }
}
</style>
