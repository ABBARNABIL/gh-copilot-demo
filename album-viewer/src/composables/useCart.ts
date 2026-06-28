import { computed, ref, watch } from 'vue'
import type { Album } from '../types/album'

const CART_STORAGE_KEY = 'album-viewer-cart'

const cartItems = ref<Album[]>([])

const isAlbum = (value: unknown): value is Album => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const album = value as Record<string, unknown>

  return (
    typeof album.id === 'number' &&
    typeof album.title === 'string' &&
    typeof album.artist === 'string' &&
    typeof album.price === 'number' &&
    typeof album.image_url === 'string'
  )
}

const storage = (): Storage | null => {
  if (typeof globalThis.localStorage === 'undefined') {
    return null
  }

  return globalThis.localStorage
}

const loadCart = (): void => {
  const localStorage = storage()

  if (!localStorage) {
    return
  }

  const savedCart = localStorage.getItem(CART_STORAGE_KEY)

  if (!savedCart) {
    return
  }

  try {
    const parsedCart: unknown = JSON.parse(savedCart)

    if (Array.isArray(parsedCart) && parsedCart.every(isAlbum)) {
      cartItems.value = parsedCart
      return
    }

    cartItems.value = []
    localStorage.removeItem(CART_STORAGE_KEY)
  } catch {
    // Discard invalid saved carts so corrupt localStorage cannot break app startup.
    cartItems.value = []
    localStorage.removeItem(CART_STORAGE_KEY)
  }
}

loadCart()

watch(
  cartItems,
  (items) => {
    storage()?.setItem(CART_STORAGE_KEY, JSON.stringify(items))
  },
  { deep: true }
)

export const useCart = () => {
  const count = computed(() => cartItems.value.length)
  const totalPrice = computed(() => {
    const total = cartItems.value.reduce((sum, album) => sum + album.price, 0)
    return Number(total.toFixed(2))
  })

  const isInCart = (albumId: Album['id']): boolean =>
    cartItems.value.some((album) => album.id === albumId)

  const addItem = (album: Album): boolean => {
    if (isInCart(album.id)) {
      return false
    }

    cartItems.value.push(album)
    return true
  }

  const removeItem = (albumId: Album['id']): boolean => {
    const previousLength = cartItems.value.length
    cartItems.value = cartItems.value.filter((album) => album.id !== albumId)
    return cartItems.value.length !== previousLength
  }

  const clear = (): void => {
    cartItems.value = []
  }

  return {
    items: cartItems,
    count,
    totalPrice,
    addItem,
    removeItem,
    clear,
    isInCart
  }
}
