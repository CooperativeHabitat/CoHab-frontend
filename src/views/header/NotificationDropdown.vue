<template>
  <div class="dropdown" style="overflow: visible">
    <button 
      class="btn nav-link position-relative" 
      data-bs-toggle="dropdown" 
      aria-expanded="false"
      @click="notificationStore.markAllRead()"
    >
      <BellIcon :size="20" :class="notificationStore.unreadCount > 0 ? 'text-warning' : ''" />
      <span 
        v-if="notificationStore.unreadCount > 0" 
        class="position-absolute translate-middle badge rounded-pill bg-danger"
        style="font-size: 0.7rem; padding: 0.2em 0.4em; top: 10px; right: -2px;"
      >
        {{ notificationStore.unreadCount > 99 ? '99+' : notificationStore.unreadCount }}
      </span>
    </button>
    <ul class="dropdown-menu dropdown-menu-end p-0" style="min-width: 350px; max-height: 400px; overflow-y: auto; z-index: 9999">
      <li class="p-3 border-bottom bg-body-tertiary">
        <h6 class="mb-0">Уведомления</h6>
      </li>
      <li v-if="notificationStore.notifications.length === 0" class="p-3 text-center text-muted">
        Нет уведомлений
      </li>
      <li 
        v-for="notification in notificationStore.notifications" 
        :key="notification.createdAt"
        class="p-3 border-bottom"
      >
        <div class="d-flex justify-content-between align-items-start mb-1">
          <small class="text-primary fw-bold">{{ notification.from }}</small>
          <small class="text-muted">{{ formatDate(notification.createdAt) }}</small>
        </div>
        <p class="mb-0 small">{{ notification.message }}</p>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { BellIcon } from 'lucide-vue-next'
import { useNotificationStore } from '@/stores/notificationStore'
import { rsocketService } from '@/services/rsocket'
import type { NotificationDto, NotificationRequest } from '@/types/notification'

const notificationStore = useNotificationStore()
let subscription: any = null

const formatDate = (dateString: string): string => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  if (diff < 60000) return 'только что'
  if (diff < 3600000) return `${Math.floor(diff / 60000)} мин. назад`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} ч. назад`
  
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

const showToast = (notification: NotificationDto) => {
  const toastContainer = document.getElementById('toast-container')
  if (!toastContainer) return
  
  const toast = document.createElement('div')
  toast.className = 'toast align-items-center border-0'
  toast.style.background = 'rgba(102, 126, 234, 0.9)'
  toast.style.color = 'white'
  toast.setAttribute('role', 'alert')
  toast.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">
        <strong>${notification.from}</strong><br>
        <small>${notification.message}</small>
      </div>
      <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast"></button>
    </div>
  `
  toastContainer.appendChild(toast)
  
  const bsToast = new (window as any).bootstrap.Toast(toast, { delay: 3000 })
  bsToast.show()
  
  toast.addEventListener('hidden.bs.toast', () => toast.remove())
}

const loadNotifications = async () => {
  try {
    const now = new Date()
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    
    const request: NotificationRequest = {
      page: 0,
      size: 20,
      startDate: yesterday.toISOString(),
      endDate: now.toISOString()
    }
    
    const response = await rsocketService.requestResponse('api.notification.notifications', request)
    const notifications = response?.content || response || []
    notificationStore.loadNotifications(Array.isArray(notifications) ? notifications : [])
  } catch (error) {
    console.error('Ошибка загрузки уведомлений:', error)
  }
}

const connectNotificationStream = () => {
  rsocketService.requestStream('api.notification.stream').then(observable => {
    subscription = observable.subscribe({
      next: (response: NotificationDto) => {
        notificationStore.addNotification(response)
        showToast(response)
      },
      error: (error: any) => {
        console.error('Notification stream error:', error)
      }
    })
  }).catch(error => {
    console.error('Failed to connect to notification stream:', error)
  })
}

onMounted(() => {
  loadNotifications()
  connectNotificationStream()
})

onUnmounted(() => {
  if (subscription) {
    subscription.unsubscribe()
  }
})
</script>