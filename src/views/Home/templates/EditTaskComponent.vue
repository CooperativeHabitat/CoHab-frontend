<template>
  <dialog open @click.self="$emit('close')">
    <article>
      <header>
        <h2>{{ familyStore.editTask ? 'Редактирование задачи' : 'Новая задача' }}</h2>
        <button @click="$emit('close')" class="close">
          <XIcon :size="20" />
        </button>
      </header>

      <div v-if="hasErrors" class="error">
        <ValidationErrorComponent :error="errorState.validationError" />
      </div>

      <label>
        Название задачи
        <input v-model="form.taskName" type="text" placeholder="Введите название задачи" />
      </label>

      <label>
        Описание
        <textarea v-model="form.description" rows="3" placeholder="Опишите задачу подробнее" />
      </label>

      <label>
        Исполнитель
        <select v-model="form.issuedToId">
          <option value="" disabled>Выберите исполнителя</option>
          <option v-for="member in familyMembers" :key="member.value?.id" :value="member.value?.id">
            {{ formatMemberName(member.value) }}
          </option>
        </select>
      </label>

      <label>
        Срок выполнения
        <input v-model="form.dueDate" type="datetime-local" />
      </label>

      <footer>
        <button @click="$emit('close')" class="secondary">Отмена</button>
        <button @click="saveTask" :disabled="isSaving || !form.taskName.trim()" :aria-busy="isSaving">
          {{ isSaving ? 'Сохранение...' : familyStore.editTask ? 'Сохранить' : 'Создать' }}
        </button>
      </footer>
    </article>
  </dialog>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import { XIcon } from 'lucide-vue-next'
import type { Task } from '@/types/task'
import type { FamilyMember } from "@/types/family.ts"
import { apiService } from '@/services/api'
import useFamilyStore from "@/stores/familyStore.ts"
import { ProblemDetail, ValidationError } from "@/error/types/serverErrorResponses"
import ValidationErrorComponent from "@/error/templates/ValidationErrorComponent.vue"

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'saved', task: Task): void
}>()

const familyStore = useFamilyStore()
const familyMembers = computed(() => {
  const tab = familyStore.activeFamilyTab
  return tab ? familyStore.members[tab] || [] : []
})

const form = ref({
  taskId: '',
  taskName: '',
  description: '',
  issuedToId: '',
  dueDate: '',
})

const isSaving = ref(false)
const errorState = ref<{ validationError: ValidationError | null }>({ validationError: null })
const hasErrors = computed(() => errorState.value.validationError !== null)

const formatDateTimeLocal = (date: Date | string): string => {
  if (!date) return ''
  const d = new Date(date)
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}

const formatMemberName = (member: FamilyMember | undefined): string => {
  if (!member) return 'Неизвестный'
  const name = `${member.personalInfo?.firstname || ''} ${member.personalInfo?.lastname || ''}`.trim()
  return name || member.username || 'Без имени'
}

const updateForm = () => {
  const task = familyStore.editTask
  form.value = task ? {
    taskId: task.id || '',
    taskName: task.taskName || '',
    description: task.description || '',
    issuedToId: task.issuedTo?.id || '',
    dueDate: formatDateTimeLocal(task.dueDate || new Date()),
  } : {
    taskId: '',
    taskName: '',
    description: '',
    issuedToId: '',
    dueDate: formatDateTimeLocal(new Date()),
  }
}

const saveTask = async () => {
  if (!form.value.taskName.trim()) return
  
  isSaving.value = true
  try {
    const body = {
      taskId: form.value.taskId || null,
      taskName: form.value.taskName,
      description: form.value.description,
      familyId: familyStore.activeFamilyTab,
      issuedTo: form.value.issuedToId,
      dueDate: form.value.dueDate
    }

    const response = body.taskId
      ? await apiService.put('task/update', body)
      : await apiService.post('task/create', body)

    if (body.taskId) familyStore.updateTask(response.body)
    else familyStore.addTask(response.body)

    emit('saved', response.body)
    emit('close')
  } catch(err) {
    if (err instanceof ProblemDetail) {
      errorState.value.validationError = new ValidationError(err)
    }
  } finally {
    isSaving.value = false
  }
}

onMounted(() => updateForm())
watch(() => familyStore.editTask, () => updateForm(), { deep: true })
</script>

<style scoped>
dialog {
  backdrop-filter: blur(4px);
}

article {
  max-width: 36rem;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.close {
  background: none;
  border: none;
  padding: 0.25rem;
  cursor: pointer;
  color: var(--pico-muted-color);
}

.error {
  margin-bottom: 1rem;
  padding: 1rem;
  background: #fee2e2;
  border-radius: 0.5rem;
}

label {
  display: block;
  margin-bottom: 1rem;
}

footer {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
}
</style>