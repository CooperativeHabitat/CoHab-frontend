import {computed, onMounted, type Ref, ref, watch} from 'vue'
import {apiService} from '@/services/api'
import Header from "@/views/header/Header.vue"
import type {Family, FamilyMember, Role, Access} from "@/types/family.ts"
import getFamilyStore from "@/stores/familyStore.ts"
import type {Task} from "@/types/task.ts";
import TaskComponent from "@/views/Home/templates/task/TaskComponent.vue";
import EditTaskComponent from "@/views/Home/templates/task/EditTaskComponent.vue";
import type {CreateInvitation} from "@/types/family.ts";
import CreateInvitationComponent from "@/views/Home/templates/CreateInvitationComponent.vue";
import FamilyMemberCard from './templates/member/FamilyMemberCard.vue'
import { Splitpanes, Pane } from 'splitpanes'
import FamilySettings from './templates/FamilySettings.vue'
import ChatComponent from './templates/ChatComponent.vue'
import 'splitpanes/dist/splitpanes.css'
import TaskManager from './templates/task/TaskManager.vue'
import MembersPanel from './templates/member/MembersPanel.vue'
import { ValidationError } from '@/error/types/serverErrorResponses.ts'
import { ProblemDetail } from '@/error/types/serverErrorResponses.ts'

export default {
  name: 'HomeView',
  components: {CreateInvitationComponent, EditTaskComponent, Header, TaskComponent, FamilyMemberCard, Splitpanes, Pane, FamilySettings, ChatComponent, MembersPanel, TaskManager},
  setup() {
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
    const showFamilySettings = ref(false)
    const familySettingsError = ref<ValidationError | null>(null)
    const familyRolesLoading = ref(false)

    const familyMembers = ref<Ref<FamilyMember>[]>([])
    const currentTasks = computed(() => {
      const tab = activeFamilyTab.value
      return tab ? familyStore.tasks[tab] || [] : []
    })
    const familyStore = getFamilyStore()

    const families = computed(() => familyStore.families)

    const formatDate = (dateString: string): string => {
      if (!dateString) return 'Не указана'
      const date = new Date(dateString)
      return date.toLocaleDateString('ru-RU')
    }

    const showError = (message: string) => {
      alert(`Ошибка: ${message}`)
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
      familyRolesLoading.value = true
      try {
        if(!familyStore.roles[familyId] || force) {
          const roles : Role[] = (await apiService.get('role/' + familyId)).body || []
          familyStore.loadRoles(familyId, roles)
        } 
      } catch (error) {
        console.log(error)
        showError('Ошибка загрузки ролей')
      } finally {
        familyRolesLoading.value = false
      }
    }

    const loadAccesses = async() : Promise<void> => {
      try{
        const accesses: Access[] = ((await apiService.get('role/accesses')).body) || []
        familyStore.loadAccesses(accesses)
      } catch (error) {
        console.log(error)
        showError('Ошибка загрузки доступов')
      }
    }

    const currentRoles = computed(() => {
      const tab = activeFamilyTab.value
      if (!tab || !familyStore.roles[tab]) return []
      return familyStore.roles[tab].map(r => r.value)
    })

    const handleSaveFamilyName = async (familyName: string) => {
      try {
        familySettingsError.value = null
        const newFamily = await apiService.put('family', {
          familyId: familyStore.activeFamilyTab,
          familyName
        })
        const familyId = familyStore.activeFamilyTab!
        if (familyStore.families[familyId]) {
          familyStore.families[familyId] = ref(newFamily.body.family)
        }
      } catch (error) {
        if (error instanceof ProblemDetail) {
          familySettingsError.value = new ValidationError(error)
        }
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

    const handleCreateRole = async (role: { name: string; value: number; accessList: string[] }) => {
      familyRolesLoading.value = true
      try {
        const newRole = (await apiService.post('role', {
          familyId: familyStore.activeFamilyTab,
          roleName: role.name,
          value: role.value,
          accesses: role.accessList
        })).body
        const familyId = familyStore.activeFamilyTab!
        if (familyStore.roles[familyId]) {
          familyStore.roles[familyId].push(ref(newRole))
        } else {
          familyStore.roles[familyId] = [ref(newRole)]
        }
      } catch (error) {
        console.log(error)
        showError('Ошибка создания роли')
      } finally {
        familyRolesLoading.value = false
      }
    }

    const handleUpdateRole = async (role: { id: string; name: string; value: number; accessList: string[] }) => {
      familyRolesLoading.value = true
      try {
        await apiService.put('role', {
          roleId: role.id,
          familyId: familyStore.activeFamilyTab,
          roleName: role.name,
          value: role.value,
          accesses: role.accessList
        })
        await loadRoles(familyStore.activeFamilyTab!, true)
      } catch (error) {
        console.log(error)
        showError('Ошибка обновления роли')
      } finally {
        familyRolesLoading.value = false
      }
    }

    const handleDeleteRole = async (roleId: string) => {
      familyRolesLoading.value = true
      try {
        await apiService.delete('role', {
          familyId: familyStore.activeFamilyTab,
          roleId: roleId
        })
        const familyId = familyStore.activeFamilyTab!
        const roles = familyStore.roles[familyId]
        if (roles) {
          const index = roles.findIndex(r => r.value.id === roleId)
          if (index !== -1) roles.splice(index, 1)
        }
      } catch (error) {
        console.log(error)
        showError('Ошибка удаления роли')
      } finally {
        familyRolesLoading.value = true
      }
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

    watch(activeFamilyTab, async (newTab) => {
      if (newTab) {
        await loadMembers(newTab, false)
        await loadTasks(newTab, false)
        await loadRoles(newTab, false)
      }
    })

    onMounted(async () => {
      await loadFamilies()
      await loadAccesses()
      await checkHasFamily()

      if (userHasFamily.value && Object.keys(families.value).length > 0) {
        familyStore.activeFamilyTab = Object.keys(families.value)[0]
      }
    })

    return {
      homeLoading,
      familyMembersLoading,
      tasksLoading,
      familyRolesLoading,
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
      showFamilySettings,
      familySettingsError,
      currentRoles,
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
      handleSaveFamilyName,
      handleCreateRole,
      handleUpdateRole,
      handleDeleteRole
    }
  }
}