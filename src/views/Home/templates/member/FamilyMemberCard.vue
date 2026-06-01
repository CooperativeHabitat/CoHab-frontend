<template>
  <div class="d-flex align-items-center gap-3">
    <div class="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold flex-shrink-0" 
         style="width: 3rem; height: 3rem; font-size: 1.1rem;">
      {{ initials }}
    </div>
    <div>
      <strong>{{ fullName }}</strong>
      <p class="mb-0 text-muted small">{{ memberData.username || 'Без логина' }}</p>
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
</script>