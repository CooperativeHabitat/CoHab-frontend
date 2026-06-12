<template>
  <div class="card h-100 d-flex flex-column overflow-hidden">
    <div class="card-header">
      <h3 class="mb-0">Чат семьи</h3>
    </div>
    <div class="card-body flex-grow-1 overflow-auto">
      <div v-if="!messages || messages.length === 0" class="text-center text-muted py-3">
        Сообщений пока нет
      </div>
      <div v-else v-for="message in messages" :key="message.messageId" class="mb-2">
        <div class="d-flex justify-content-between">
          <strong>{{ message.memberId || 'Участник' }}</strong>
          <small class="text-muted">{{ formatDate(message.sentAt) }}</small>
        </div>
        <p class="mb-1">{{ message.content }}</p>
        <div v-if="message.reactions && message.reactions.length" class="d-flex gap-1">
          <span v-for="reaction in message.reactions" :key="reaction.emoji" class="badge bg-light text-dark">
            {{ reaction.emoji }}
          </span>
        </div>
      </div>
    </div>
    <div class="card-footer">
      <div class="input-group">
        <input 
          v-model="newMessage" 
          type="text" 
          class="form-control" 
          placeholder="Введите сообщение..." 
          @keyup.enter="sendMessage"
        />
        <button @click="sendMessage" :disabled="!newMessage.trim()" class="btn btn-primary">
          Отправить
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import useFamilyStore from '@/stores/familyStore'
import { rsocketService } from '@/services/rsocket'
import { 
  type CreateMessageRequest, 
  type EditMessageRequest, 
  type DeleteMessageRequest, 
  type ReactMessageRequest, 
  type ViewMessageRequest,
  type MessageRequest,
  type ChatResponse,
  type MessageDto,
  ChatOperationType
} from '@/types/chat'

const familyStore = useFamilyStore()
const newMessage = ref('')
let subscription: any = null

const activeFamilyTab = computed(() => familyStore.activeFamilyTab)
const messages = computed(() => {
  const tab = activeFamilyTab.value
  return tab ? familyStore.messages[tab] || [] : []
})

const sendMessage = async () => {
  if (!newMessage.value.trim() || !activeFamilyTab.value) return
  
  try {
    const request: CreateMessageRequest = {
      content: newMessage.value.trim(),
      familyId: activeFamilyTab.value,
      replyToId: null
    }
    await rsocketService.fireAndForget('api.family.chat.send', request)
    newMessage.value = ''
  } catch (error) {
    console.error('Ошибка отправки сообщения:', error)
  }
}

const editMessage = async (messageId: string, content: string) => {
  if (!activeFamilyTab.value) return
  
  try {
    const request: EditMessageRequest = {
      familyId: activeFamilyTab.value,
      messageId,
      content
    }
    await rsocketService.fireAndForget('api.family.chat.edit', request)
    familyStore.updateMessage(activeFamilyTab.value, messageId, content)
  } catch (error) {
    console.error('Ошибка редактирования сообщения:', error)
  }
}

const deleteMessage = async (messageId: string) => {
  if (!activeFamilyTab.value) return
  
  try {
    const request: DeleteMessageRequest = {
      familyId: activeFamilyTab.value,
      messageId
    }
    await rsocketService.fireAndForget('api.family.chat.delete', request)
    familyStore.removeMessage(activeFamilyTab.value, messageId)
  } catch (error) {
    console.error('Ошибка удаления сообщения:', error)
  }
}

const viewMessage = async (messageId: string) => {
  if (!activeFamilyTab.value) return
  
  try {
    const request: ViewMessageRequest = {
      familyId: activeFamilyTab.value,
      messageId
    }
    await rsocketService.fireAndForget('api.family.chat.view', request)
  } catch (error) {
    console.error('Ошибка отметки просмотра:', error)
  }
}

const reactMessage = async (messageId: string, reaction: string) => {
  if (!activeFamilyTab.value) return
  
  try {
    const request: ReactMessageRequest = {
      familyId: activeFamilyTab.value,
      messageId,
      reaction
    }
    await rsocketService.fireAndForget('api.family.chat.react', request)
    familyStore.addReaction(activeFamilyTab.value, messageId, reaction)
  } catch (error) {
    console.error('Ошибка реакции:', error)
  }
}

const loadChatHistory = async (page: number = 0, size: number = 20) => {
  if (!activeFamilyTab.value) return
  
  try {
    const request: MessageRequest = {
      page,
      size,
      startDate: null,
      endDate: null
    }
    
    
    const response = await rsocketService.requestResponse(
      `api.family.messages.${activeFamilyTab.value}`,
      request
    )
    
    // response уже содержит список сообщений
    const result: MessageDto[] = Array.isArray(response) ? response : [response]
    familyStore.loadMessages(activeFamilyTab.value!, result)
    
  } catch (error) {
    console.error('Ошибка загрузки истории:', error)
  }
}

const connectToChatStream = () => {
  if (!activeFamilyTab.value) return
  
  rsocketService.requestStream(`api.family.chat.${activeFamilyTab.value}.stream`).then(observable => {
    subscription = observable.subscribe({
      next: (response: ChatResponse) => {
        if (response.operationType === ChatOperationType.NEW_MESSAGE) {
          familyStore.addMessage(response.familyId, {
            memberId: response.memberId,
            messageId: response.messageId,
            content: response.content,
            replyToId: null,
            reactions: response.reactions,
            reads: response.reads,
            sentAt: response.sentAt,
            updatedAt: response.updatedAt
          })
        }
      },
      error: (error: any) => {
        console.error('Chat stream error:', error)
      }
    })
  }).catch(error => {
    console.error('Failed to connect to chat stream:', error)
  })
}

const formatDate = (dateString: string): string => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
}

onMounted(async () => {
  await loadChatHistory()
  connectToChatStream()
})

onUnmounted(() => {
  if (subscription) {
    subscription.unsubscribe()
  }
})
</script>