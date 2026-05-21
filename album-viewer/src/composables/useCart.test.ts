import { beforeEach, describe, expect, it } from 'vitest'
import type { Album } from '../types/album'
import { resetCartForTests, useCart } from './useCart'

class MockStorage {
  private values = new Map<string, string>()

  getItem(key: string): string | null {
    return this.values.get(key) ?? null
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value)
  }
}

const sampleAlbum: Album = {
  id: 1,
  title: 'The Dark Side of the Moon',
  artist: 'Pink Floyd',
  price: 19.99,
  image_url: 'image-url'
}

describe('useCart', () => {
  beforeEach(() => {
    resetCartForTests()
  })

  it('adds albums and prevents duplicates', () => {
    const storage = new MockStorage()
    const cart = useCart(storage)

    expect(cart.addToCart(sampleAlbum)).toBe(true)
    expect(cart.addToCart(sampleAlbum)).toBe(false)
    expect(cart.itemCount.value).toBe(1)
    expect(cart.isInCart(sampleAlbum.id)).toBe(true)
  })

  it('removes albums from the cart', () => {
    const storage = new MockStorage()
    const cart = useCart(storage)

    cart.addToCart(sampleAlbum)
    cart.removeFromCart(sampleAlbum.id)

    expect(cart.itemCount.value).toBe(0)
    expect(cart.isInCart(sampleAlbum.id)).toBe(false)
  })

  it('loads persisted albums from storage', () => {
    const storage = new MockStorage()
    storage.setItem('album-viewer-cart', JSON.stringify([sampleAlbum]))

    const cart = useCart(storage)
    expect(cart.itemCount.value).toBe(1)
    expect(cart.totalPrice.value).toBe(19.99)
  })

  it('clears albums and persists empty cart', () => {
    const storage = new MockStorage()
    const cart = useCart(storage)
    cart.addToCart(sampleAlbum)

    cart.clearCart()

    expect(cart.itemCount.value).toBe(0)
    expect(storage.getItem('album-viewer-cart')).toBe('[]')
  })
})
