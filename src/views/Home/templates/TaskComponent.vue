<template>
  <article :class="taskClasses">
    <header>
      <div>
        <small>#{{ task.value.id.slice(0, 8) }}</small>
        <div class="status-group">
          <span :class="statusIcon('isMarked')">
            <CheckIcon v-if="task.value.isMarked" :size="16" />
            <span v-else>○</span>
          </span>
          <span :class="statusIcon('isChecked')">
            <CheckCircleIcon v-if="task.value.isChecked" :size="16" />
            <span v-else>○</span>
          </span>
          <span :class="statusBadgeClasses">{{ statusText }}</span>
        </div>
      </div>
      <div class="progress-bar">
        <small>Срок: {{ timeLeft }}</small>
        <progress :value="deadlineProgress" max="100" :class="progressColor"></progress>
      </div>
    </header>

    <h3>{{ task.value.taskName }}</h3>
    <p v-if="task.value.description">{{ task.value.description }}</p>

    <div class="task-grid">
      <TaskPersonCard
        :person="task.value.createdBy"
        :is-checked="task.value.isChecked"
        :can-action="canCheckTask"
        action-type="check"
        @action="$emit('check-task', task, !task.value.isChecked)"
      />
      <TaskPersonCard
        :person="task.value.issuedTo"
        :is-marked="task.value.isMarked"
        :can-action="canMarkTask && !task.value.isChecked"
        action-type="mark"
        @action="$emit('mark-task', task, !task.value.isMarked)"
      />
    </div>

    <footer>
      <div class="task-meta">
        <span>
          <CalendarIcon :size="14" />
          Создана: {{ formatDate(task.value.createdDate) }}
        </span>
        <span :class="{ 'overdue': isOverdue }">
          <ClockIcon :size="14" />
          Дедлайн: {{ formatDate(task.value.dueDate) }}
        </span>
      </div>
      <div class="task-actions">
        <button @click="$emit('edit-task', task)" class="outline small">
          <EditIcon :size="14" />
          Изменить
        </button>
        <button @click="$emit('delete-task', task)" class="outline small" style="color: var(--pico-del-color);">
          <TrashIcon :size="14" />
          Удалить
        </button>
      </div>
    </footer>
  </article>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, type Ref } from 'vue'
import { CheckIcon, CheckCircleIcon, CalendarIcon, ClockIcon, EditIcon, TrashIcon } from 'lucide-vue-next'
import type { Task } from '@/types/task'
import TaskPersonCard from '@/views/Home/templates/TaskPersonCard.vue'

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

const taskClasses = computed(() => {
  if (isOverdue.value) return 'task overdue'
  if (props.task.value.isMarked && props.task.value.isChecked) return 'task done'
  if (props.task.value.isMarked) return 'task review'
  return 'task active'
})

const progressColor = computed(() => {
  if (deadlineProgress.value <= 20) return 'green'
  if (deadlineProgress.value <= 50) return 'yellow'
  return 'red'
})

const statusText = computed(() => {
  if (isOverdue.value) return 'ПРОСРОЧЕНО'
  if (props.task.value.isMarked && props.task.value.isChecked) return 'ВЫПОЛНЕНО'
  if (props.task.value.isMarked) return 'НА ПРОВЕРКЕ'
  return 'В РАБОТЕ'
})

const statusBadgeClasses = computed(() => {
  if (isOverdue.value) return 'badge overdue'
  if (props.task.value.isMarked && props.task.value.isChecked) return 'badge done'
  if (props.task.value.isMarked) return 'badge review'
  return 'badge active'
})

const statusIcon = (field: 'isMarked' | 'isChecked') => {
  return props.task.value[field] ? 'status-icon active' : 'status-icon'
}

const formatDate = (date: Date | string) => {
  if (!date) return 'Не указана'
  return new Date(date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
}
</script>

<style src="@/styles/base.css"></style>

<style scoped>
.task.overdue { border-left: 4px solid var(--pico-del-color); }
.task.done { border-left: 4px solid #22c55e; }
.task.review { border-left: 4px solid #3b82f6; }
.task.active { border-left: 4px solid #eab308; }

.status-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-icon {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--pico-muted-border-color);
  font-size: 0.75rem;
}

.status-icon.active {
  border-color: #22c55e;
  color: #22c55e;
}

.badge.overdue { background: #fee2e2; color: #dc2626; }
.badge.done { background: #dcfce7; color: #16a34a; }
.badge.review { background: #dbeafe; color: #2563eb; }
.badge.active { background: #fef9c3; color: #ca8a04; }

.progress-bar {
  min-width: 8rem;
}

progress {
  width: 100%;
  height: 0.5rem;
}

progress.green { accent-color: #22c55e; }
progress.yellow { accent-color: #eab308; }
progress.red { accent-color: #ef4444; }

.task-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  margin: 1rem 0;
}

.task-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  font-size: 0.875rem;
  color: var(--pico-muted-color);
}

.task-meta span {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.overdue { color: var(--pico-del-color); font-weight: 600; }

.task-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

button.small {
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
}

@media (min-width: 768px) {
  .task-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>