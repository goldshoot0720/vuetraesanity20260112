<template>
  <section class="page">
    <div class="header">
      <div class="badge">📊</div>
      <h2>系統儀表板</h2>
      <div class="actions">
        <button class="btn">刷新數據</button>
      </div>
    </div>
    <div class="grid">
      <div class="tile">
        <div class="kpi">24</div>
        <div class="label">訂閱總數</div>
      </div>
      <div class="tile">
        <div class="kpi">13</div>
        <div class="label">食品總數</div>
      </div>
      <div class="tile">
        <div class="kpi">2</div>
        <div class="label">30天內到期</div>
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
  margin-bottom: 16px;
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
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}
.tile {
  background: rgba(255,255,255,0.08);
  border-radius: 12px;
  padding: 16px;
  text-align: center;
}
.kpi {
  font-size: 28px;
  font-weight: 700;
}
.label {
  opacity: 0.9;
}
@media (max-width: 800px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
