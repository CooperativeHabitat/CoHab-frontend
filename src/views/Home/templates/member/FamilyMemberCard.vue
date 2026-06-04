<template>
  <div class="d-flex align-items-center gap-3">
    <div class="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold flex-shrink-0" 
         style="width: 3rem; height: 3rem; font-size: 1.1rem;">
      {{ initials }}
    </div>
    <div>
      <strong>{{ fullName }}</strong>
      <p class="mb-0 text-muted small">{{ memberData.username || 'Без логина' }}</p>
      <div v-if="memberData.roles?.length" class="d-flex flex-wrap gap-1 mt-1">
        <span v-for="role in sortedRoles" :key="role.id" 
              class="badge rounded-pill" 
              :class="getRoleBadgeClass(role.value)">
          {{ role.name }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, type Ref } from 'vue'
import type { FamilyMember } from '@/types/family'

const props = defineProps<{
  member: Ref<FamilyMember>
}>()

const memberData = computed(() => props.member.value)

const initials = computed(() => {
  const first = memberData.value.personalInfo?.firstname?.charAt(0) || ''
  const last = memberData.value.personalInfo?.lastname?.charAt(0) || ''
  return (first + last).toUpperCase() || '?'
})

const fullName = computed(() => {
  const first = memberData.value.personalInfo?.firstname || 'Не указано'
  const last = memberData.value.personalInfo?.lastname || ''
  return last ? `${first} ${last}` : first
})

const sortedRoles = computed(() => {
  const roles = memberData.value.roles || []
  return [...roles].sort((a, b) => b.value - a.value)
})

const getRoleBadgeClass = (value: number): string => {
  if (value >= 100) return 'bg-danger'
  if (value >= 50) return 'bg-warning text-dark'
  if (value >= 10) return 'bg-primary'
  return 'bg-secondary'
}
</script>