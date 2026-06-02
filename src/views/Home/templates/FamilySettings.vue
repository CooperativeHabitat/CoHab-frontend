<template>
  <div class="flex-grow-1 overflow-auto">
    <div class="d-flex align-items-center gap-2 mb-3">
      <button @click="$emit('back')" class="btn btn-outline-secondary btn-sm">
        ← Назад
      </button>
      <h3 class="mb-0">Настройки семьи</h3>
    </div>

    <ul class="nav nav-tabs mb-3">
      <li class="nav-item">
        <button :class="['nav-link', { active: activeTab === 'general' }]" @click="activeTab = 'general'">
          Основное
        </button>
      </li>
      <li class="nav-item">
        <button :class="['nav-link', { active: activeTab === 'roles' }]" @click="activeTab = 'roles'">
          Роли
        </button>
      </li>
      <li class="nav-item">
        <button :class="['nav-link', { active: activeTab === 'danger' }]" @click="activeTab = 'danger'">
          Опасно
        </button>
      </li>
    </ul>

    <div v-if="activeTab === 'general'" class="card" style="max-width: 48rem;">
      <div class="card-body">
        <ValidationErrorComponent v-if="error" :error="error" class="mb-3" />
        <div class="d-flex gap-3 align-items-end">
          <div class="flex-grow-1">
            <label class="form-label">Название семьи</label>
            <input v-model="familyNameModel" type="text" placeholder="Название семьи" class="form-control" />
          </div>
          <button @click="$emit('save', familyNameModel)" class="btn btn-secondary">Сохранить</button>
        </div>
      </div>
    </div>

    <div v-if="activeTab === 'roles'" class="card">
      <div class="card-body">
        <p class="text-muted">Управление ролями участников</p>
        <div v-if="!roles || roles.length === 0" class="text-center py-3">
          <p class="text-muted">Роли не найдены</p>
        </div>
        <div v-else class="accordion" id="rolesAccordion">
          <div v-for="role in sortedRoles" :key="role.id" class="accordion-item">
            <h2 class="accordion-header">
              <button :class="['accordion-button', 'collapsed']"
                      data-bs-toggle="collapse"
                      :data-bs-target="'#role-' + role.id">
                <strong>{{ role.name }}</strong>
                <span class="badge bg-primary ms-2">{{ role.memberCount }} участников</span>
              </button>
            </h2>
            <div :id="'role-' + role.id"
                class="accordion-collapse collapse"
                data-bs-parent="#rolesAccordion">
              <div class="accordion-body">
                <ul class="mb-0 small text-muted">
                  <li v-for="access in role.accessList" :key="access">{{ access }}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="activeTab === 'danger'" class="card border-danger">
      <div class="card-body">
        <h5 class="text-danger">Опасная зона</h5>
        <p class="text-muted">Эти действия нельзя отменить</p>
        <button @click="$emit('leave')" class="btn btn-danger">Покинуть семью</button>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { ValidationError } from "@/error/types/serverErrorResponses"
import ValidationErrorComponent from "@/error/templates/ValidationErrorComponent.vue"
import type { Role } from '@/types/family'

const props = defineProps<{
  familyName?: string
  roles?: Role[]
  error?: ValidationError | null
}>()

defineEmits<{
  back: []
  save: [familyName: string]
  leave: []
}>()

const activeTab = ref('general')
const familyNameModel = ref(props.familyName || '')

const sortedRoles = computed(() => {
  if (!props.roles) return []
  return [...props.roles].sort((a, b) => b.value - a.value)
})

watch(() => props.familyName, (val) => {
  familyNameModel.value = val || ''
})
</script>