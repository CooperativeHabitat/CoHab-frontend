import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { NotificationDto } from '@/types/notification'

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref<NotificationDto[]>([])
  const unreadCount = ref(0)

  function addNotification(notification: NotificationDto) {
    notifications.value.unshift(notification)
    unreadCount.value++
  }

  function loadNotifications(newNotifications: NotificationDto[]) {
    notifications.value = newNotifications
  }

  function markAllRead() {
    unreadCount.value = 0
  }

  return {
    notifications,
    unreadCount,
    addNotification,
    loadNotifications,
    markAllRead
  }
})