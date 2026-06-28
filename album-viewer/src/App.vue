<template>
  <div class="app">
    <header class="header">
      <div class="header-content">
        <div>
          <h1>🎵 Album Collection</h1>
          <p>Discover amazing music albums</p>
        </div>

        <button class="cart-button" @click="isCartOpen = !isCartOpen">
          🛒
          <span class="cart-count">{{ cartCount }}</span>
        </button>
      </div>
    </header>

    <div v-if="feedbackMessage" class="cart-feedback">
      {{ feedbackMessage }}
    </div>

    <aside v-if="isCartOpen" class="cart-panel">
      <div class="cart-panel-header">
        <h2>Your Cart</h2>
        <button class="close-cart" @click="isCartOpen = false">×</button>
      </div>

      <p v-if="cartCount === 0" class="empty-cart">Your cart is empty.</p>

      <ul v-else class="cart-items">
        <li v-for="album in cartItems" :key="album.id" class="cart-item">
          <div>
            <strong>{{ album.title }}</strong>
            <span>{{ album.artist }}</span>
            <span>${{ album.price.toFixed(2) }}</span>
          </div>
          <button class="remove-cart-item" @click="removeFromCart(album)">
            Remove
          </button>
        </li>
      </ul>

      <div class="cart-summary">
        <span>{{ cartAlbumLabel }}</span>
        <strong>Total: ${{ cartTotalPrice.toFixed(2) }}</strong>
      </div>
    </aside>

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
          :is-in-cart="isInCart(album.id)"
          @add-to-cart="addToCart"
        />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import axios from 'axios'
import AlbumCard from './components/AlbumCard.vue'
import { useCart } from './composables/useCart'
import type { Album } from './types/album'

const albums = ref<Album[]>([])
const loading = ref<boolean>(true)
const error = ref<string | null>(null)
const isCartOpen = ref<boolean>(false)
const feedbackMessage = ref<string>('')
const {
  items: cartItems,
  count: cartCount,
  totalPrice: cartTotalPrice,
  addItem,
  removeItem,
  isInCart
} = useCart()
const feedbackTimeout = ref<ReturnType<typeof setTimeout> | null>(null)
const formatAlbumCount = (count: number): string =>
  `${count} album${count === 1 ? '' : 's'}`
const cartAlbumLabel = computed(() => formatAlbumCount(cartCount.value))

const showFeedback = (message: string): void => {
  feedbackMessage.value = message
  if (feedbackTimeout.value) {
    clearTimeout(feedbackTimeout.value)
  }
  feedbackTimeout.value = setTimeout(() => {
    feedbackMessage.value = ''
  }, 2000)
}

const addToCart = (album: Album): void => {
  if (addItem(album)) {
    showFeedback(`${album.title} added to cart`)
  }
}

const removeFromCart = (album: Album): void => {
  if (removeItem(album.id)) {
    showFeedback(`${album.title} removed from cart`)
  }
}

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

onUnmounted(() => {
  if (feedbackTimeout.value) {
    clearTimeout(feedbackTimeout.value)
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
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
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

.cart-button {
  position: relative;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.8);
  border-radius: 999px;
  padding: 0.75rem 1rem;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cart-button:hover {
  background: white;
  color: #667eea;
}

.cart-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.5rem;
  height: 1.5rem;
  margin-left: 0.25rem;
  padding: 0 0.35rem;
  border-radius: 999px;
  background: #f56565;
  color: white;
  font-size: 0.85rem;
  font-weight: 700;
}

.cart-feedback {
  position: fixed;
  top: 1rem;
  left: 50%;
  z-index: 20;
  transform: translateX(-50%);
  background: #2d3748;
  color: white;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
}

.cart-panel {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 10;
  width: min(420px, calc(100vw - 2rem));
  max-height: calc(100vh - 2rem);
  overflow: auto;
  background: white;
  border-radius: 15px;
  padding: 1.5rem;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.35);
}

.cart-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.cart-panel-header h2 {
  margin: 0;
  color: #333;
}

.close-cart {
  background: transparent;
  border: none;
  color: #333;
  cursor: pointer;
  font-size: 2rem;
  line-height: 1;
}

.empty-cart {
  color: #666;
  margin: 1rem 0;
}

.cart-items {
  list-style: none;
  margin: 0;
  padding: 0;
}

.cart-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid #e2e8f0;
}

.cart-item div,
.cart-item span {
  display: block;
}

.cart-item span {
  color: #666;
  margin-top: 0.25rem;
}

.remove-cart-item {
  background: #f56565;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  cursor: pointer;
}

.remove-cart-item:hover {
  background: #e53e3e;
}

.cart-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 1rem;
  color: #333;
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

  .header-content,
  .cart-summary,
  .cart-item {
    align-items: stretch;
    flex-direction: column;
  }
  
  .albums-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}
</style>
