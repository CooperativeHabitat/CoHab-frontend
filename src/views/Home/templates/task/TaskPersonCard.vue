<template>
  <div class="card p-3 rounded-3">
    <div class="d-flex justify-content-between align-items-center mb-2">
      <small class="text-muted">{{ title }}</small>
      <span class="d-flex align-items-center gap-1 small"
            :class="isActive ? 'text-success' : 'text-muted'">
        <span class="rounded-circle d-inline-block"
              :class="isActive ? 'bg-success' : 'bg-secondary'"
              style="width: 0.5rem; height: 0.5rem;">
        </span>
        {{ indicatorText }}
      </span>
    </div>
    
    <div class="d-flex align-items-center justify-content-between">
      <div class="d-flex align-items-center gap-3 flex-grow-1">
        <div class="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white flex-shrink-0"
             :class="isActive ? 'bg-success' : 'bg-secondary'"
             style="width: 2.5rem; height: 2.5rem; font-size: 0.875rem;">
          {{ initials }}
        </div>
        <div>
          <strong>{{ name }}</strong>
          <small class="d-block text-muted">{{ date }}</small>
        </div>
      </div>
      
      <label v-if="canAction" class="d-flex align-items-center gap-2 small cursor-pointer mb-0">
        <span>{{ actionText }}</span>
        <input type="checkbox" 
               :checked="isActive" 
               @change="$emit('action')"
               class="form-check-input m-0"
               style="width: 2.5rem; height: 1.5rem;">
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Member } from '@/types/family'

interface Props {
  person: Member
  title?: string
  isMarked?: boolean
  isChecked?: boolean
  canAction?: boolean
  actionType?: 'mark' | 'check'
  date?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Участник',
  actionType: 'mark'
})

const emit = defineEmits(['action'])

const isActive = computed(() => props.actionType === 'mark' ? props.isMarked : props.isChecked)

const initials = computed(() => {
  const first = props.person.personalInfo?.firstname?.[0] || ''
  const last = props.person.personalInfo?.lastname?.[0] || ''
  return (first + last).toUpperCase() || '?'
})

const name = computed(() => {
  const first = props.person.personalInfo?.firstname || 'Не указано'
  const last = props.person.personalInfo?.lastname?.charAt(0) || ''
  return last ? `${first} ${last}.` : first
})

const indicatorText = computed(() => {
  if (props.actionType === 'mark') return props.isMarked ? 'Выполнено' : 'В работе'
  return props.isChecked ? 'Проверено' : 'Не проверено'
})

const actionText = computed(() => props.actionType === 'mark' ? 'Выполнено' : 'Проверено')
</script>