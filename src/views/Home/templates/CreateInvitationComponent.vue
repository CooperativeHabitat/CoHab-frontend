<template>
  <div class="modal d-block" tabindex="-1" style="background: rgba(0,0,0,0.5); backdrop-filter: blur(4px);" @click.self="emit('close-invitation')">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Создание приглашения</h5>
          <button @click="emit('close-invitation')" class="btn-close"></button>
        </div>

        <div class="modal-body">
          <div v-if="hasErrors" class="alert alert-danger">
            <ValidationErrorComponent :error="errorState.validationError" />
          </div>

          <div v-if="showInvitation && invitation">
            <InvitationComponent
              :invitation-code="invitation.invitationCode"
              :num-members="invitation.numMembers"
              :expires-at="formatDateTimeLocal(invitation.expiresAt)"
            />
          </div>

          <div v-if="!showInvitation">
            <div class="mb-3">
              <label class="form-label">Количество участников</label>
              <input v-model="form.numMembers" type="number" min="1" class="form-control" placeholder="Введите количество" />
            </div>

            <div class="mb-3">
              <label class="form-label">Срок действия</label>
              <input v-model="form.expiresAt" type="datetime-local" class="form-control" />
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="emit('close-invitation')" class="btn btn-secondary">Отмена</button>
          
          <button v-if="!showInvitation" @click="createInvitationFunc"
                  :disabled="isSaving || form.numMembers <= 0 || !form.expiresAt"
                  class="btn btn-primary">
            <span v-if="isSaving" class="spinner-border spinner-border-sm me-1"></span>
            {{ isSaving ? 'Создание...' : 'Создать' }}
          </button>

          <button v-if="showInvitation" @click="emit('close-invitation')" class="btn btn-success">Готово</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ValidationErrorComponent from "@/error/templates/ValidationErrorComponent.vue"
import { computed, ref } from "vue"
import useFamilyStore from "@/stores/familyStore.ts"
import type { CreateInvitation, Invitation } from "@/types/family.ts"
import { apiService } from "@/services/api.ts"
import { ProblemDetail, ValidationError } from "@/error/types/serverErrorResponses"
import InvitationComponent from "@/views/Home/templates/InvitationComponent.vue"

const emit = defineEmits<{ 'close-invitation': [] }>()

const form = ref({ numMembers: 0, expiresAt: new Date() })
const invitation = ref<Invitation | null>(null)
const showInvitation = ref(false)
const isSaving = ref(false)
const familyStore = useFamilyStore()

const errorState = ref<{ validationError: ValidationError | null }>({ validationError: null })
const hasErrors = computed(() => errorState.value.validationError !== null)

const formatDateTimeLocal = (date: Date | string): string => {
  if (!date) return ''
  const d = new Date(date)
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}

const createInvitationFunc = async (): Promise<void> => {
  try {
    isSaving.value = true
    errorState.value.validationError = null
    const body: CreateInvitation = {
      familyId: familyStore.activeFamilyTab || '',
      numMembers: form.value.numMembers,
      expiresAt: form.value.expiresAt
    }
    invitation.value = (await apiService.post("family/create-invitation", body)).body
    showInvitation.value = true
  } catch (error) {
    if(error instanceof ProblemDetail) errorState.value.validationError = new ValidationError(error)
  } finally {
    isSaving.value = false
  }
}
</script>