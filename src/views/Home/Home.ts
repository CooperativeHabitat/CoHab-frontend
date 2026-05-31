import {computed, onMounted, type Ref, ref, watch} from 'vue'
import {apiService} from '@/services/api'
import Header from "@/views/header/Header.vue"
import type {Family, FamilyMember} from "@/types/family.ts"
import getFamilyStore from "@/stores/familyStore.ts"
import type {Task} from "@/types/task.ts";
import TaskComponent from "@/views/Home/templates/TaskComponent.vue";
import EditTaskComponent from "@/views/Home/templates/EditTaskComponent.vue";
import type {CreateInvitation} from "@/types/family.ts";
import CreateInvitationComponent from "@/views/Home/templates/CreateInvitationComponent.vue";
import FamilyMemberCard from './templates/FamilyMemberCard.vue'

export default {
  name: 'HomeView',
  components: {CreateInvitationComponent, EditTaskComponent, Header, TaskComponent, FamilyMemberCard },
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

    const loadTasks = async (familyId: string): Promise<void> => {
      if(!familyId) return
      tasksLoading.value = true
      try {
        if(!familyStore.tasks[familyId]) {
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

    const loadMembers = async (familyId: string): Promise<void> => {
      if (!familyId) return

      familyMembersLoading.value = true
      try {
        if (!familyStore.members[familyId]) {
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

    const handleCreateFamily = async (): Promise<void> => {
      creatingFamily.value = true
      try {
        console.log('Creating family:', newFamilyName.value)
        const familyMember: FamilyMember = (await apiService.post('family/create', newFamilyName.value)).body
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
      creatingFamily.value = true
      try {
        console.log("Joining family: ", joinFamilyCode.value)
        const familyMember = (await apiService.post(`family/use-invitation`, {code: joinFamilyCode.value} )).body
        familyStore.addFamily(familyMember)
        familyStore.activeFamilyTab = familyMember.id
      }
      catch(error: any){
        console.log(error)
        showError(error.message)
      }
      creatingFamily.value = false

    }

    const handleOpenInvitationForm = async (): Promise<void> => {
      showCreateInvitationComponent.value = true;
    }

    const handleCloseInvitationForm = async (createInvitation: Ref<CreateInvitation>): Promise<void> => {
      showCreateInvitationComponent.value = false;
    }


    const showAddTaskForm = (): void => {
      showEditTaskComponent.value = true
    }

    watch(activeFamilyTab, async (newTab) => {
      if (newTab) {
        await loadMembers(newTab)
        await loadTasks(newTab)
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

      // Form states
      showCreateFamilyForm,
      showJoinFamilyForm,
      newFamilyName,
      joinFamilyCode,
      creatingFamily,
      joiningFamily,
      userHasFamily,

      // Data
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
      showEditTaskComponent,
      showAddTaskForm,

      handleMarkTask,
      handleCheckTask,
      handleDeleteTask,
      handleEditTaskPress,
      handleCloseTaskForm,
      handleJoinFamily,

      handleCloseInvitationForm,
      showCreateInvitationComponent,
      handleOpenInvitationForm
    }
  }
}