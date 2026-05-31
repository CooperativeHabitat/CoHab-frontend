<script setup lang="ts">
import Header from "@/views/header/Header.vue"
import { LockIcon, ArrowRightIcon } from 'lucide-vue-next'
</script>

<template>
  <Header />
  <main class="auth-container">
    <article>
      <div class="icon">
        <LockIcon :size="32" />
      </div>
      
      <h3>Попросите администратора подтвердить вашу личность</h3>
      
      <p>Для доступа ко всем функциям системы необходимо подтверждение администратора</p>
      
      <a href="#" role="button" class="secondary">
        Как связаться с администратором?
        <ArrowRightIcon :size="16" />
      </a>
    </article>
  </main>
</template>

<style src="@/styles/base.css"></style>

<style scoped>
.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}

.auth-container article {
  max-width: 40rem;
  text-align: center;
  padding: 3rem;
}

.icon {
  display: inline-flex;
  padding: 1rem;
  background: var(--pico-primary-focus);
  border-radius: 50%;
  margin-bottom: 1.5rem;
  color: var(--pico-primary);
}

a[role="button"] {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1.5rem;
}
</style>