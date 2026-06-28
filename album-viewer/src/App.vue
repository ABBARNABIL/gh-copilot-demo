<template>
  <div class="app">
    <header class="header">
      <button
        class="cart-icon-btn"
        aria-label="Open cart"
        @click="showCart = !showCart"
      >
        🛒
        <span v-if="cartCount > 0" class="cart-badge">{{ cartCount }}</span>
      </button>
      <h1>🎵 Album Collection</h1>
      <p>Discover amazing music albums</p>
    </header>

    <main class="main">
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>Loading albums...</p>
      </div>

      <div v-else-if="error" class="error">
        <p>{{ error }}</p>
        <button @click="fetchAlbums" class="retry-btn">Try Again</button>
      </div>

      <div v-else class="albums-grid">
        <AlbumCard 
          v-for="album in albums" 
          :key="album.id" 
          :album="album" 
        />
      </div>
    </main>

    <CartPanel v-if="showCart" @close="showCart = false" />

    <div class="toast-container">
      <transition-group name="toast">
        <div v-for="toast in toasts" :key="toast.id" class="toast">
          {{ toast.message }}
        </div>
      </transition-group>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import AlbumCard from './components/AlbumCard.vue'
import CartPanel from './components/CartPanel.vue'
import { useCart } from './composables/useCart'
import { useToast } from './composables/useToast'
import type { Album } from './types/album'

const albums = ref<Album[]>([])
const loading = ref<boolean>(true)
const error = ref<string | null>(null)
const showCart = ref<boolean>(false)

const { count: cartCount } = useCart()
const { toasts } = useToast()

const fetchAlbums = async (): Promise<void> => {
  try {
    loading.value = true
    error.value = null
    const response = await axios.get<Album[]>('/albums')
    albums.value = response.data
  } catch (err) {
    error.value = 'Failed to load albums. Please make sure the API is running.'
    console.error('Error fetching albums:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchAlbums()
})
</script>

<style scoped>
.app {
  min-height: 100vh;
  padding: 2rem;
}

.header {
  text-align: center;
  margin-bottom: 3rem;
  color: white;
  position: relative;
}

.cart-icon-btn {
  position: absolute;
  top: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid white;
  border-radius: 50px;
  color: white;
  font-size: 1.5rem;
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  line-height: 1;
}

.cart-icon-btn:hover {
  background: white;
  color: #667eea;
  transform: scale(1.05);
}

.cart-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  background: #e74c3c;
  color: white;
  font-size: 0.75rem;
  font-weight: bold;
  min-width: 20px;
  height: 20px;
  padding: 0 5px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.toast-container {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  z-index: 1100;
  pointer-events: none;
}

.toast {
  background: rgba(51, 51, 51, 0.95);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 0.9rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  white-space: nowrap;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.header h1 {
  font-size: 3rem;
  margin-bottom: 0.5rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.header p {
  font-size: 1.2rem;
  opacity: 0.9;
}

.main {
  max-width: 1200px;
  margin: 0 auto;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  color: white;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error {
  text-align: center;
  padding: 4rem;
  color: white;
}

.error p {
  font-size: 1.2rem;
  margin-bottom: 2rem;
}

.retry-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid white;
  padding: 0.75rem 2rem;
  border-radius: 25px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.retry-btn:hover {
  background: white;
  color: #667eea;
}

.albums-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  padding: 1rem;
}

@media (max-width: 768px) {
  .app {
    padding: 1rem;
  }
  
  .header h1 {
    font-size: 2rem;
  }
  
  .cart-icon-btn {
    position: static;
    margin-bottom: 1rem;
    font-size: 1.25rem;
  }
  
  .albums-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}
</style>
