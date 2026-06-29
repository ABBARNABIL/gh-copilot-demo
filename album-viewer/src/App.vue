<template>
  <div class="app">
    <header class="header">
      <div class="header-content">
        <div>
          <h1>🎵 Album Collection</h1>
          <p>Discover amazing music albums</p>
        </div>

        <div class="cart-wrapper">
          <button
            class="cart-toggle"
            type="button"
            aria-label="Toggle cart"
            @click="isCartOpen = !isCartOpen"
          >
            🛒 <span>{{ itemCount }}</span>
          </button>
          <CartPanel v-if="isCartOpen" @close="isCartOpen = false" />
        </div>
      </div>
    </header>

    <div v-if="feedbackMessage" class="cart-feedback" role="status">
      {{ feedbackMessage }}
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
import { ref, onMounted, watch } from 'vue'
import axios from 'axios'
import AlbumCard from './components/AlbumCard.vue'
import CartPanel from './components/CartPanel.vue'
import { useCart } from './composables/useCart'
import type { Album } from './types/album'

const albums = ref<Album[]>([])
const loading = ref<boolean>(true)
const error = ref<string | null>(null)
const isCartOpen = ref<boolean>(false)
const { itemCount, feedbackMessage, clearFeedback } = useCart()

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

let feedbackTimeout: number | undefined

const stopFeedback = (): void => {
  if (feedbackTimeout) {
    window.clearTimeout(feedbackTimeout)
  }

  feedbackTimeout = window.setTimeout(() => {
    clearFeedback()
  }, 2500)
}

watch(feedbackMessage, (message) => {
  if (message) {
    stopFeedback()
  }
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
  position: relative;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  text-align: center;
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

.cart-wrapper {
  position: relative;
}

.cart-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.95);
  color: #667eea;
  border: none;
  border-radius: 999px;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.cart-toggle:hover {
  transform: translateY(-2px);
  background: white;
}

.cart-toggle span {
  min-width: 1.5rem;
  padding: 0.15rem 0.45rem;
  border-radius: 999px;
  background: #667eea;
  color: white;
}

.cart-feedback {
  position: fixed;
  top: 1rem;
  left: 50%;
  z-index: 20;
  transform: translateX(-50%);
  background: rgba(255, 255, 255, 0.95);
  color: #333;
  border-radius: 999px;
  padding: 0.75rem 1.25rem;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  font-weight: 600;
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
    flex-direction: column;
  }
  
  .albums-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}
</style>
