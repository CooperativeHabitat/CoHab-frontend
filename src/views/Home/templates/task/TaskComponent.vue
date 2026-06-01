<template>
  <div :class="['card border-start border-4 mb-2', borderClass]">
    <div class="card-body p-2">
      <div class="d-flex justify-content-between align-items-start mb-1">
        <div class="d-flex align-items-center gap-2">
          <small class="text-muted">#{{ task.value.id.slice(0, 8) }}</small>
          <span :class="['badge', badgeClass]">{{ statusText }}</span>
        </div>
        <div class="d-flex align-items-center gap-1" style="min-width: 120px;">
          <small class="text-muted text-nowrap">{{ timeLeft }}</small>
          <div class="progress flex-grow-1" style="height: 4px;">
            <div class="progress-bar" :class="progressBg" 
                 :style="{ width: deadlineProgress + '%' }"></div>
          </div>
        </div>
      </div>

      <h6 class="mb-1">{{ task.value.taskName }}</h6>
      <p v-if="task.value.description" class="small text-muted mb-2">{{ task.value.description }}</p>

      <div class="row g-2 mb-2">
        <div class="col-6">
          <TaskPersonCard
            :person="task.value.createdBy"
            :is-checked="task.value.isChecked"
            :can-action="canCheckTask"
            action-type="check"
            @action="$emit('check-task', task, !task.value.isChecked)"
          />
        </div>
        <div class="col-6">
          <TaskPersonCard
            :person="task.value.issuedTo"
            :is-marked="task.value.isMarked"
            :can-action="canMarkTask && !task.value.isChecked"
            action-type="mark"
            @action="$emit('mark-task', task, !task.value.isMarked)"
          />
        </div>
      </div>

      <div class="d-flex justify-content-between align-items-center">
        <div class="d-flex gap-2 small text-muted">
          <span class="d-flex align-items-center gap-1">
            <CalendarIcon :size="12" />
            {{ formatDate(task.value.createdDate) }}
          </span>
          <span :class="{ 'text-danger fw-bold': isOverdue }" class="d-flex align-items-center gap-1">
            <ClockIcon :size="12" />
            {{ formatDate(task.value.dueDate) }}
          </span>
        </div>
        <div class="d-flex gap-1">
          <button @click="$emit('edit-task', task)" class="btn btn-outline-secondary btn-sm py-0 px-1">
            <EditIcon :size="12" />
          </button>
          <button @click="$emit('delete-task', task)" class="btn btn-outline-danger btn-sm py-0 px-1">
            <TrashIcon :size="12" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, type Ref } from 'vue'
import { CalendarIcon, ClockIcon, EditIcon, TrashIcon } from 'lucide-vue-next'
import type { Task } from '@/types/task'
import TaskPersonCard from '@/views/Home/templates/task/TaskPersonCard.vue'

interface Props {
  task: Ref<Task>
  currentUserId: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'mark-task': [task: Ref<Task>, isMarked: boolean]
  'check-task': [task: Ref<Task>, isChecked: boolean]
  'edit-task': [task: Ref<Task>]
  'delete-task': [task: Ref<Task>]
}>()

const now = ref(new Date())
onMounted(() => setInterval(() => now.value = new Date(), 60000))

const isOverdue = computed(() => new Date(props.task.value.dueDate) < now.value)
const deadlineProgress = computed(() => {
  const created = new Date(props.task.value.createdDate).getTime()
  const due = new Date(props.task.value.dueDate).getTime()
  const current = now.value.getTime()
  if (current >= due) return 100
  if (current <= created) return 0
  return ((current - created) / (due - created)) * 100
})

const timeLeft = computed(() => {
  const diff = new Date(props.task.value.dueDate).getTime() - now.value.getTime()
  if (diff <= 0) return 'Просрочено'
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  return days > 0 ? `${days} дн. ${hours} ч.` : `${hours} ч.`
})

const canMarkTask = computed(() => props.currentUserId === props.task.value.issuedTo.id)
const canCheckTask = computed(() => props.currentUserId === props.task.value.createdBy.id)

const borderClass = computed(() => {
  if (isOverdue.value) return 'border-danger'
  if (props.task.value.isMarked && props.task.value.isChecked) return 'border-success'
  if (props.task.value.isMarked) return 'border-primary'
  return 'border-warning'
})

const badgeClass = computed(() => {
  if (isOverdue.value) return 'text-bg-danger'
  if (props.task.value.isMarked && props.task.value.isChecked) return 'text-bg-success'
  if (props.task.value.isMarked) return 'text-bg-primary'
  return 'text-bg-warning'
})

const progressBg = computed(() => {
  if (deadlineProgress.value <= 20) return 'bg-success'
  if (deadlineProgress.value <= 50) return 'bg-warning'
  return 'bg-danger'
})

const statusText = computed(() => {
  if (isOverdue.value) return 'ПРОСРОЧЕНО'
  if (props.task.value.isMarked && props.task.value.isChecked) return 'ВЫПОЛНЕНО'
  if (props.task.value.isMarked) return 'НА ПРОВЕРКЕ'
  return 'В РАБОТЕ'
})

const formatDate = (date: Date | string) => {
  if (!date) return 'Не указана'
  return new Date(date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
}
</script>