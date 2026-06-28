import { ref } from 'vue'

export interface Toast {
  id: number
  message: string
}

const toasts = ref<Toast[]>([])
let nextId = 0

export function useToast() {
  const showToast = (message: string, duration = 2000): void => {
    const id = nextId++
    toasts.value = [...toasts.value, { id, message }]
    setTimeout(() => {
      toasts.value = toasts.value.filter((toast) => toast.id !== id)
    }, duration)
  }

  return {
    toasts,
    showToast
  }
}
