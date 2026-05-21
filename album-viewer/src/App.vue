<template>
  <div class="app">
    <header class="header">
      <div>
        <h1>🎵 Album Collection</h1>
        <p>Discover amazing music albums</p>
      </div>
      <button class="cart-toggle" @click="toggleCart">
        🛒 {{ itemCount }}
      </button>
    </header>

    <aside v-if="showCart" class="cart-panel">
      <div class="cart-panel-header">
        <h2>Your Cart</h2>
        <button class="cart-close" @click="showCart = false">✕</button>
      </div>
      <div v-if="cartItems.length === 0" class="cart-empty">
        Your cart is empty.
      </div>
      <ul v-else class="cart-list">
        <li v-for="item in cartItems" :key="item.id" class="cart-item">
          <div>
            <p class="cart-item-title">{{ item.title }}</p>
            <p class="cart-item-artist">{{ item.artist }}</p>
            <p class="cart-item-price">${{ item.price.toFixed(2) }}</p>
          </div>
          <button class="remove-btn" @click="handleRemoveFromCart(item.id)">
            Remove
          </button>
        </li>
      </ul>
      <div class="cart-summary">
        <p>Items: {{ itemCount }}</p>
        <p>Total: ${{ totalPrice.toFixed(2) }}</p>
      </div>
    </aside>

    <main class="main">
      <p v-if="feedbackMessage" class="feedback">{{ feedbackMessage }}</p>
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
          :in-cart="isInCart(album.id)"
          @add-to-cart="handleAddToCart"
        />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount, onMounted } from 'vue'
import axios from 'axios'
import AlbumCard from './components/AlbumCard.vue'
import type { Album } from './types/album'
import { useCart } from './composables/useCart'

const albums = ref<Album[]>([])
const loading = ref<boolean>(true)
const error = ref<string | null>(null)
const showCart = ref<boolean>(false)
const feedbackMessage = ref<string>('')
const feedbackTimeoutId = ref<ReturnType<typeof setTimeout> | null>(null)
const FEEDBACK_DISPLAY_DURATION = 1800
const { cartItems, itemCount, totalPrice, addToCart, removeFromCart, isInCart } = useCart()

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

const setFeedback = (message: string): void => {
  feedbackMessage.value = message
  if (feedbackTimeoutId.value) {
    clearTimeout(feedbackTimeoutId.value)
  }
  feedbackTimeoutId.value = setTimeout(() => {
    feedbackMessage.value = ''
  }, FEEDBACK_DISPLAY_DURATION)
}

const handleAddToCart = (album: Album): void => {
  if (addToCart(album)) {
    setFeedback(`Added "${album.title}" to cart`)
  }
}

const handleRemoveFromCart = (albumId: number): void => {
  removeFromCart(albumId)
  setFeedback('Removed album from cart')
}

const toggleCart = (): void => {
  showCart.value = !showCart.value
}

onMounted(() => {
  fetchAlbums()
})

onBeforeUnmount(() => {
  if (feedbackTimeoutId.value) {
    clearTimeout(feedbackTimeoutId.value)
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
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

.cart-toggle {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid white;
  padding: 0.5rem 1rem;
  border-radius: 25px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
}

.cart-panel {
  max-width: 1200px;
  margin: 0 auto 1rem;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.cart-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.cart-close {
  border: none;
  background: transparent;
  font-size: 1.2rem;
  cursor: pointer;
}

.cart-empty {
  color: #666;
  margin: 0.5rem 0 1rem;
}

.cart-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.cart-item {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  border-bottom: 1px solid #eee;
  padding: 0.75rem 0;
}

.cart-item-title {
  margin: 0;
  font-weight: 600;
}

.cart-item-artist,
.cart-item-price {
  margin: 0.25rem 0 0;
  color: #666;
}

.remove-btn {
  align-self: center;
  background: #f44336;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  cursor: pointer;
}

.cart-summary {
  display: flex;
  justify-content: space-between;
  margin-top: 0.75rem;
  font-weight: 700;
}

.feedback {
  margin: 0 0 1rem;
  padding: 0.5rem 0.75rem;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  color: #1d5e2a;
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
  
  .header {
    flex-direction: column;
    text-align: center;
  }

  .header h1 {
    font-size: 2rem;
  }

  .cart-item {
    flex-direction: column;
  }
  
  .albums-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}
</style>
