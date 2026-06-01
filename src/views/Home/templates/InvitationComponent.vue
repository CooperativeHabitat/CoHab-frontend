<template>
  <div class="card">
    <div class="card-header d-flex justify-content-between align-items-center">
      <h5 class="mb-0">Приглашение создано</h5>
      <button @click="copyInvitation" class="btn btn-outline-primary btn-sm d-flex align-items-center gap-1">
        <CopyIcon :size="14" />
        Копировать
      </button>
    </div>

    <div class="card-body">
      <div class="mb-3">
        <small class="text-muted">Код приглашения</small>
        <div class="d-flex align-items-center gap-3 p-3 bg-body-tertiary rounded-3 mt-1">
          <UserPlusIcon :size="20" class="text-primary" />
          <code class="fs-5 fw-bold text-primary">{{ invitationCode }}</code>
        </div>
      </div>

      <div class="row g-3">
        <div class="col-6">
          <div class="d-flex align-items-start gap-3 p-3 bg-body-tertiary rounded-3">
            <UsersIcon :size="20" class="text-primary flex-shrink-0 mt-1" />
            <div>
              <small class="text-muted">Могут присоединиться</small>
              <strong class="d-block">{{ numMembers }}</strong>
            </div>
          </div>
        </div>
        <div class="col-6">
          <div class="d-flex align-items-start gap-3 p-3 bg-body-tertiary rounded-3">
            <ClockIcon :size="20" class="text-primary flex-shrink-0 mt-1" />
            <div>
              <small class="text-muted">Действует до</small>
              <strong class="d-block">{{ expiresAt }}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
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