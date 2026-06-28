<template>
  <div class="cart-overlay" @click.self="$emit('close')">
    <aside class="cart-panel" role="dialog" aria-label="Shopping cart">
      <header class="cart-header">
        <h2>🛒 Your Cart</h2>
        <button class="close-btn" aria-label="Close cart" @click="$emit('close')">
          ✕
        </button>
      </header>

      <div v-if="items.length === 0" class="cart-empty">
        <p>Your cart is empty.</p>
        <p class="cart-empty-hint">Add some albums to get started!</p>
      </div>

      <ul v-else class="cart-items">
        <li v-for="album in items" :key="album.id" class="cart-item">
          <img
            :src="album.image_url"
            :alt="album.title"
            class="cart-item-image"
            @error="handleImageError"
            loading="lazy"
          />
          <div class="cart-item-info">
            <h3 class="cart-item-title">{{ album.title }}</h3>
            <p class="cart-item-artist">{{ album.artist }}</p>
            <span class="cart-item-price">${{ album.price.toFixed(2) }}</span>
          </div>
          <button
            class="remove-btn"
            :aria-label="`Remove ${album.title} from cart`"
            @click="removeFromCart(album.id)"
          >
            Remove
          </button>
        </li>
      </ul>

      <footer v-if="items.length > 0" class="cart-footer">
        <div class="cart-summary">
          <span>{{ count }} item{{ count === 1 ? '' : 's' }}</span>
          <span class="cart-total">${{ totalPrice.toFixed(2) }}</span>
        </div>
        <button class="clear-btn" @click="clearCart">Clear Cart</button>
      </footer>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { useCart } from '../composables/useCart'

defineEmits<{
  (e: 'close'): void
}>()

const { items, count, totalPrice, removeFromCart, clearCart } = useCart()

const handleImageError = (event: Event): void => {
  const target = event.target as HTMLImageElement
  target.src = 'https://via.placeholder.com/80x80/667eea/white?text=Album'
}
</script>

<style scoped>
.cart-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: flex-end;
  z-index: 1000;
}

.cart-panel {
  background: white;
  width: 100%;
  max-width: 420px;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.3);
  animation: slide-in 0.3s ease;
}

@keyframes slide-in {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
}

.cart-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #333;
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: #666;
  line-height: 1;
  padding: 0.25rem 0.5rem;
}

.close-btn:hover {
  color: #333;
}

.cart-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #888;
  text-align: center;
  padding: 2rem;
}

.cart-empty-hint {
  font-size: 0.9rem;
  opacity: 0.8;
}

.cart-items {
  list-style: none;
  margin: 0;
  padding: 0;
  overflow-y: auto;
  flex: 1;
}

.cart-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #f0f0f0;
}

.cart-item-image {
  width: 64px;
  height: 64px;
  object-fit: cover;
  border-radius: 8px;
  flex-shrink: 0;
}

.cart-item-info {
  flex: 1;
  min-width: 0;
}

.cart-item-title {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cart-item-artist {
  margin: 0 0 0.25rem 0;
  font-size: 0.85rem;
  color: #777;
}

.cart-item-price {
  font-weight: bold;
  color: #667eea;
}

.remove-btn {
  background: transparent;
  border: 1px solid #e74c3c;
  color: #e74c3c;
  border-radius: 6px;
  padding: 0.4rem 0.75rem;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.remove-btn:hover {
  background: #e74c3c;
  color: white;
}

.cart-footer {
  padding: 1.5rem;
  border-top: 1px solid #eee;
}

.cart-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1.1rem;
  color: #333;
  margin-bottom: 1rem;
}

.cart-total {
  font-weight: bold;
  color: #667eea;
}

.clear-btn {
  width: 100%;
  background: transparent;
  border: 2px solid #667eea;
  color: #667eea;
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.clear-btn:hover {
  background: #667eea;
  color: white;
}

@media (max-width: 480px) {
  .cart-panel {
    max-width: 100%;
  }
}
</style>
