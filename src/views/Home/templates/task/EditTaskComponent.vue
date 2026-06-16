<template>
  <div class="modal d-block" tabindex="-1" style="background: rgba(0,0,0,0.5); backdrop-filter: blur(4px);">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ familyStore.editTask ? 'Редактирование задачи' : 'Новая задача' }}</h5>
          <button @click="$emit('close')" class="btn-close"></button>
        </div>

        <div class="modal-body">
          <div v-if="hasErrors" class="alert alert-danger">
            <ValidationErrorComponent :error="errorState.validationError" />
          </div>

          <div class="mb-3">
            <label class="form-label">Название задачи</label>
            <input v-model="form.taskName" type="text" class="form-control" placeholder="Введите название задачи" />
          </div>

          <div class="mb-3">
            <label class="form-label">Описание</label>
            <textarea v-model="form.description" rows="3" class="form-control" placeholder="Опишите задачу подробнее" />
          </div>

          <div class="mb-3">
            <label class="form-label">Исполнитель</label>
            <select v-model="form.issuedToId" class="form-select">
              <option value="" disabled>Выберите исполнителя</option>
              <option v-for="member in familyMembers" :key="member.value?.id" :value="member.value?.id">
                {{ formatMemberName(member.value) }}
              </option>
            </select>
          </div>

          <div class="mb-3">
            <label class="form-label">Срок выполнения</label>
            <input v-model="form.dueDate" type="datetime-local" class="form-control" />
          </div>
        </div>

        <div class="modal-footer">
          <button @click="$emit('close')" class="btn btn-secondary">Отмена</button>
          <button @click="saveTask" :disabled="isSaving || !form.taskName.trim()" class="btn btn-primary">
            <span v-if="isSaving" class="spinner-border spinner-border-sm me-1"></span>
            {{ isSaving ? 'Сохранение...' : familyStore.editTask ? 'Сохранить' : 'Создать' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
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
  const name = `${member.member?.personalInfo?.firstname || ''} ${member.member?.personalInfo?.lastname || ''}`.trim()
  return name || member.member?.username || 'Без имени'
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