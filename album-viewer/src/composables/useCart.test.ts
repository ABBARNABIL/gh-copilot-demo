import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useCart } from './useCart'
import type { Album } from '../types/album'

const createLocalStorage = (initialItems: Record<string, string> = {}) => {
  const storage = new Map<string, string>(Object.entries(initialItems))

  return {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
    clear: () => storage.clear()
  }
}

const album: Album = {
  id: 1,
  title: 'Kind of Blue',
  artist: 'Miles Davis',
  price: 12.99,
  image_url: 'kind-of-blue.jpg'
}

const secondAlbum: Album = {
  id: 2,
  title: 'Blue Train',
  artist: 'John Coltrane',
  price: 10.5,
  image_url: 'blue-train.jpg'
}

describe('useCart', () => {
  beforeEach(() => {
    vi.stubGlobal('window', {
      localStorage: createLocalStorage()
    })

    const { clearCart, clearFeedback } = useCart()
    clearCart()
    clearFeedback()
    window.localStorage.clear()
  })

  it('adds albums once and persists them to localStorage', () => {
    const { addToCart, cartCount, cartItems, feedbackMessage, isInCart, totalPrice } = useCart()

    addToCart(album)
    addToCart(secondAlbum)
    addToCart(album)

    expect(cartCount.value).toBe(2)
    expect(cartItems.value).toEqual([album, secondAlbum])
    expect(isInCart(album.id)).toBe(true)
    expect(totalPrice.value).toBe(23.49)
    expect(feedbackMessage.value).toBe('Kind of Blue is already in your cart.')
    expect(window.localStorage.getItem('album-viewer-cart')).toBe(JSON.stringify([album, secondAlbum]))
  })

  it('removes albums and updates persisted cart data', () => {
    const { addToCart, removeFromCart, cartCount, totalPrice, feedbackMessage } = useCart()

    addToCart(album)
    removeFromCart(album.id)

    expect(cartCount.value).toBe(0)
    expect(totalPrice.value).toBe(0)
    expect(feedbackMessage.value).toBe('Kind of Blue removed from cart.')
    expect(window.localStorage.getItem('album-viewer-cart')).toBe('[]')
  })

  it('clears cart items and feedback independently', () => {
    const { addToCart, clearCart, clearFeedback, cartCount, feedbackMessage } = useCart()

    addToCart(album)
    clearCart()

    expect(cartCount.value).toBe(0)
    expect(feedbackMessage.value).toBe('Cart cleared.')
    expect(window.localStorage.getItem('album-viewer-cart')).toBe('[]')

    clearFeedback()

    expect(feedbackMessage.value).toBe('')
  })

  it('starts with an empty cart when persisted cart data is invalid', async () => {
    vi.resetModules()
    vi.stubGlobal('window', {
      localStorage: createLocalStorage({ 'album-viewer-cart': '{invalid-json' })
    })

    const { useCart: useFreshCart } = await import('./useCart')
    const { cartItems, cartCount } = useFreshCart()

    expect(cartItems.value).toEqual([])
    expect(cartCount.value).toBe(0)
  })
})
