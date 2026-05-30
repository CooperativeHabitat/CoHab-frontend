<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
       @click.self="$emit('close')">
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
      <!-- Заголовок -->
      <div class="bg-blue-500 text-white p-6">
        <div class="flex items-center justify-between">
          <h2 class="text-2xl font-bold">
            {{ familyStore.editTask ? 'Редактирование задачи' : 'Новая задача' }}
          </h2>
          <button @click="$emit('close')" class="text-white hover:text-blue-100">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      <div v-if="hasErrors" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
        <validation-error-component :error="errorState.validationError" />
      </div>

      <!-- Форма -->
      <div class="p-6 overflow-y-auto max-h-[70vh]">
        <div class="space-y-6">
          <!-- Название задачи -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Название задачи</label>
            <input
                v-model="form.taskName"
                type="text"
                class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                placeholder="Введите название задачи"
            />
          </div>

          <!-- Описание -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Описание</label>
            <textarea
                v-model="form.description"
                rows="3"
                class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition resize-none"
                placeholder="Опишите задачу подробнее"
            />
          </div>

          <!-- Исполнитель -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Исполнитель</label>
            <select
                v-model="form.issuedToId"
                class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition bg-white"
            >
              <option value="" disabled>Выберите исполнителя</option>
              <option v-for="member in familyMembers" :key="member.value?.id" :value="member.value?.id">
                {{ formatMemberName(member.value) }}
              </option>
            </select>
          </div>

          <!-- Дедлайн -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Срок выполнения</label>
            <input
                v-model="form.dueDate"
                type="datetime-local"
                class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
            />
          </div>
        </div>
      </div>

      <!-- Кнопки -->
      <div class="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end space-x-4">
        <button
            @click="$emit('close')"
            class="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
        >
          Отмена
        </button>
        <button
            @click="saveTask"
            :disabled="isSaving || !form.taskName.trim()"
            class="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <span v-if="isSaving" class="flex items-center">
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Сохранение...
          </span>
          <span v-else>{{ familyStore.editTask ? 'Сохранить' : 'Создать' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, watch, onMounted, type Ref, computed} from 'vue'
import type { Task } from '@/types/task'
import type { FamilyMember } from "@/types/family.ts"
import { apiService } from '@/services/api'
import useFamilyStore from "@/stores/familyStore.ts";
import {ProblemDetail, ValidationError} from "@/error/types/serverErrorResponses";
import ValidationErrorComponent from "@/error/templates/ValidationErrorComponent.vue";

interface Emits {
  (e: 'close'): void
  (e: 'saved', task: Task): void
}

const emit = defineEmits<Emits>()
const familyMembers = computed(() => {
  const tab = familyStore.activeFamilyTab
  return tab ? familyStore.members[tab] || [] : []
})

const formatDateTimeLocal = (date: Date | string): string => {
  if (!date) return ''
  const d = new Date(date)
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}

const form = ref({
  taskId: '',
  taskName: '',
  description: '',
  issuedToId: '',
  dueDate: '',
})

const isSaving = ref(false)
const familyStore = useFamilyStore()

const formatMemberName = (member: FamilyMember | undefined): string => {
  if (!member) return 'Неизвестный'
  const firstName = member.personalInfo?.firstname || ''
  const lastName = member.personalInfo?.lastname || ''
  return `${firstName} ${lastName}`.trim() || member.username || 'Без имени'
}

const updateForm = () => {
  if (familyStore.editTask) {
    const task = familyStore.editTask
    form.value = {
      taskId: task.id || '',
      taskName: task.taskName || '',
      description: task.description || '',
      issuedToId: task.issuedTo?.id || '',
      dueDate: formatDateTimeLocal(task.dueDate || new Date()),
    }
  } else {
    form.value = {
      taskId: '',
      taskName: '',
      description: '',
      issuedToId: '',
      dueDate: formatDateTimeLocal(new Date()),
    }
  }
}

const errorState= ref<{ validationError: ValidationError | null}> ({
  validationError: null
});

const hasErrors = computed(() => {
  let value = errorState.value;
  return value.validationError !== null
})

const saveTask = async () => {
  if (!form.value.taskName.trim()) {
    alert('Введите название задачи')
    return
  }
  console.log(form.value)
  isSaving.value = true
  try {
    const body = {
      taskId: form.value.taskId === '' ? null : form.value.taskId,
      taskName: form.value.taskName,
      description: form.value.description,
      familyId: familyStore.activeFamilyTab,
      issuedTo: form.value.issuedToId,
      dueDate: form.value.dueDate
    }
    console.log(body)
    let response

    if (body.taskId) {
      response = await apiService.put(`task/update`, body)
      familyStore.updateTask(response.body)
    } else {
      response = await apiService.post('task/create', body)
      familyStore.addTask(response.body)
    }

    emit('saved', response.body)
    emit('close')
  } catch(err){
    if (err instanceof ProblemDetail) {
      console.log("Ошибка при создании задачи")
      errorState.value.validationError = new ValidationError(err);
    }
  } finally {
    isSaving.value = false
  }
}

onMounted(() => {
  updateForm()
})

watch(() => familyStore.editTask, () => {
  updateForm()
}, { deep: true })
</script>