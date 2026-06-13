<template>
  <div class="d-flex align-items-center justify-content-between w-100">
    <div class="d-flex align-items-center gap-3">
      <div class="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold flex-shrink-0" 
           style="width: 3rem; height: 3rem; font-size: 1.1rem;">
        {{ initials }}
      </div>
      <div>
        <strong>{{ fullName }}</strong>
        <p class="mb-0 text-muted small">{{ memberData.member.username || 'Без логина' }}</p>
        <div v-if="memberData.roles?.length" class="d-flex flex-wrap gap-1 mt-1">
          <span v-for="role in sortedRoles" :key="role.id" 
                class="badge rounded-pill" 
                :class="getRoleBadgeClass(role.value)">
            {{ role.name }}
          </span>
        </div>
      </div>
    </div>
    
    <div class="dropdown">
      <button class="btn btn-link text-secondary p-1" 
              type="button" 
              data-bs-toggle="dropdown" 
              aria-expanded="false"
              style="font-size: 1.5rem; line-height: 1;">
        ⋮
      </button>
      <ul class="dropdown-menu dropdown-menu-end" @click.stop>
        <li class="dropdown-header">Назначить роль</li>
        <li v-for="roleRef in availableRoles" :key="roleRef.value.id">
          <button class="dropdown-item d-flex align-items-center justify-content-between" 
                  type="button"
                  @click="toggleRole(roleRef.value)">
            <div class="d-flex align-items-center gap-2">
              <span class="badge rounded-pill" :class="getRoleBadgeClass(roleRef.value.value)">
                {{ roleRef.value.name }}
              </span>
            </div>
            <i v-if="isRoleAssigned(roleRef.value)" class="bi bi-check-lg text-success ms-2"></i>
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, type Ref } from 'vue'
import type { FamilyMember, Role } from '@/types/family'

const props = defineProps<{
  member: Ref<FamilyMember>
  availableRoles: Ref<Role>[]
}>()

const emit = defineEmits<{
  'assign-role': [data: { familyId: string; familyMemberId: string; roleName: string }]
  'detach-role': [data: { familyId: string; familyMemberId: string; roleName: string }]
}>()

const memberData = computed(() => props.member.value)

// ✅ Добавьте безопасную проверку personalInfo
const personalInfo = computed(() => memberData.value.member?.personalInfo)

const initials = computed(() => {
  const first = personalInfo.value?.firstname?.charAt(0) || ''
  const last = personalInfo.value?.lastname?.charAt(0) || ''
  return (first + last).toUpperCase() || '?'
})

const fullName = computed(() => {
  const first = personalInfo.value?.firstname || 'Не указано'
  const last = personalInfo.value?.lastname || ''
  return last ? `${first} ${last}` : first
})

const sortedRoles = computed(() => {
  const roles = memberData.value.roles || []
  return [...roles].sort((a, b) => b.value - a.value)
})

const isRoleAssigned = (role: Role): boolean => {
  return memberData.value.roles?.some(r => r.id === role.id) || false
}

const toggleRole = (role: Role) => {
  const payload = {
    familyId: memberData.value.family.id,
    familyMemberId: memberData.value.id,
    roleName: role.name
  }

  if (isRoleAssigned(role)) {
    emit('detach-role', payload)
  } else {
    emit('assign-role', payload)
  }
}

const getRoleBadgeClass = (value: number): string => {
  if (value >= 100) return 'bg-danger'
  if (value >= 50) return 'bg-warning text-dark'
  if (value >= 10) return 'bg-primary'
  return 'bg-secondary'
}
</script>