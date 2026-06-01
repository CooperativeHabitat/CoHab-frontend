<template>
  <div v-if="error" class="d-flex align-items-start">
    <i class="bi bi-exclamation-circle flex-shrink-0 me-2 text-danger" style="font-size: 1.25rem; margin-top: 0.125rem;"></i>
    <div>
      <h6 class="text-danger fw-medium">{{ error.detail }}</h6>
      <div v-for="fieldError in error.fieldErrors" :key="fieldError.field">
        <p class="text-danger small mb-1">Ошибка в поле {{ fieldError.field }}: {{ fieldError.defaultMessage }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ValidationError } from "@/error/types/serverErrorResponses"

defineProps<{
  error: ValidationError | null
}>()
</script>