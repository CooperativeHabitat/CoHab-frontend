<template>
  <div class="d-flex flex-column vh-100">
    <Header />
    
    <main class="flex-grow-1 d-flex flex-column p-4 overflow-hidden">
      <div class="card shadow-sm flex-grow-1 d-flex flex-column overflow-hidden">
        <div class="card-header bg-body-tertiary border-bottom">
          <div class="d-flex align-items-center gap-2">
            <button @click="$router.push('/')" class="btn btn-outline-secondary btn-sm">
              ← Назад
            </button>
            <h3 class="mb-0">Настройки семьи</h3>
          </div>
        </div>

        <div class="card-body flex-grow-1 overflow-auto">
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

          <div v-if="activeTab === 'general'" class="card">
            <div class="card-body">
              <ValidationErrorComponent v-if="error" :error="error" class="mb-3" />
              <div class="d-flex gap-3 align-items-end">
                <div class="flex-grow-1">
                  <label class="form-label">Название семьи</label>
                  <input v-model="familyNameModel" type="text" placeholder="Название семьи" class="form-control" />
                </div>
                <button @click="saveFamilyName" :disabled="saving" class="btn btn-secondary">
                  {{ saving ? 'Сохранение...' : 'Сохранить' }}
                </button>
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
                        <div v-for="access in familyStore.accesses" :key="access.accessName" 
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

              <div v-if="rolesLoading" class="text-center py-3">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Загрузка...</span>
                </div>
              </div>

              <div v-else-if="!currentRoles || currentRoles.length === 0" class="text-center py-3">
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
              <button class="btn btn-danger">Покинуть семью</button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import Header from "@/views/header/Header.vue"
import { ValidationError } from "@/error/types/serverErrorResponses"
import ValidationErrorComponent from "@/error/templates/ValidationErrorComponent.vue"
import type { Role } from '@/types/family'
import { apiService } from '@/services/api'
import { ProblemDetail } from '@/error/types/serverErrorResponses'
import useFamilyStore from "@/stores/familyStore.ts"

const route = useRoute()
const familyStore = useFamilyStore()

const activeTab = ref('general')
const familyNameModel = ref('')
const showCreateRoleForm = ref(false)
const editingRole = ref<Role | null>(null)
const error = ref<ValidationError | null>(null)
const saving = ref(false)
const rolesLoading = ref(false)

const familyId = computed(() => route.params.familyId as string)

const currentRoles = computed(() => {
  return familyStore.roles[familyId.value]?.map(r => r.value) || []
})

const newRole = reactive({
  name: '',
  value: 0,
  accessList: [] as string[]
})

const sortedRoles = computed(() => {
  if (!currentRoles.value) return []
  return [...currentRoles.value].sort((a, b) => b.value - a.value)
})

const loadFamilyData = async () => {
  try {
    const family = familyStore.families[familyId.value]
    if (family) {
      familyNameModel.value = family.value.familyName
    } else {
      const familyData = await apiService.get(`family/${familyId.value}`)
      familyNameModel.value = familyData.body.familyName
    }
  } catch (err) {
    console.error('Ошибка загрузки данных семьи:', err)
  }
}

const loadRoles = async () => {
  rolesLoading.value = true
  try {
    const rolesData = await apiService.get(`role/${familyId.value}`)
    const loadedRoles = rolesData.body || []
    familyStore.loadRoles(familyId.value, loadedRoles)
  } catch (err) {
    console.error('Ошибка загрузки ролей:', err)
  } finally {
    rolesLoading.value = false
  }
}

const loadAccesses = async () => {
  if (!familyStore.accesses || familyStore.accesses.length === 0) {
    try {
      const accessesData = await apiService.get('role/accesses')
      familyStore.loadAccesses(accessesData.body || [])
    } catch (err) {
      console.error('Ошибка загрузки доступов:', err)
    }
  }
}

const saveFamilyName = async () => {
  saving.value = true
  error.value = null
  try {
    const result = await apiService.put('family', {
      familyId: familyId.value,
      familyName: familyNameModel.value
    })
    
    const family = familyStore.families[familyId.value]
    if (family) {
      family.value = result.body.family
    }
  } catch (err) {
    if (err instanceof ProblemDetail) {
      error.value = new ValidationError(err)
    } else {
      console.error('Ошибка сохранения названия семьи:', err)
    }
  } finally {
    saving.value = false
  }
}

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

const saveRole = async () => {
  try {
    if (editingRole.value) {
      await apiService.put('role', {
        roleId: editingRole.value.id,
        familyId: familyId.value,
        roleName: newRole.name,
        value: newRole.value,
        accesses: newRole.accessList
      })
    } else {
      await apiService.post('role', {
        familyId: familyId.value,
        roleName: newRole.name,
        value: newRole.value,
        accesses: newRole.accessList
      })
    }
    await loadRoles()
    cancelEdit()
  } catch (err) {
    console.error('Ошибка сохранения роли:', err)
  }
}

const deleteRole = async (role: Role) => {
  try {
    await apiService.delete('role', {
      familyId: familyId.value,
      roleId: role.id
    })
    
    const roles = familyStore.roles[familyId.value]
    if (roles) {
      const index = roles.findIndex(r => r.value.id === role.id)
      if (index !== -1) roles.splice(index, 1)
    }
  } catch (err) {
    console.error('Ошибка удаления роли:', err)
  }
}

onMounted(async () => {
  await loadAccesses()
  await Promise.all([
    loadFamilyData(),
    loadRoles()
  ])
})
</script>