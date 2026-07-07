import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useCart } from './useCart'
import type { Album } from '../types/album'

const album: Album = {
  id: 1,
  title: 'Kind of Blue',
  artist: 'Miles Davis',
  price: 12.99,
  image_url: 'kind-of-blue.jpg'
}

describe('useCart', () => {
  beforeEach(() => {
    const storage = new Map<string, string>()
    vi.stubGlobal('window', {
      localStorage: {
        getItem: (key: string) => storage.get(key) ?? null,
        setItem: (key: string, value: string) => storage.set(key, value),
        clear: () => storage.clear()
      }
    })

    const { clearCart, clearFeedback } = useCart()
    clearCart()
    clearFeedback()
    window.localStorage.clear()
  })

  it('adds albums once and persists them to localStorage', () => {
    const { addToCart, cartCount, cartItems, feedbackMessage, isInCart } = useCart()

    addToCart(album)
    addToCart(album)

    expect(cartCount.value).toBe(1)
    expect(cartItems.value).toEqual([album])
    expect(isInCart(album.id)).toBe(true)
    expect(feedbackMessage.value).toBe('Kind of Blue is already in your cart.')
    expect(window.localStorage.getItem('album-viewer-cart')).toBe(JSON.stringify([album]))
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
})
