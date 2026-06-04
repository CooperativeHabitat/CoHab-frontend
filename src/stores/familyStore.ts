import { defineStore } from 'pinia'
import {type Ref, ref} from 'vue'
import type {CreateInvitation, Family, FamilyMember, Role, Access} from "@/types/family.ts"
import type {Task} from "@/types/task.ts"

const useFamilyStore = defineStore('family', () => {
    const families = ref<Record<string, Ref<Family>>>({})
    const profiles = ref<Record<string, Ref<FamilyMember>>>({})
    const roles = ref<Record<string, Ref<Role>[]>>({})
    const familiesLoaded = ref<boolean>(false)
    const members = ref<Record<string, Ref<FamilyMember>[]>>({'add':[]})
    const tasks = ref<Record<string, Ref<Task>[]>>({})
    const editTask = ref<Task|null>()
    const activeFamilyTab = ref<string>()
    const createInvitation = ref<CreateInvitation>()
    const accesses = ref<Access[]>()

    function updateTask(task: Task){
        if (activeFamilyTab.value) {
            const familyTasks = tasks.value[activeFamilyTab.value] // .value!
            if (familyTasks) {
                const taskIndex = familyTasks.findIndex(
                    (t: Ref<Task>) => t.value.id === task.id
                )
                if(taskIndex !== -1 && familyTasks[taskIndex]) {
                    familyTasks[taskIndex].value = task
                }
            }
        }
    }

    function loadAccesses(newAccesses: Access[]) {
        accesses.value = newAccesses
    }

    function loadRoles(familyId: string, newRoles: Role[]) {
        if(newRoles.length > 0){
            roles.value[familyId] = newRoles.map(role => ref(role))
        }
    }

    function deleteTask(task: Task){
        if (activeFamilyTab.value) {
            const familyTasks = tasks.value[activeFamilyTab.value] // .value!
            if (familyTasks) {
                const taskIndex = familyTasks.findIndex(
                    (t: Ref<Task>) => t.value.id === task.id
                )
                if(taskIndex !== -1) {
                    familyTasks.splice(taskIndex, 1);
                }
            }
        }
    }

    function addTask(task: Task) {
        const familyId = activeFamilyTab.value
        if (!familyId) return
        if (!tasks.value[familyId]) {
            tasks.value[familyId] = [ref(task)]
        } else {
            tasks.value[familyId].push(ref(task))
        }
    }

    function loadMembers(familyMembers: FamilyMember[]) {
        if (familyMembers.length > 0) {
            const firstMember = familyMembers[0]
            if (firstMember?.family?.id) {
                members.value[firstMember.family.id] = familyMembers.map(member => ref(member))
            }
        }
    }

    function addFamily(familyMember: FamilyMember) {
        if(familyMember && familyMember.family && familyMember.family.id) {
            families.value[familyMember.family.id] = ref(familyMember.family)
            profiles.value[familyMember.family.id] = ref(familyMember)
        }
    }

    function loadTasks(loadedTasks: Task[], familyId: string) {
        if(loadedTasks.length > 0) {
            tasks.value[familyId] = loadedTasks.map(task => ref(task))
        }
    }

    function loadFamilies(familyMembers: FamilyMember[]) {
        familyMembers.forEach(profile => {
            profiles.value[profile.family.id] = ref(profile)
            families.value[profile.family.id] = ref(profile.family)
        })
        familiesLoaded.value = true
    }

    function clearStore() {
        families.value = {}
        profiles.value = {}
        members.value = {}
        accesses.value = []
        familiesLoaded.value = false
    }
    return {
        // Реактивные данные
        families,
        profiles,
        familiesLoaded,
        members,
        roles,
        tasks,
        editTask,
        activeFamilyTab,

        // Методы
        loadMembers,
        accesses,
        loadFamilies,
        addFamily,
        loadTasks,
        updateTask,
        addTask,
        deleteTask,
        loadAccesses,
        createInvitation,
        loadRoles,
        clearStore

    }
})

export default useFamilyStore