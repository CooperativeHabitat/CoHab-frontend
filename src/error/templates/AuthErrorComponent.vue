<template>
  <div v-if="error" class="d-flex align-items-start">
    <i class="bi bi-exclamation-circle flex-shrink-0 me-2 text-danger" style="font-size: 1.25rem; margin-top: 0.125rem;"></i>
    <div>
      <h6 class="text-danger fw-medium">{{ error.title }}</h6>
      <p class="text-danger small mb-0">{{ error.detail }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ProblemDetail } from "@/error/types/serverErrorResponses"

defineProps<{
  error: ProblemDetail | null
}>()
</script>