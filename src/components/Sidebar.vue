<template>
  <aside class="sidebar" :class="{ open: isOpen }">
    <div class="brand">
      <div class="brand-badge">鋒</div>
      <div class="brand-name">鋒兄AI系統</div>
    </div>
    <nav class="menu">
      <RouterLink to="/" class="item" @click="$emit('close')"><span class="icon">🏠</span>首頁</RouterLink>
      <RouterLink to="/images" class="item" @click="$emit('close')"><span class="icon">🖼️</span>圖片庫</RouterLink>
      <RouterLink to="/videos" class="item" @click="$emit('close')"><span class="icon">🎬</span>影片庫</RouterLink>
      <RouterLink to="/lyrics" class="item" @click="$emit('close')"><span class="icon">🎵</span>鋒兄音樂歌詞</RouterLink>
      <RouterLink to="/subscriptions" class="item" @click="$emit('close')"><span class="icon">📋</span>訂閱管理</RouterLink>
      <RouterLink to="/foods" class="item" @click="$emit('close')"><span class="icon">🍎</span>食品管理</RouterLink>
      <RouterLink to="/settings" class="item" @click="$emit('close')"><span class="icon">⚙️</span>系統設定</RouterLink>
    </nav>
  </aside>
</template>

<script setup>
import { RouterLink } from 'vue-router'

defineProps({
  isOpen: Boolean
})

defineEmits(['close'])
</script>

<style scoped>
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 240px;
  background: linear-gradient(180deg, #5f5bd7 0%, #7758e1 60%, #8a5fe6 100%);
  color: #fff;
  padding: 24px 16px;
  z-index: 1000;
  transition: transform 0.3s ease;
  transform: translateX(-100%);
}
.sidebar.open {
  transform: translateX(0);
  box-shadow: 2px 0 8px rgba(0,0,0,0.2);
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}
.brand-badge {
  width: 36px;
  height: 36px;
  border-radius: 9px;
  background: #ff5a5f;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}
.brand-name {
  font-size: 16px;
  font-weight: 600;
}
.menu {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  color: #fff;
}
.item.router-link-active {
  background: rgba(255, 255, 255, 0.22);
}
.icon {
  width: 22px;
  text-align: center;
}
</style>
