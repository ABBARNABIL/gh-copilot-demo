<template>
  <div class="app">
    <header class="header">
      <div class="header-content">
        <div>
          <h1>🎵 Album Collection</h1>
          <p>Discover amazing music albums</p>
        </div>
        <button class="cart-toggle" type="button" @click="showCart = !showCart">
          🛒 <span>{{ cartCount }}</span>
        </button>
      </div>
    </header>

    <CartPanel v-if="showCart" @close="showCart = false" />

    <div v-if="feedbackMessage" class="toast" role="status" aria-live="polite">
      {{ feedbackMessage }}
      <button type="button" aria-label="Dismiss notification" @click="clearFeedback">×</button>
    </div>

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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import AlbumCard from './components/AlbumCard.vue'
import CartPanel from './components/CartPanel.vue'
import { useCart } from './composables/useCart'
import type { Album } from './types/album'

const albums = ref<Album[]>([])
const loading = ref<boolean>(true)
const error = ref<string | null>(null)
const showCart = ref<boolean>(false)
const { cartCount, feedbackMessage, clearFeedback } = useCart()

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
  margin-bottom: 3rem;
  color: white;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  text-align: left;
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

.cart-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border: 2px solid rgba(255, 255, 255, 0.8);
  border-radius: 999px;
  padding: 0.75rem 1.25rem;
  background: rgba(255, 255, 255, 0.18);
  color: white;
  font-size: 1.2rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cart-toggle:hover {
  background: white;
  color: #667eea;
}

.cart-toggle span {
  min-width: 1.75rem;
  padding: 0.2rem 0.45rem;
  border-radius: 999px;
  background: white;
  color: #667eea;
}

.cart-toggle:hover span {
  background: #667eea;
  color: white;
}

.toast {
  position: fixed;
  left: 50%;
  bottom: 1.5rem;
  z-index: 30;
  display: flex;
  align-items: center;
  gap: 1rem;
  max-width: calc(100vw - 2rem);
  padding: 0.9rem 1.1rem;
  border-radius: 999px;
  background: rgba(51, 51, 51, 0.94);
  color: white;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
  transform: translateX(-50%);
}

.toast button {
  border: none;
  background: transparent;
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
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

  .header-content {
    align-items: flex-start;
  }

  .cart-toggle {
    padding: 0.6rem 0.9rem;
  }
   
  .albums-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}
</style>
