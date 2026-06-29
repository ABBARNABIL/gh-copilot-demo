import { computed, ref } from 'vue'
import type { Album } from '../types/album'

const CART_STORAGE_KEY = 'album-viewer-cart'

const readStoredCart = (): Album[] => {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const storedCart = window.localStorage.getItem(CART_STORAGE_KEY)
    const parsedCart = storedCart ? JSON.parse(storedCart) : []
    return Array.isArray(parsedCart) ? parsedCart : []
  } catch {
    return []
  }
}

const cartItems = ref<Album[]>(readStoredCart())
const feedbackMessage = ref<string | null>(null)

const persistCart = (): void => {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems.value))
  } catch {
    return
  }
}

export const useCart = () => {
  const itemCount = computed(() => cartItems.value.length)
  const totalPrice = computed(() =>
    cartItems.value.reduce(
      (sumCents, album) => sumCents + Math.round(album.price * 100),
      0
    ) / 100
  )

  const isInCart = (albumId: number): boolean =>
    cartItems.value.some((album) => album.id === albumId)

  const addToCart = (album: Album): void => {
    if (isInCart(album.id)) {
      feedbackMessage.value = `${album.title} is already in your cart`
      return
    }

    cartItems.value = [...cartItems.value, album]
    persistCart()
    feedbackMessage.value = `${album.title} added to cart`
  }

  const removeFromCart = (albumId: number): void => {
    const album = cartItems.value.find((item) => item.id === albumId)
    cartItems.value = cartItems.value.filter((item) => item.id !== albumId)
    persistCart()

    if (album) {
      feedbackMessage.value = `${album.title} removed from cart`
    }
  }

  const clearCart = (): void => {
    cartItems.value = []
    persistCart()
    feedbackMessage.value = 'Cart cleared'
  }

  const clearFeedback = (): void => {
    feedbackMessage.value = null
  }

  return {
    cartItems,
    feedbackMessage,
    itemCount,
    totalPrice,
    addToCart,
    removeFromCart,
    clearCart,
    clearFeedback,
    isInCart
  }
}
