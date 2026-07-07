<template>
  <aside class="cart-panel" aria-label="Shopping cart">
    <div class="cart-header">
      <div>
        <h2>Your Cart</h2>
        <p>{{ cartCount }} {{ cartCount === 1 ? 'album' : 'albums' }}</p>
      </div>
      <button class="close-btn" type="button" aria-label="Close cart" @click="$emit('close')">×</button>
    </div>

    <div v-if="cartItems.length === 0" class="empty-cart">
      <p>Your cart is empty.</p>
      <span>Add albums from the collection to save them for later.</span>
    </div>

    <ul v-else class="cart-items">
      <li v-for="album in cartItems" :key="album.id" class="cart-item">
        <img :src="album.image_url" :alt="album.title" />
        <div class="cart-item-info">
          <h3>{{ album.title }}</h3>
          <p>{{ album.artist }}</p>
          <strong>${{ album.price.toFixed(2) }}</strong>
        </div>
        <button class="remove-btn" type="button" @click="removeFromCart(album.id)">
          Remove
        </button>
      </li>
    </ul>

    <div class="cart-summary">
      <span>Total</span>
      <strong>${{ totalPrice.toFixed(2) }}</strong>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { useCart } from '../composables/useCart'

defineEmits<{
  close: []
}>()

const { cartItems, cartCount, totalPrice, removeFromCart } = useCart()
</script>

<style scoped>
.cart-panel {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 20;
  width: min(420px, calc(100vw - 2rem));
  max-height: calc(100vh - 2rem);
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 18px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.35);
  overflow: hidden;
}

.cart-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.5rem;
  color: white;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.cart-header h2,
.cart-header p {
  margin: 0;
}

.cart-header p {
  opacity: 0.9;
  margin-top: 0.25rem;
}

.close-btn {
  width: 36px;
  height: 36px;
  border: 2px solid rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  background: transparent;
  color: white;
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
}

.empty-cart {
  padding: 2rem;
  text-align: center;
  color: #555;
}

.empty-cart p {
  margin: 0 0 0.5rem;
  font-weight: 700;
  color: #333;
}

.cart-items {
  list-style: none;
  margin: 0;
  padding: 0;
  overflow-y: auto;
}

.cart-item {
  display: grid;
  grid-template-columns: 64px 1fr auto;
  gap: 1rem;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #eee;
}

.cart-item img {
  width: 64px;
  height: 64px;
  border-radius: 10px;
  object-fit: cover;
}

.cart-item-info h3,
.cart-item-info p {
  margin: 0;
}

.cart-item-info h3 {
  color: #333;
  font-size: 1rem;
}

.cart-item-info p {
  margin: 0.2rem 0;
  color: #666;
  font-size: 0.9rem;
}

.cart-item-info strong,
.cart-summary strong {
  color: #667eea;
}

.remove-btn {
  border: none;
  border-radius: 8px;
  padding: 0.55rem 0.8rem;
  background: #ffe9e9;
  color: #c0392b;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
}

.remove-btn:hover {
  background: #c0392b;
  color: white;
}

.cart-summary {
  display: flex;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  background: #f8f8ff;
  color: #333;
  font-size: 1.1rem;
}

@media (max-width: 480px) {
  .cart-panel {
    top: 0;
    right: 0;
    width: 100vw;
    max-height: 100vh;
    border-radius: 0;
  }

  .cart-item {
    grid-template-columns: 56px 1fr;
  }

  .remove-btn {
    grid-column: 1 / -1;
  }
}
</style>
