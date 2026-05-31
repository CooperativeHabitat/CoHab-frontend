<script setup lang="ts">
import ValidationErrorComponent from "@/error/templates/ValidationErrorComponent.vue"
import { computed, ref } from "vue"
import useFamilyStore from "@/stores/familyStore.ts"
import type { CreateInvitation, Invitation } from "@/types/family.ts"
import { apiService } from "@/services/api.ts"
import { ProblemDetail, ValidationError } from "@/error/types/serverErrorResponses"
import InvitationComponent from "@/views/Home/templates/InvitationComponent.vue"
import { XIcon } from 'lucide-vue-next'

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

<template>
  <dialog open @click.self="emit('close-invitation')">
    <article>
      <header>
        <h2>Создание приглашения</h2>
        <button @click="emit('close-invitation')" class="close">
          <XIcon :size="20" />
        </button>
      </header>

      <div v-if="hasErrors" class="error">
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
        <label>
          Количество участников
          <input v-model="form.numMembers" type="number" min="1" placeholder="Введите количество" />
        </label>

        <label>
          Срок действия
          <input v-model="form.expiresAt" type="datetime-local" />
        </label>
      </div>

      <footer>
        <button @click="emit('close-invitation')" class="secondary">Отмена</button>
        
        <button v-if="!showInvitation" @click="createInvitationFunc"
                :disabled="isSaving || form.numMembers <= 0 || !form.expiresAt"
                :aria-busy="isSaving">
          {{ isSaving ? 'Создание...' : 'Создать' }}
        </button>

        <button v-if="showInvitation" @click="emit('close-invitation')">Готово</button>
      </footer>
    </article>
  </dialog>
</template>