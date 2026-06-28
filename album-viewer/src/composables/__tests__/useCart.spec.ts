import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Album } from '../../types/album'

const STORAGE_KEY = 'album-viewer-cart'

const createLocalStorageMock = () => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => (key in store ? store[key] : null)),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    })
  }
}

const albumA: Album = {
  id: 1,
  title: 'Album A',
  artist: 'Artist A',
  price: 9.99,
  image_url: 'http://example.com/a.jpg'
}

const albumB: Album = {
  id: 2,
  title: 'Album B',
  artist: 'Artist B',
  price: 5.5,
  image_url: 'http://example.com/b.jpg'
}

const loadCart = async () => {
  // Re-import a fresh module instance so the singleton state resets per test.
  vi.resetModules()
  const mod = await import('../useCart')
  return mod.useCart()
}

describe('useCart', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', createLocalStorageMock())
  })

  it('starts empty when nothing is persisted', async () => {
    const cart = await loadCart()
    expect(cart.count.value).toBe(0)
    expect(cart.totalPrice.value).toBe(0)
  })

  it('adds an album and updates count and total', async () => {
    const cart = await loadCart()
    const added = cart.addToCart(albumA)
    expect(added).toBe(true)
    expect(cart.count.value).toBe(1)
    expect(cart.isInCart(albumA.id)).toBe(true)
    expect(cart.totalPrice.value).toBeCloseTo(9.99)
  })

  it('does not add the same album twice', async () => {
    const cart = await loadCart()
    cart.addToCart(albumA)
    const addedAgain = cart.addToCart(albumA)
    expect(addedAgain).toBe(false)
    expect(cart.count.value).toBe(1)
  })

  it('removes an album from the cart', async () => {
    const cart = await loadCart()
    cart.addToCart(albumA)
    cart.addToCart(albumB)
    cart.removeFromCart(albumA.id)
    expect(cart.count.value).toBe(1)
    expect(cart.isInCart(albumA.id)).toBe(false)
    expect(cart.isInCart(albumB.id)).toBe(true)
  })

  it('toggles an album in and out of the cart', async () => {
    const cart = await loadCart()
    expect(cart.toggleCart(albumA)).toBe(true)
    expect(cart.isInCart(albumA.id)).toBe(true)
    expect(cart.toggleCart(albumA)).toBe(false)
    expect(cart.isInCart(albumA.id)).toBe(false)
  })

  it('clears the cart', async () => {
    const cart = await loadCart()
    cart.addToCart(albumA)
    cart.addToCart(albumB)
    cart.clearCart()
    expect(cart.count.value).toBe(0)
  })

  it('persists items to localStorage', async () => {
    const cart = await loadCart()
    cart.addToCart(albumA)
    await Promise.resolve()
    expect(localStorage.setItem).toHaveBeenCalled()
    const raw = localStorage.getItem(STORAGE_KEY)
    expect(raw).not.toBeNull()
    expect(JSON.parse(raw as string)).toHaveLength(1)
  })

  it('loads previously persisted items', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([albumA]))
    const cart = await loadCart()
    expect(cart.count.value).toBe(1)
    expect(cart.isInCart(albumA.id)).toBe(true)
  })

  it('recovers gracefully from corrupted storage', async () => {
    localStorage.setItem(STORAGE_KEY, 'not-json')
    const cart = await loadCart()
    expect(cart.count.value).toBe(0)
  })
})
