<template>
  <div class="member">
    <div class="avatar">
      {{ initials }}
    </div>
    <div>
      <strong>{{ fullName }}</strong>
      <p>{{ props.member.username || 'Без логина' }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { FamilyMember } from '@/types/family'

const props = defineProps<{
  member: FamilyMember
}>()

const initials = computed(() => {
  const first = props.member.personalInfo?.firstname?.charAt(0) || ''
  const last = props.member.personalInfo?.lastname?.charAt(0) || ''
  return (first + last).toUpperCase() || '?'
})

const fullName = computed(() => {
  const first = props.member.personalInfo?.firstname || 'Не указано'
  const last = props.member.personalInfo?.lastname || ''
  return last ? `${first} ${last}` : first
})
</script>

<style scoped>
.member {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.avatar {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background: var(--pico-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.1rem;
  flex-shrink: 0;
}
</style>