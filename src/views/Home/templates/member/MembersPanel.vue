<template>
  <div class="card h-100 d-flex flex-column overflow-hidden">
    <div v-if="membersLoading" class="d-flex justify-content-center align-items-center flex-grow-1">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Загрузка участников...</span>
      </div>
    </div>
    
    <template v-else>
      <div class="card-header d-flex justify-content-between align-items-center">
        <h2 class="mb-0">Участники</h2>
        <div class="d-flex gap-2">
          <button @click="$emit('settings')" class="btn btn-outline-secondary btn-sm">Настройки</button>
          <button @click="$emit('invite')" class="btn btn-outline-secondary btn-sm">Пригласить</button>
        </div>
      </div>
      
      <div class="card-body overflow-auto flex-grow-1">
        <div v-if="members.length === 0" class="text-center py-3">
          <p>Нет участников</p>
        </div>
        <div v-else class="d-flex flex-column gap-3">
          <div v-for="member in members" :key="member.value?.id || member.id">
            <FamilyMemberCard 
              :member="member"
              :available-roles="availableRoles"
              @assign-role="$emit('assign-role', $event)"
              @detach-role="$emit('detach-role', $event)" />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { Ref } from 'vue'
import type { Role } from '@/types/family.ts';
import FamilyMemberCard from './FamilyMemberCard.vue'

defineProps<{
  members: any[]
  membersLoading: boolean
  availableRoles: Ref<Role>[]
}>()

defineEmits<{
  settings: []
  invite: []
  'assign-role': [data: { familyId: string; familyMemberId: string; roleName: string }]
  'detach-role': [data: { familyId: string; familyMemberId: string; roleName: string }]
}>()
</script>