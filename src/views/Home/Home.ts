import {computed, onMounted, type Ref, ref, watch} from 'vue'
import {useRouter} from 'vue-router'
import {apiService} from '@/services/api'
import {rsocketService} from '@/services/rsocket'
import Header from "@/views/header/Header.vue"
import type {Family, FamilyMember, Role, Access} from "@/types/family.ts"
import useFamilyStore from "@/stores/familyStore.ts"
import type {Task} from "@/types/task.ts";
import TaskComponent from "@/views/Home/templates/task/TaskComponent.vue";
import EditTaskComponent from "@/views/Home/templates/task/EditTaskComponent.vue";
import type {CreateInvitation} from "@/types/family.ts";
import CreateInvitationComponent from "@/views/Home/templates/CreateInvitationComponent.vue";
import FamilyMemberCard from './templates/member/FamilyMemberCard.vue'
import { Splitpanes, Pane } from 'splitpanes'
import ChatComponent from './templates/ChatComponent.vue'
import 'splitpanes/dist/splitpanes.css'
import TaskManager from './templates/task/TaskManager.vue'
import MembersPanel from './templates/member/MembersPanel.vue'
import { ValidationError } from '@/error/types/serverErrorResponses.ts'
import { ProblemDetail } from '@/error/types/serverErrorResponses.ts'

export default {
  name: 'HomeView',
  components: {CreateInvitationComponent, EditTaskComponent, Header, TaskComponent, FamilyMemberCard, Splitpanes, Pane, ChatComponent, MembersPanel, TaskManager},
  setup() {
    const router = useRouter()
    const homeLoading = ref(false)
    const familyMembersLoading = ref(false)
    const tasksLoading = ref(false)
    const showEditTaskComponent = ref(false)
    const showCreateInvitationComponent = ref(false)
    const showCreateFamilyForm = ref(false)
    const showJoinFamilyForm = ref(false)
    const newFamilyName = ref('')
    const joinFamilyCode = ref('')
    const creatingFamily = ref(false)
    const joiningFamily = ref(false)
    const userHasFamily = ref(true)
    const activeFamilyTab = computed(() => familyStore.activeFamilyTab)

    const familyMembers = ref<Ref<FamilyMember>[]>([])
    const currentTasks = computed(() => {
      const tab = activeFamilyTab.value
      return tab ? familyStore.tasks[tab] || [] : []
    })
    const familyStore = useFamilyStore()

    const families = computed(() => familyStore.families)

    const formatDate = (dateString: string): string => {
      if (!dateString) return 'Не указана'
      const date = new Date(dateString)
      return date.toLocaleDateString('ru-RU')
    }

    const showError = (message: string) => {
      console.log(`Ошибка: ${message}`)
    }

    const checkHasFamily = async (): Promise<void> => {
      userHasFamily.value = Object.keys(families.value).length > 0
    }

    const loadFamilies = async (): Promise<void> => {
      homeLoading.value = true
      try {
        if (!familyStore.familiesLoaded) {
          const familiesLoad: FamilyMember[] = (await apiService.get('member/families')).body || []
          familyStore.loadFamilies(familiesLoad)
        }
      } catch (error) {
        console.log(error)
        showError('Ошибка загрузки семей')
      } finally {
        homeLoading.value = false
      }
    }

    const loadTasks = async (familyId: string, force: boolean): Promise<void> => {
      if(!familyId) return
      tasksLoading.value = true
      try {
        if(!familyStore.tasks[familyId] || force) {
          const tasksLoad: Task[] = (await apiService.get('task/' + familyId)).body || []
          familyStore.loadTasks(tasksLoad, familyId)
        }
      } catch (error) {
        console.log(error)
        showError('Ошибка загрузки задач')
      } finally {
        tasksLoading.value = false
      }
    }

    const loadMembers = async (familyId: string, force: boolean): Promise<void> => {
      if (!familyId) return
      familyMembersLoading.value = true
      try {
        if (!familyStore.members[familyId] || force) {
          const members: FamilyMember[] = (await apiService.get('family/' + familyId + '/members')).body || []
          familyStore.loadMembers(members)
        }
        familyMembers.value = familyStore.members[familyId] || []
      } catch (error) {
        console.log(error)
        showError('Ошибка загрузки членов семьи')
      } finally {
        familyMembersLoading.value = false
      }
    }

    const loadRoles = async (familyId: string, force: boolean) : Promise<void> => {
      if (!familyId) return
      try {
        if(!familyStore.roles[familyId] || force) {
          const roles : Role[] = (await apiService.get('role/' + familyId)).body || []
          familyStore.loadRoles(familyId, roles)
        } 
      } catch (error) {
        console.log(error)
        showError('Ошибка загрузки ролей')
      }
    }

    const navigateToFamilySettings = () => {
      if (activeFamilyTab.value) {
        router.push(`/home/family/${activeFamilyTab.value}/settings`)
      }
    }

    const handleCreateFamily = async (): Promise<void> => {
      creatingFamily.value = true
      try {
        const familyMember: FamilyMember = (await apiService.post('family/create', {familyName: newFamilyName.value})).body
        familyStore.addFamily(familyMember)
        familyStore.activeFamilyTab = familyMember.id
      } catch (error) {
        console.log(error)
        showError('Ошибка создания семьи')
      } finally {
        creatingFamily.value = false
      }
    }

    const handleMarkTask = async (task: Ref<Task>, newMarked: boolean): Promise<void> => {
      try{
        await apiService.post(`task/mark-check`, {taskId: task.value.id, taskMarked: newMarked})
        task.value.isMarked = newMarked
      }catch(error : any){
        console.log(error)
        showError(error.message)
      }
    }

    const handleCheckTask = async (task: Ref<Task>, newChecked: boolean): Promise<void> => {
      try{
        await apiService.post(`task/mark-check`, {taskId: task.value.id, taskChecked: newChecked})
        task.value.isChecked = newChecked
      }
      catch(error : any){
        console.log(error)
        showError(error.message)
      }
    }

    const handleCloseTaskForm = async (): Promise<void> => {
        showEditTaskComponent.value = false
        familyStore.editTask = null
    }

    const handleDeleteTask = async (task: Ref<Task>): Promise<void> => {
      try{
        await apiService.delete(`task`, {taskId: task.value.id, familyId: activeFamilyTab.value})
        familyStore.deleteTask(task.value)
      }catch (error: any){
        console.log(error)
        showError(error.message)
      }
    }

    const handleEditTaskPress = async (task: Ref<Task>): Promise<void> => {
      showEditTaskComponent.value = true;
      familyStore.editTask = task.value
    }

    const handleJoinFamily = async (): Promise<void> => {
      joiningFamily.value = true
      try {
        const familyMember = (await apiService.post(`family/use-invitation`, {code: joinFamilyCode.value} )).body
        familyStore.addFamily(familyMember)
        familyStore.activeFamilyTab = familyMember.id
      }
      catch(error: any){
        console.log(error)
        showError(error.message)
      }
      finally {
        joiningFamily.value = false
      }
    }

    const handleOpenInvitationForm = async (): Promise<void> => {
      showCreateInvitationComponent.value = true;
    }

    const handleCloseInvitationForm = async (): Promise<void> => {
      showCreateInvitationComponent.value = false;
    }

    const showAddTaskForm = (): void => {
      showEditTaskComponent.value = true
    }
    
    const handleAssignRole = async (data: { familyId: string; familyMemberId: string; roleName: string }) => {
      try {
        const updatedMember = (await apiService.post('role/attach', {
          familyId: data.familyId,
          familyMemberId: data.familyMemberId,
          roleName: data.roleName
        })).body
        
        const memberIndex = familyMembers.value.findIndex(m => m.value.id === data.familyMemberId)
        const member = familyMembers.value[memberIndex]
        if (memberIndex !== -1 && member) {
          member.value = updatedMember
        }
      } catch (error) {
        console.log(error)
        showError('Ошибка назначения роли')
      }
    }

    const handleDetachRole = async (data: { familyId: string; familyMemberId: string; roleName: string }) => {
      try {
        const updatedMember = (await apiService.post('role/detach', {
          familyId: data.familyId,
          familyMemberId: data.familyMemberId,
          roleName: data.roleName
        })).body
        
        const memberIndex = familyMembers.value.findIndex(m => m.value.id === data.familyMemberId)
        const member = familyMembers.value[memberIndex]
        if (memberIndex !== -1 && member) {
          member.value = updatedMember
        }
      } catch (error) {
        console.log(error)
        showError('Ошибка снятия роли')
      }
    }

    // Chat методы через RSocket
    const handleSendMessage = async (content: string, replyToId?: string) => {
      if (!activeFamilyTab.value) return
      try {
        await rsocketService.fireAndForget('api.family.chat.send', {
          familyId: activeFamilyTab.value,
          content: content,
          replyToId: replyToId || null
        })
      } catch (error) {
        console.log(error)
        showError('Ошибка отправки сообщения')
      }
    }

    const handleEditMessage = async (messageId: string, content: string) => {
      if (!activeFamilyTab.value) return
      try {
        await rsocketService.fireAndForget('api.family.chat.edit', {
          familyId: activeFamilyTab.value,
          messageId: messageId,
          content: content
        })
      } catch (error) {
        console.log(error)
        showError('Ошибка редактирования сообщения')
      }
    }

    const handleDeleteMessage = async (messageId: string) => {
      if (!activeFamilyTab.value) return
      try {
        await rsocketService.fireAndForget('api.family.chat.delete', {
          familyId: activeFamilyTab.value,
          messageId: messageId
        })
      } catch (error) {
        console.log(error)
        showError('Ошибка удаления сообщения')
      }
    }

    const handleViewMessage = async (messageId: string) => {
      if (!activeFamilyTab.value) return
      try {
        await rsocketService.fireAndForget('api.family.chat.view', {
          familyId: activeFamilyTab.value,
          messageId: messageId
        })
      } catch (error) {
        console.log(error)
        showError('Ошибка отметки просмотра сообщения')
      }
    }

    const handleReactMessage = async (messageId: string, reaction: string) => {
      if (!activeFamilyTab.value) return
      try {
        await rsocketService.fireAndForget('api.family.chat.react', {
          familyId: activeFamilyTab.value,
          messageId: messageId,
          reaction: reaction
        })
      } catch (error) {
        console.log(error)
        showError('Ошибка реакции на сообщение')
      }
    }

    const connectToChatStream = (onMessage: (message: any) => void) => {
      if (!activeFamilyTab.value) return null
      
      let subscription: any = null
      
      rsocketService.requestStream(`api.family.chat.${activeFamilyTab.value}.stream`).then(observable => {
        subscription = observable.subscribe({
          next: (response: any) => {
            onMessage(response)
          },
          error: (error: any) => {
            console.error('Chat stream error:', error)
          }
        })
      }).catch(error => {
        console.error('Failed to connect to chat stream:', error)
      })
      
      return subscription
    }

    const loadChatHistory = async (page: number = 0, size: number = 20) => {
      if (!activeFamilyTab.value) return []
      try {
        const messages = await rsocketService.requestStream(
          `api.family.messages.${activeFamilyTab.value}`,
          {
            page: page,
            size: size,
            startDate: null,
            endDate: null
          }
        )
        
        const result: any[] = []
        await new Promise((resolve, reject) => {
          messages.subscribe({
            next: (message: any) => result.push(message),
            error: (error: any) => reject(error),
            complete: () => resolve(result)
          })
        })
        
        return result
      } catch (error) {
        console.log(error)
        showError('Ошибка загрузки истории сообщений')
        return []
      }
    }

    watch(activeFamilyTab, async (newTab) => {
      if (newTab) {
        await loadMembers(newTab, false)
        await loadTasks(newTab, false)
        await loadRoles(newTab, false)
      }
    })

    onMounted(async () => {
      await loadFamilies()
      await checkHasFamily()

      if (userHasFamily.value && Object.keys(families.value).length > 0) {
        familyStore.activeFamilyTab = Object.keys(families.value)[0]
      }
    })

    return {
      homeLoading,
      familyMembersLoading,
      tasksLoading,
      showEditTaskComponent,
      showCreateInvitationComponent,
      showCreateFamilyForm,
      showJoinFamilyForm,
      newFamilyName,
      joinFamilyCode,
      creatingFamily,
      joiningFamily,
      userHasFamily,
      activeFamilyTab,
      familyMembers,
      currentTasks,
      families,
      familyStore,
      formatDate,
      showError,
      loadTasks,
      loadMembers,
      handleCreateFamily,
      showAddTaskForm,
      handleMarkTask,
      handleCheckTask,
      handleDeleteTask,
      handleEditTaskPress,
      handleCloseTaskForm,
      handleJoinFamily,
      handleCloseInvitationForm,
      handleOpenInvitationForm,
      handleAssignRole,    
      handleDetachRole,
      navigateToFamilySettings,
      // Chat methods
      handleSendMessage,
      handleEditMessage,
      handleDeleteMessage,
      handleViewMessage,
      handleReactMessage,
      connectToChatStream,
      loadChatHistory
    }
  }
}