import { computed, ref } from 'vue'
import type { Album } from '../types/album'

interface StorageLike {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

const STORAGE_KEY = 'album-viewer-cart'
const cartItems = ref<Album[]>([])
let initialized = false

const loadCart = (storage: StorageLike | null): Album[] => {
  if (!storage) return []

  try {
    const rawValue = storage.getItem(STORAGE_KEY)
    if (!rawValue) return []

    const parsed = JSON.parse(rawValue)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const persistCart = (storage: StorageLike | null, items: Album[]): void => {
  if (!storage) return

  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // Ignore persistence errors to keep UI functional
  }
}

const getBrowserStorage = (): StorageLike | null => {
  if (typeof window === 'undefined') return null
  return window.localStorage
}

export const useCart = (
  storage: StorageLike | null = getBrowserStorage()
) => {
  if (!initialized) {
    cartItems.value = loadCart(storage)
    initialized = true
  }

  const addToCart = (album: Album): boolean => {
    if (cartItems.value.some((item) => item.id === album.id)) {
      return false
    }

    cartItems.value = [...cartItems.value, album]
    persistCart(storage, cartItems.value)
    return true
  }

  const removeFromCart = (albumId: number): void => {
    cartItems.value = cartItems.value.filter((item) => item.id !== albumId)
    persistCart(storage, cartItems.value)
  }

  const clearCart = (): void => {
    cartItems.value = []
    persistCart(storage, cartItems.value)
  }

  const isInCart = (albumId: number): boolean =>
    cartItems.value.some((item) => item.id === albumId)

  const itemCount = computed(() => cartItems.value.length)
  const totalPrice = computed(() =>
    cartItems.value.reduce((sum, item) => sum + item.price, 0)
  )

  return {
    cartItems,
    itemCount,
    totalPrice,
    addToCart,
    removeFromCart,
    clearCart,
    isInCart
  }
}

export const resetCartForTests = (): void => {
  cartItems.value = []
  initialized = false
}
