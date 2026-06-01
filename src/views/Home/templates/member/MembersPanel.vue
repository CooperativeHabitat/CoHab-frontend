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
          <div v-for="memberRef in memberRefs" :key="memberRef.value.id">
            <FamilyMemberCard :member="memberRef" />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import FamilyMemberCard from './FamilyMemberCard.vue'

const props = defineProps<{
  members: any[]
  membersLoading: boolean
}>()

defineEmits<{
  settings: []
  invite: []
}>()

const memberRefs = computed(() => props.members.map(member => ref(member)))
</script>