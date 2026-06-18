import {computed, onMounted, onUnmounted, type Ref, ref, watch} from 'vue'
import {useRouter} from 'vue-router'
import {apiService} from '@/services/api'
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
    const familyStore = useFamilyStore()
    
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
    const mobileTab = ref<'tasks' | 'members' | 'chat'>('tasks')
    const isMobileView = ref(false)
    const selectedFamilyId = ref('')

    const activeFamilyTab = computed(() => familyStore.activeFamilyTab)

    const familyMembers = computed(() => {
      const tab = activeFamilyTab.value
      return tab ? familyStore.members[tab] || [] : []
    })

    const currentTasks = computed(() => {
      const tab = activeFamilyTab.value
      return tab ? familyStore.tasks[tab] || [] : []
    })

    const families = computed(() => familyStore.families)

    const formatDate = (dateString: string): string => {
      if (!dateString) return 'Не указана'
      const date = new Date(dateString)
      return date.toLocaleDateString('ru-RU')
    }

    const showError = (message: string) => {
      console.error(`Ошибка: ${message}`)
    }

    const checkHasFamily = () => {
      userHasFamily.value = Object.keys(families.value).length > 0
    }

    const checkMobileView = () => {
      isMobileView.value = window.innerWidth < 768
    }

    const onFamilySelect = (event: Event) => {
      const select = event.target as HTMLSelectElement
      familyStore.activeFamilyTab = select.value || undefined
    }

    const loadFamilies = async (): Promise<void> => {
      homeLoading.value = true
      try {
        if (!familyStore.familiesLoaded) {
          const familiesLoad: FamilyMember[] = (await apiService.get('member/families')).body || []
          familyStore.loadFamilies(familiesLoad)
        }
      } catch (error) {
        console.error(error)
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
        console.error(error)
        showError('Ошибка загрузки задач')
      } finally {
        tasksLoading.value = false
      }
    }

    const loadMembers = async (familyId: string, force: boolean): Promise<void> => {
      if (!familyId) return
      familyMembersLoading.value = true
      try {
        if (!familyStore.members[familyId] || familyStore.members[familyId].length === 0 || force) {
          const members: FamilyMember[] = (await apiService.get('family/' + familyId + '/members')).body || []
          familyStore.loadMembers(members)
        }
      } catch (error) {
        console.error(error)
        showError('Ошибка загрузки членов семьи')
      } finally {
        familyMembersLoading.value = false
      }
    }

    const loadRoles = async (familyId: string, force: boolean): Promise<void> => {
      if (!familyId) return
      try {
        if(!familyStore.roles[familyId] || familyStore.roles[familyId].length === 0 || force) {
          const roles: Role[] = (await apiService.get('role/' + familyId)).body || []
          familyStore.loadRoles(familyId, roles)
        } 
      } catch (error) {
        console.error(error)
        showError('Ошибка загрузки ролей')
      }
    }

    const navigateToFamilySettings = () => {
      if (activeFamilyTab.value) {
        router.push(`/home/family/${activeFamilyTab.value}/settings`)
      }
    }

    const handleCreateFamily = async (): Promise<void> => {
      if (!newFamilyName.value.trim()) return
      
      creatingFamily.value = true
      try {
        const familyMember: FamilyMember = (await apiService.post('family/create', {familyName: newFamilyName.value})).body
        familyStore.addFamily(familyMember)
        familyStore.activeFamilyTab = familyMember.family.id
        showCreateFamilyForm.value = false
        newFamilyName.value = ''
      } catch (error) {
        console.error(error)
        showError('Ошибка создания семьи')
      } finally {
        creatingFamily.value = false
      }
    }

    const handleMarkTask = async (task: Ref<Task>, newMarked: boolean): Promise<void> => {
      try {
        await apiService.post(`task/mark-check`, {taskId: task.value.id, taskMarked: newMarked})
        task.value.isMarked = newMarked
      } catch (error: any) {
        console.error(error)
        showError(error.message || 'Ошибка отметки задачи')
      }
    }

    const handleCheckTask = async (task: Ref<Task>, newChecked: boolean): Promise<void> => {
      try {
        await apiService.post(`task/mark-check`, {taskId: task.value.id, taskChecked: newChecked})
        task.value.isChecked = newChecked
      } catch (error: any) {
        console.error(error)
        showError(error.message || 'Ошибка проверки задачи')
      }
    }

    const handleCloseTaskForm = () => {
      showEditTaskComponent.value = false
      familyStore.editTask = null
    }

    const handleDeleteTask = async (task: Ref<Task>): Promise<void> => {
      try {
        await apiService.delete(`task`, {taskId: task.value.id, familyId: activeFamilyTab.value})
        familyStore.deleteTask(task.value)
      } catch (error: any) {
        console.error(error)
        showError(error.message || 'Ошибка удаления задачи')
      }
    }

    const handleEditTaskPress = (task: Ref<Task>): void => {
      showEditTaskComponent.value = true
      familyStore.editTask = task.value
    }

    const handleJoinFamily = async (): Promise<void> => {
      if (!joinFamilyCode.value.trim()) return
      
      joiningFamily.value = true
      try {
        const familyMember: FamilyMember = (await apiService.post(`family/use-invitation`, {code: joinFamilyCode.value})).body
        familyStore.addFamily(familyMember)
        familyStore.activeFamilyTab = familyMember.family.id
        showJoinFamilyForm.value = false
        joinFamilyCode.value = ''
      } catch (error: any) {
        console.error(error)
        showError(error.message || 'Ошибка вступления в семью')
      } finally {
        joiningFamily.value = false
      }
    }

    const handleOpenInvitationForm = (): void => {
      showCreateInvitationComponent.value = true
    }

    const handleCloseInvitationForm = (): void => {
      showCreateInvitationComponent.value = false
    }

    const showAddTaskForm = (): void => {
      showEditTaskComponent.value = true
    }
    
    const handleAssignRole = async (data: { familyId: string; familyMemberId: string; roleName: string }): Promise<void> => {
      try {
        const updatedMember: FamilyMember = (await apiService.post('role/attach', {
          familyId: data.familyId,
          familyMemberId: data.familyMemberId,
          roleName: data.roleName
        })).body
        
        // Обновляем члена семьи в store
        const members = familyStore.members[data.familyId]
        if (members) {
          const memberRef = members.find(m => m.value.id === data.familyMemberId)
          if (memberRef) {
            memberRef.value = updatedMember
          }
        }
      } catch (error) {
        console.error(error)
        showError('Ошибка назначения роли')
      }
    }

    const handleDetachRole = async (data: { familyId: string; familyMemberId: string; roleName: string }): Promise<void> => {
      try {
        const updatedMember: FamilyMember = (await apiService.post('role/detach', {
          familyId: data.familyId,
          familyMemberId: data.familyMemberId,
          roleName: data.roleName
        })).body
        
        // Обновляем члена семьи в store
        const members = familyStore.members[data.familyId]
        if (members) {
          const memberRef = members.find(m => m.value.id === data.familyMemberId)
          if (memberRef) {
            memberRef.value = updatedMember
          }
        }
      } catch (error) {
        console.error(error)
        showError('Ошибка снятия роли')
      }
    }


    watch(selectedFamilyId, (newValue) => {
      familyStore.activeFamilyTab = newValue || undefined
    })


    watch(() => familyStore.activeFamilyTab, (newValue) => {
      if (selectedFamilyId.value !== (newValue || '')) {
        selectedFamilyId.value = newValue || ''
      }
    })


    watch(activeFamilyTab, async (newTab, oldTab) => {
      if (newTab && newTab !== oldTab) {
        mobileTab.value = 'tasks'
        await Promise.all([
          loadMembers(newTab, false),
          loadTasks(newTab, false),
          loadRoles(newTab, false)
        ])
      }
    })

    onMounted(async () => {
      checkMobileView()
      window.addEventListener('resize', checkMobileView)
      
      await loadFamilies()
      checkHasFamily()

      if (userHasFamily.value && Object.keys(families.value).length > 0) {
        const firstFamilyId = Object.keys(families.value)[0]
        familyStore.activeFamilyTab = firstFamilyId
      }
    })

    onUnmounted(() => {
      window.removeEventListener('resize', checkMobileView)
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
      mobileTab,
      isMobileView,
      selectedFamilyId,
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
      onFamilySelect,
      checkMobileView
    }
  }
}