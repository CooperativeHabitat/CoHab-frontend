<template>
  <div class="card h-100 d-flex flex-column overflow-hidden">
    <div class="card-header bg-body-tertiary border-bottom">
      <h5 class="mb-0">
        <i class="bi bi-chat-dots-fill me-2"></i>Чат семьи
      </h5>
    </div>
    <div class="card-body flex-grow-1 overflow-auto p-3" ref="chatBody">
      <div v-if="!messages || messages.length === 0" class="text-center text-muted py-5">
        <i class="bi bi-chat-dots display-1 text-primary opacity-25"></i>
        <p class="mt-3 fs-5">Сообщений пока нет</p>
        <p class="text-muted small">Будьте первым, кто напишет в чат!</p>
      </div>
      <div v-else v-for="message in messages" :key="message.messageId" class="mb-3">
        <div :class="['d-flex', isCurrentUser(message.memberId) ? 'justify-content-end' : 'justify-content-start']">
          <div class="w-75">
            <div :class="[
              'p-3',
              isCurrentUser(message.memberId) 
                ? 'bg-primary text-white ms-auto rounded-3' 
                : 'bg-body-tertiary rounded-3'
            ]">
              <div class="d-flex justify-content-between align-items-center mb-1">
                <strong :class="isCurrentUser(message.memberId) ? 'text-white' : 'text-primary'">
                  <i class="bi bi-person-circle me-1"></i>
                  {{ getMemberName(message.memberId) }}
                </strong>
                <small :class="isCurrentUser(message.memberId) ? 'text-white-50' : 'text-muted'">
                  <i class="bi bi-clock me-1"></i>{{ formatDate(message.sentAt) }}
                </small>
              </div>
              <p class="mb-1">{{ message.content }}</p>
              <div v-if="message.reactions && message.reactions.length" class="d-flex gap-1 mt-2">
                <span 
                  v-for="reaction in message.reactions" 
                  :key="reaction.emoji" 
                  class="badge bg-white text-dark"
                >
                  {{ reaction.emoji }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="card-footer bg-body-tertiary border-top">
      <div class="input-group">
        <input 
          v-model="newMessage" 
          type="text" 
          class="form-control" 
          placeholder="Введите сообщение..." 
          @keyup.enter="sendMessage"
        />
        <button @click="sendMessage" :disabled="!newMessage.trim()" class="btn btn-primary d-flex align-items-center gap-1">
          <i class="bi bi-send-fill"></i>
          Отправить
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
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
const chatBody = ref<HTMLElement>()
let subscription: any = null

const activeFamilyTab = computed(() => familyStore.activeFamilyTab)
const messages = computed(() => {
  const tab = activeFamilyTab.value
  return tab ? familyStore.messages[tab] || [] : []
})

const scrollToBottom = () => {
  nextTick(() => {
    if (chatBody.value) {
      chatBody.value.scrollTop = chatBody.value.scrollHeight
    }
  })
}


const isCurrentUser = (memberId: string) => {
  const activeFamilyId = familyStore.activeFamilyTab
  if (!activeFamilyId) return false
  
  const profile = familyStore.profiles[activeFamilyId] as any
  
  if (!profile?.member?.id) return false
  
  return profile.member.id === memberId
}

const getMemberName = (memberId: string) => {
  const memberInfo = familyStore.membersInfo[memberId]
  if (!memberInfo) return 'Неизвестный енот'
  const firstName = memberInfo.firstname || 'Неизвестный'
  const lastName = memberInfo.lastname || 'енот'
  return `${firstName} ${lastName}`
}

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
    scrollToBottom()
  } catch (error) {
    console.error('Ошибка отправки сообщения:', error)
  }
}

const loadChatHistory = async (page: number = 0, size: number = 20) => {
  if (!activeFamilyTab.value) return
  
  try {
    const now = new Date()
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    
    const request: MessageRequest = {
      page,
      size,
      startDate: yesterday.toISOString(),
      endDate: now.toISOString()
    }
    
    const response = await rsocketService.requestResponse(
      `api.family.messages.${activeFamilyTab.value}`,
      request
    )
    
    const result: MessageDto[] = Array.isArray(response) ? response : [response]
    familyStore.loadMessages(activeFamilyTab.value!, result.reverse())
    scrollToBottom()
    
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
          scrollToBottom()
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

watch(activeFamilyTab, async (newTab) => {
    if (newTab) {
      await loadChatHistory()
      connectToChatStream()
    }
  })

watch(messages, () => {
  scrollToBottom()
}, { deep: true })

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