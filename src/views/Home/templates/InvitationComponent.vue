<template>
  <article>
    <header>
      <h3>Приглашение создано</h3>
      <button @click="copyInvitation" class="outline small">
        <CopyIcon :size="14" />
        Копировать
      </button>
    </header>

    <div class="code-block">
      <small>Код приглашения</small>
      <div class="code">
        <UserPlusIcon :size="20" />
        <code>{{ invitationCode }}</code>
      </div>
    </div>

    <div class="details">
      <div class="detail">
        <UsersIcon :size="20" />
        <div>
          <small>Могут присоединиться</small>
          <strong>{{ numMembers }}</strong>
        </div>
      </div>
      <div class="detail">
        <ClockIcon :size="20" />
        <div>
          <small>Действует до</small>
          <strong>{{ expiresAt }}</strong>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { CopyIcon, UserPlusIcon, UsersIcon, ClockIcon } from 'lucide-vue-next'

interface Props {
  invitationCode: string
  numMembers: number
  expiresAt: string
}

const props = defineProps<Props>()

const copyInvitation = async () => {
  await navigator.clipboard.writeText(props.invitationCode)
}
</script>

<style src="@/styles/base.css"></style>

<style scoped>
.code-block {
  margin: 1rem 0;
}

.code {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--pico-card-sectioning-background-color);
  border-radius: 0.5rem;
  margin-top: 0.5rem;
}

code {
  font-size: 1.25rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  color: var(--pico-primary);
}

.details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.detail {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem;
  background: var(--pico-card-sectioning-background-color);
  border-radius: 0.5rem;
}

.detail svg {
  color: var(--pico-primary);
  flex-shrink: 0;
  margin-top: 0.25rem;
}

button.outline {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
</style>