<template>
  <div class="card h-100 d-flex flex-column overflow-hidden">
    <div class="card-header d-flex justify-content-between align-items-center">
      <h3 class="mb-0">Чат семьи</h3>
      <button @click="$emit('close')" class="btn-close"></button>
    </div>
    <div class="card-body flex-grow-1 overflow-auto">
      <p class="text-center text-muted py-3">Здесь будут сообщения</p>
    </div>
    <div class="card-footer">
      <div class="input-group">
        <input type="text" class="form-control" placeholder="Введите сообщение..." />
        <button class="btn btn-primary">Отправить</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineEmits<{
  close: []
}>()
</script>