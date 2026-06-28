import { computed, ref, watch } from 'vue'
import type { Album } from '../types/album'

const STORAGE_KEY = 'album-viewer-cart'

const loadCart = (): Album[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch (err) {
    console.error('Failed to load cart from localStorage:', err)
    return []
  }
}

// Shared (singleton) cart state across all components.
const items = ref<Album[]>(loadCart())

watch(
  items,
  (value) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
    } catch (err) {
      console.error('Failed to persist cart to localStorage:', err)
    }
  },
  { deep: true }
)

export function useCart() {
  const count = computed<number>(() => items.value.length)

  const totalPrice = computed<number>(() =>
    items.value.reduce((sum, album) => sum + album.price, 0)
  )

  const isInCart = (id: number): boolean =>
    items.value.some((album) => album.id === id)

  const addToCart = (album: Album): boolean => {
    if (isInCart(album.id)) return false
    items.value = [...items.value, album]
    return true
  }

  const removeFromCart = (id: number): void => {
    items.value = items.value.filter((album) => album.id !== id)
  }

  const toggleCart = (album: Album): boolean => {
    if (isInCart(album.id)) {
      removeFromCart(album.id)
      return false
    }
    addToCart(album)
    return true
  }

  const clearCart = (): void => {
    items.value = []
  }

  return {
    items,
    count,
    totalPrice,
    isInCart,
    addToCart,
    removeFromCart,
    toggleCart,
    clearCart
  }
}
