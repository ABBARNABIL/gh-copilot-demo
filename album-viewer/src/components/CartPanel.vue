<template>
  <div class="cart-panel" role="dialog" aria-modal="true" aria-labelledby="cart-title">
    <div class="cart-header">
      <h2 id="cart-title">Your Cart</h2>
      <button class="close-btn" type="button" aria-label="Close cart" @click="$emit('close')">×</button>
    </div>

    <div v-if="cartItems.length === 0" class="empty-cart">
      <p>Your cart is empty.</p>
    </div>

    <ul v-else class="cart-items">
      <li v-for="album in cartItems" :key="album.id" class="cart-item">
        <div>
          <h3>{{ album.title }}</h3>
          <p>{{ album.artist }}</p>
          <span>${{ album.price.toFixed(2) }}</span>
        </div>
        <button class="remove-btn" type="button" @click="removeFromCart(album.id)">
          Remove
        </button>
      </li>
    </ul>

    <div class="cart-summary">
      <span>{{ itemCount }} {{ itemCount === 1 ? 'album' : 'albums' }}</span>
      <strong>Total: ${{ totalPrice.toFixed(2) }}</strong>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCart } from '../composables/useCart'

defineEmits<{
  close: []
}>()

const { cartItems, itemCount, totalPrice, removeFromCart } = useCart()
</script>

<style scoped>
.cart-panel {
  position: absolute;
  top: calc(100% + 1rem);
  right: 0;
  z-index: 10;
  width: min(380px, calc(100vw - 2rem));
  max-height: 70vh;
  overflow-y: auto;
  background: white;
  color: #333;
  border-radius: 15px;
  box-shadow: 0 20px 45px rgba(0, 0, 0, 0.3);
  padding: 1.25rem;
  text-align: left;
}

.cart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.cart-header h2 {
  margin: 0;
  color: #333;
}

.close-btn,
.remove-btn {
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.close-btn {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: #f1f3ff;
  color: #667eea;
  font-size: 1.5rem;
  line-height: 1;
}

.close-btn:hover,
.remove-btn:hover {
  transform: translateY(-2px);
}

.empty-cart {
  padding: 2rem 0;
  text-align: center;
  color: #666;
}

.cart-items {
  list-style: none;
  padding: 0;
  margin: 0;
}

.cart-item {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid #e6e8ff;
}

.cart-item h3 {
  margin: 0 0 0.25rem;
  font-size: 1rem;
}

.cart-item p {
  margin: 0 0 0.5rem;
  color: #666;
}

.cart-item span {
  color: #667eea;
  font-weight: 700;
}

.remove-btn {
  align-self: center;
  background: #ffeff1;
  color: #d7263d;
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  font-weight: 600;
}

.cart-summary {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding-top: 1rem;
  margin-top: 0.5rem;
  font-size: 1rem;
}

@media (max-width: 768px) {
  .cart-panel {
    position: fixed;
    top: 5rem;
    left: 1rem;
    right: 1rem;
    width: auto;
  }
}
</style>
