<template>
  <div class="person-card">
    <div class="person-header">
      <small>{{ title }}</small>
      <span :class="['indicator', isActive ? 'active' : '']">
        {{ indicatorText }}
      </span>
    </div>
    
    <div class="person-body">
      <div class="person-info">
        <div :class="['avatar', isActive ? 'avatar-active' : '']">
          {{ initials }}
        </div>
        <div>
          <strong>{{ name }}</strong>
          <small>{{ date }}</small>
        </div>
      </div>
      
      <label v-if="canAction" class="toggle">
        <span>{{ actionText }}</span>
        <input type="checkbox" :checked="isActive" @change="$emit('action')">
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { FamilyMember } from '@/types/family'

interface Props {
  person: FamilyMember
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

<style scoped>
.person-card {
  background: var(--pico-card-background-color);
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px solid var(--pico-muted-border-color);
}

.person-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.indicator {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: var(--pico-muted-color);
}

.indicator::before {
  content: '';
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: var(--pico-muted-color);
}

.indicator.active {
  color: #16a34a;
}

.indicator.active::before {
  background: #16a34a;
}

.person-body {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.person-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: var(--pico-muted-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.875rem;
  flex-shrink: 0;
}

.avatar.avatar-active {
  background: #16a34a;
}

.toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.875rem;
}

.toggle input[type="checkbox"] {
  width: 2.5rem;
  height: 1.5rem;
  margin: 0;
}
</style>