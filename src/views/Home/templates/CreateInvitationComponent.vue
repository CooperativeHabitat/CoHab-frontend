<script setup lang="ts">
import ValidationErrorComponent from "@/error/templates/ValidationErrorComponent.vue";
import { computed, ref } from "vue";
import useFamilyStore from "@/stores/familyStore.ts";
import type { CreateInvitation, Invitation } from "@/types/family.ts";
import { apiService } from "@/services/api.ts";
import { ProblemDetail, ValidationError } from "@/error/types/serverErrorResponses";
import InvitationComponent from "@/views/Home/templates/InvitationComponent.vue";

const emit = defineEmits<{
  'close-invitation': []
}>();

const form = ref({
  numMembers: 0,
  expiresAt: new Date(),
});

const invitation = ref<Invitation | null>(null);
const showInvitation = ref<boolean>(false);
const isSaving = ref<boolean>(false);
const familyStore = useFamilyStore();

const errorState = ref<{ validationError: ValidationError | null }>({
  validationError: null
});

const hasErrors = computed(() => {
  return errorState.value.validationError !== null;
});

const formatDateTimeLocal = (date: Date | string): string => {
  if (!date) return ''
  const d = new Date(date)
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}

const createInvitationFunc = async (): Promise<void> => {
  try {
    isSaving.value = true;
    errorState.value.validationError = null;

    const createInvitation: CreateInvitation = {
      familyId: familyStore.activeFamilyTab || '',
      numMembers: form.value.numMembers,
      expiresAt: form.value.expiresAt
    };
    invitation.value = (await apiService.post("family/create-invitation", createInvitation)).body;
    showInvitation.value = true;
  } catch (error) {
    if(error instanceof ProblemDetail){
      errorState.value.validationError = new ValidationError(error)
    }
    console.error('Ошибка создания приглашения:', error);
  } finally {
    isSaving.value = false;
  }

};
</script>

<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
       @click.self="emit('close-invitation')">
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
      <!-- Заголовок -->
      <div class="bg-blue-500 text-white p-6">
        <div class="flex items-center justify-between">
          <h2 class="text-2xl font-bold">
            Создание приглашения
          </h2>
          <button @click="emit('close-invitation')" class="text-white hover:text-blue-100">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div v-if="hasErrors" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
        <ValidationErrorComponent :error="errorState.validationError" />
      </div>

      <div v-if="showInvitation && invitation" class="p-6">
        <InvitationComponent
            :invitation-code="invitation.invitationCode"
            :num-members="invitation.numMembers"
            :expires-at="formatDateTimeLocal(invitation.expiresAt)"
        />
      </div>

      <!-- Форма -->
      <div v-if="!showInvitation" class="p-6 overflow-y-auto max-h-[70vh]">
        <div class="space-y-6">
          <!-- Количество участников -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Количество участников
            </label>
            <input
                v-model="form.numMembers"
                type="number"
                min="1"
                class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                placeholder="Введите количество"
            />
          </div>

          <!-- Срок действия -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Срок действия
            </label>
            <input
                v-model="form.expiresAt"
                type="datetime-local"
                class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
            />
          </div>
        </div>
      </div>

      <!-- Кнопки -->
      <div class="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end space-x-4">
        <button
            @click="emit('close-invitation')"
            class="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
        >
          Отмена
        </button>

        <button
            v-if="!showInvitation"
            @click="createInvitationFunc"
            :disabled="isSaving || form.numMembers <= 0 || !form.expiresAt"
            class="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <span v-if="isSaving" class="flex items-center">
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Создание кода...
          </span>
          <span v-else>Создать</span>
        </button>

        <button
            v-if="showInvitation"
            @click="emit('close-invitation')"
            class="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
        >
          Готово
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>