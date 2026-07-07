import { computed, ref } from 'vue'
import type { Album } from '../types/album'

const STORAGE_KEY = 'album-viewer-cart'

const loadCart = (): Album[] => {
  if (typeof window === 'undefined') {
    return []
  }

  const storedCart = window.localStorage.getItem(STORAGE_KEY)
  if (!storedCart) {
    return []
  }

  try {
    const parsedCart = JSON.parse(storedCart)
    return Array.isArray(parsedCart) ? parsedCart : []
  } catch {
    return []
  }
}

const cartItems = ref<Album[]>(loadCart())
const feedbackMessage = ref<string>('')

const saveCart = (): void => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems.value))
  }
}

export const useCart = () => {
  const cartCount = computed(() => cartItems.value.length)
  const totalPrice = computed<number>(() =>
    Math.round(cartItems.value.reduce((total, album) => total + album.price, 0) * 100) / 100
  )

  const isInCart = (albumId: number): boolean =>
    cartItems.value.some((album) => album.id === albumId)

  const addToCart = (album: Album): void => {
    if (isInCart(album.id)) {
      feedbackMessage.value = `${album.title} is already in your cart.`
      return
    }

    cartItems.value = [...cartItems.value, album]
    feedbackMessage.value = `${album.title} added to cart.`
    saveCart()
  }

  const removeFromCart = (albumId: number): void => {
    const album = cartItems.value.find((item) => item.id === albumId)
    cartItems.value = cartItems.value.filter((item) => item.id !== albumId)
    feedbackMessage.value = album ? `${album.title} removed from cart.` : ''
    saveCart()
  }

  const clearCart = (): void => {
    cartItems.value = []
    feedbackMessage.value = 'Cart cleared.'
    saveCart()
  }

  const clearFeedback = (): void => {
    feedbackMessage.value = ''
  }

  return {
    cartItems,
    cartCount,
    totalPrice,
    feedbackMessage,
    addToCart,
    removeFromCart,
    clearCart,
    clearFeedback,
    isInCart
  }
}
