import { nextTick } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Album } from '../../types/album'

type UseCart = (typeof import('../useCart'))['useCart']

const album: Album = {
  id: 1,
  title: 'Kind of Blue',
  artist: 'Miles Davis',
  price: 12.99,
  image_url: 'kind-of-blue.jpg'
}

describe('useCart', () => {
  const storage = new Map<string, string>()
  let useCart: UseCart

  const importUseCart = async (): Promise<UseCart> => {
    return (await import('../useCart')).useCart
  }

  beforeEach(async () => {
    storage.clear()
    vi.resetModules()
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
      removeItem: (key: string) => storage.delete(key),
      clear: () => storage.clear()
    })
    localStorage.clear()
    useCart = await importUseCart()
    useCart().clear()
  })

  it('adds albums once and reports count and totals', () => {
    const cart = useCart()

    expect(cart.addItem(album)).toBe(true)
    expect(cart.addItem(album)).toBe(false)

    expect(cart.count.value).toBe(1)
    expect(cart.totalPrice.value).toBe(12.99)
    expect(cart.isInCart(album.id)).toBe(true)
  })

  it('rounds totals to cents', () => {
    const cart = useCart()

    cart.addItem({ ...album, id: 2, price: 0.1 })
    cart.addItem({ ...album, id: 3, price: 0.2 })

    expect(cart.totalPrice.value).toBe(0.3)
  })

  it('removes albums from the cart', () => {
    const cart = useCart()

    cart.addItem(album)

    expect(cart.removeItem(album.id)).toBe(true)
    expect(cart.removeItem(album.id)).toBe(false)
    expect(cart.count.value).toBe(0)
  })

  it('persists cart changes to localStorage', async () => {
    const cart = useCart()

    cart.addItem(album)
    await nextTick()

    expect(localStorage.getItem('album-viewer-cart')).toBe(JSON.stringify([album]))
  })

  it('discards corrupted localStorage data', async () => {
    localStorage.setItem('album-viewer-cart', 'not valid json')
    vi.resetModules()
    useCart = await importUseCart()

    expect(useCart().count.value).toBe(0)
    expect(localStorage.getItem('album-viewer-cart')).toBeNull()
  })

  it('discards malformed album data from localStorage', async () => {
    localStorage.setItem('album-viewer-cart', JSON.stringify([{ id: 1 }]))
    vi.resetModules()
    useCart = await importUseCart()

    expect(useCart().count.value).toBe(0)
    expect(localStorage.getItem('album-viewer-cart')).toBeNull()
  })
})
