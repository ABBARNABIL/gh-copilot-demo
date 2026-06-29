import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Album } from '../types/album'

const album: Album = {
  id: 1,
  title: 'Kind of Blue',
  artist: 'Miles Davis',
  price: 9.99,
  image_url: 'kind-of-blue.jpg'
}

const importCart = async () => {
  vi.resetModules()
  return import('../composables/useCart')
}

beforeEach(() => {
  const store = new Map<string, string>()
  vi.stubGlobal('window', {
    localStorage: {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => store.set(key, value),
      clear: () => store.clear()
    }
  })
  window.localStorage.clear()
})

describe('useCart', () => {
  it('adds albums once and persists them to localStorage', async () => {
    const { useCart } = await importCart()
    const cart = useCart()

    cart.addToCart(album)
    cart.addToCart(album)

    expect(cart.itemCount.value).toBe(1)
    expect(cart.isInCart(album.id)).toBe(true)
    expect(JSON.parse(window.localStorage.getItem('album-viewer-cart') ?? '[]')).toEqual([album])
  })

  it('loads stored albums and removes items', async () => {
    window.localStorage.setItem('album-viewer-cart', JSON.stringify([album]))
    const { useCart } = await importCart()
    const cart = useCart()

    expect(cart.itemCount.value).toBe(1)
    cart.removeFromCart(album.id)

    expect(cart.itemCount.value).toBe(0)
    expect(window.localStorage.getItem('album-viewer-cart')).toBe('[]')
  })

  it('clears all albums and persists an empty cart', async () => {
    const { useCart } = await importCart()
    const cart = useCart()

    cart.addToCart(album)
    cart.clearCart()

    expect(cart.itemCount.value).toBe(0)
    expect(cart.cartItems.value).toEqual([])
    expect(window.localStorage.getItem('album-viewer-cart')).toBe('[]')
  })
})
