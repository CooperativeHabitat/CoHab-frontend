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
        <div class="d-flex justify-content-between align-items-center mb-3">
          <p class="text-muted mb-0">Управление ролями участников</p>
          <button class="btn btn-primary btn-sm" @click="showCreateRoleForm = !showCreateRoleForm">
            {{ showCreateRoleForm ? 'Отмена' : 'Создать роль' }}
          </button>
        </div>

        <div v-if="showCreateRoleForm">
          <div class="card mb-3 border-primary">
            <div class="card-body">
              <h5 class="card-title">{{ editingRole ? 'Изменение роли' : 'Новая роль' }}</h5>
              <div class="mb-3">
                <label class="form-label">Название роли</label>
                <input v-model="newRole.name" type="text" class="form-control" placeholder="Введите название роли" />
              </div>
              <div class="mb-3">
                <label class="form-label">Уровень (value)</label>
                <input v-model.number="newRole.value" type="number" class="form-control" min="0" />
              </div>
              <div class="mb-3">
                <label class="form-label fs-5">Права доступа</label>
                <div class="d-flex flex-column gap-2">
                  <div v-for="access in accesses" :key="access.accessName" 
                       class="form-check form-switch d-flex align-items-center gap-3 ps-0">
                    <input class="form-check-input ms-0" type="checkbox" 
                           :id="'access-' + access.accessName"
                           :value="access.accessName"
                           v-model="newRole.accessList"
                           style="width: 3rem; height: 1.5rem;" />
                    <label class="form-check-label" :for="'access-' + access.accessName">
                      {{ access.description }}
                    </label>
                  </div>
                </div>
              </div>
              <div class="d-flex gap-2">
                <button @click="saveRole" class="btn btn-primary">
                  {{ editingRole ? 'Сохранить' : 'Создать' }}
                </button>
                <button v-if="editingRole" @click="cancelEdit" class="btn btn-outline-secondary">Отмена</button>
              </div>
            </div>
          </div>
        </div>

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
                  <li v-for="access in role.accessList" :key="access.accessName">{{ access.description }}</li>
                </ul>
                <div class="d-flex gap-2 mt-2">
                  <button @click="editRole(role)" class="btn btn-outline-secondary btn-sm">Изменить</button>
                  <button @click="deleteRole(role)" class="btn btn-outline-danger btn-sm">Удалить</button>
                </div>
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
import { computed, reactive, ref, watch } from 'vue'
import type { ValidationError } from "@/error/types/serverErrorResponses"
import ValidationErrorComponent from "@/error/templates/ValidationErrorComponent.vue"
import type { Role, Access } from '@/types/family'

const props = defineProps<{
  familyName?: string
  roles?: Role[]
  accesses?: Access[]
  error?: ValidationError | null
}>()

const emit = defineEmits<{
  back: []
  save: [familyName: string]
  leave: []
  'create-role': [role: { name: string; value: number; accessList: string[] }]
  'update-role': [role: { id: string; name: string; value: number; accessList: string[] }]
  'delete-role': [roleId: string]
}>()

const activeTab = ref('general')
const familyNameModel = ref(props.familyName || '')
const showCreateRoleForm = ref(false)
const editingRole = ref<Role | null>(null)

const newRole = reactive({
  name: '',
  value: 0,
  accessList: [] as string[]
})

const sortedRoles = computed(() => {
  if (!props.roles) return []
  return [...props.roles].sort((a, b) => b.value - a.value)
})

const editRole = (role: Role) => {
  editingRole.value = role
  Object.assign(newRole, {
    name: role.name,
    value: role.value,
    accessList: [...role.accessList.map(a => a.accessName)]
  })
  showCreateRoleForm.value = true
}

const cancelEdit = () => {
  editingRole.value = null
  showCreateRoleForm.value = false
  Object.assign(newRole, { name: '', value: 0, accessList: [] })
}

const saveRole = () => {
  if (editingRole.value) {
    emit('update-role', { id: editingRole.value.id, ...newRole })
  } else {
    emit('create-role', { ...newRole })
  }
  editingRole.value = null
  showCreateRoleForm.value = false
  Object.assign(newRole, { name: '', value: 0, accessList: [] })
}

const deleteRole = (role: Role) => {
  emit('delete-role', role.id)
}

watch(() => props.familyName, (val) => {
  familyNameModel.value = val || ''
})
</script>