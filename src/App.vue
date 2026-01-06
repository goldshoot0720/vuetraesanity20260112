<script setup>
import { RouterView } from 'vue-router'
import Sidebar from './components/Sidebar.vue'
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'

const isSidebarOpen = ref(true)
const isMobile = ref(false)

const checkScreenSize = () => {
  const mobile = window.innerWidth <= 900
  if (isMobile.value !== mobile) {
    isMobile.value = mobile
    // Auto-close on mobile, auto-open on desktop when switching
    isSidebarOpen.value = !mobile
  }
}

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

const closeMobileMenu = () => {
  if (isMobile.value) {
    isSidebarOpen.value = false
  }
}

// Dynamic content style
const contentStyle = computed(() => ({
  marginLeft: isMobile.value || !isSidebarOpen.value ? '0' : '240px',
  width: isMobile.value || !isSidebarOpen.value ? '100%' : 'calc(100% - 240px)'
}))

onMounted(() => {
  checkScreenSize()
  window.addEventListener('resize', checkScreenSize)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkScreenSize)
})
</script>

<template>
  <div class="app-shell">
    <div class="mobile-overlay" v-if="isMobile && isSidebarOpen" @click="isSidebarOpen = false"></div>
    <Sidebar :is-open="isSidebarOpen" @close="closeMobileMenu" />
    <div class="content" :style="contentStyle">
      <header class="topbar">
        <button class="menu-toggle" @click="toggleSidebar" title="切換選單">
          <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        <h1>歡迎使用鋒兄AI資訊系統</h1>
      </header>
      <main class="main">
        <RouterView />
      </main>
    </div>
  </div>
  <div class="bg"></div>
</template>

<style scoped>
.app-shell {
  display: flex;
  min-height: 100vh;
}
.content {
  display: flex;
  flex-direction: column;
  transition: margin-left 0.3s, width 0.3s;
}
.topbar {
  height: 56px;
  display: flex;
  align-items: center;
  padding: 0 24px;
  color: #fff;
  gap: 16px;
}
.topbar h1 {
  font-size: 1.25rem;
  font-weight: 500;
  margin: 0;
}
.menu-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: #fff;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: background 0.2s;
}
.menu-toggle:hover {
  background: rgba(255, 255, 255, 0.2);
}
.main {
  padding: 24px;
}
.bg {
  position: fixed;
  inset: 0;
  background: radial-gradient(1200px 600px at 60% 10%, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 60%), linear-gradient(180deg, #5a64e0 0%, #7b66e8 40%, #865fe6 100%);
  z-index: -1;
}
.mobile-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  z-index: 900;
  backdrop-filter: blur(2px);
  animation: fadeIn 0.3s;
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@media (max-width: 900px) {
  .topbar {
    padding: 0 16px;
  }
  .main {
    padding: 16px;
  }
}
</style>
