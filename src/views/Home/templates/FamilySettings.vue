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

    <div v-if="activeTab === 'general'" class="card">
      <div class="card-body d-flex flex-column gap-3">
        <div>
          <label class="form-label">Название семьи</label>
          <input type="text" :value="familyName" placeholder="Название семьи" class="form-control" />
        </div>
        <button class="btn btn-secondary">Сохранить</button>
      </div>
    </div>

    <div v-if="activeTab === 'roles'" class="card">
      <div class="card-body">
        <p class="text-muted">Управление ролями участников</p>
        <div class="d-flex flex-column gap-2">
          <div class="d-flex justify-content-between align-items-center p-2 border rounded">
            <div>
              <strong>Администратор</strong>
              <p class="mb-0 small text-muted">Полный доступ</p>
            </div>
            <span class="badge bg-primary">1 участник</span>
          </div>
          <div class="d-flex justify-content-between align-items-center p-2 border rounded">
            <div>
              <strong>Модератор</strong>
              <p class="mb-0 small text-muted">Управление задачами</p>
            </div>
            <span class="badge bg-secondary">0 участников</span>
          </div>
          <div class="d-flex justify-content-between align-items-center p-2 border rounded">
            <div>
              <strong>Участник</strong>
              <p class="mb-0 small text-muted">Базовый доступ</p>
            </div>
            <span class="badge bg-secondary">2 участника</span>
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
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  familyName?: string
}>()

defineEmits<{
  back: []
}>()

const activeTab = ref('general')
</script>