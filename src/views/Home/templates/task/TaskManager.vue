<template>
  <div class="card h-100 d-flex flex-column overflow-hidden">
    <div v-if="tasksLoading" class="d-flex justify-content-center align-items-center flex-grow-1">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Загрузка задач...</span>
      </div>
    </div>
    
    <template v-else>
      <div class="card-header d-flex justify-content-between align-items-center">
        <h2 class="mb-0">Задачи</h2>
        <span class="badge bg-primary">{{ tasks.length }}</span>
      </div>
      
      <div class="card-body flex-grow-1 overflow-auto">
        <div v-if="tasks.length === 0" class="text-center py-5">
          <p>Нет активных задач</p>
        </div>
        <div v-else class="d-flex flex-column gap-3">
          <TaskComponent
            v-for="task in taskRefs"
            :key="task.value.id"
            :task="task"
            :current-user-id="currentUserId"
            @mark-task="(t, v) => $emit('mark-task', t, v)"
            @check-task="(t, v) => $emit('check-task', t, v)"
            @edit-task="(t) => $emit('edit-task', t)"
            @delete-task="(t) => $emit('delete-task', t)"
          />
        </div>
      </div>
      
      <div class="card-footer d-flex gap-2 justify-content-end">
        <button @click="$emit('refresh')" class="btn btn-secondary">Обновить</button>
        <button @click="$emit('add-task')" class="btn btn-primary">Добавить задачу</button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import TaskComponent from './TaskComponent.vue'

const props = defineProps<{
  tasks: any[]
  tasksLoading: boolean
  currentUserId: string
}>()

defineEmits<{
  'mark-task': [task: any, value: boolean]
  'check-task': [task: any, value: boolean]
  'edit-task': [task: any]
  'delete-task': [task: any]
  'refresh': []
  'add-task': []
}>()

const taskRefs = computed(() => props.tasks.map(task => ref(task)))
</script>