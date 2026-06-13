import { defineStore } from 'pinia'
import {type Ref, ref} from 'vue'
import type {CreateInvitation, Family, FamilyMember, Role, Access, PersonalInfo} from "@/types/family.ts"
import type {Task} from "@/types/task.ts"
import type { MessageDto } from '@/types/chat'
import type { ReactiveSocket } from 'rsocket-types'

const useFamilyStore = defineStore('family', () => {
    const families = ref<Record<string, Ref<Family>>>({})
    const profiles = ref<Record<string, Ref<FamilyMember>>>({})
    const roles = ref<Record<string, Ref<Role>[]>>({})
    const familiesLoaded = ref<boolean>(false)
    const members = ref<Record<string, Ref<FamilyMember>[]>>({'add':[]})
    const membersInfo = ref<Record<string, Ref<PersonalInfo>>>({})
    const tasks = ref<Record<string, Ref<Task>[]>>({})
    const editTask = ref<Task|null>()
    const activeFamilyTab = ref<string>()
    const createInvitation = ref<CreateInvitation>()
    const accesses = ref<Access[]>()
    const messages = ref<Record<string, Ref<MessageDto>[]>>({})

    function updateTask(task: Task){
        if (activeFamilyTab.value) {
            const familyTasks = tasks.value[activeFamilyTab.value]
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
            const familyTasks = tasks.value[activeFamilyTab.value]
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
                familyMembers.forEach(familyMember => {
                    if (familyMember?.member?.id && familyMember?.member?.personalInfo) {
                        membersInfo.value[familyMember.member.id] = ref(familyMember.member.personalInfo)
                    }
                })
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

    function addMessage(familyId: string, message: MessageDto) {
        if (!messages.value[familyId]) {
            messages.value[familyId] = []
        }
        messages.value[familyId].push(ref(message))
    }

    function updateMessage(familyId: string, messageId: string, content: string) {
        const familyMessages = messages.value[familyId]
        if (familyMessages) {
            const msg = familyMessages.find(m => m.value.messageId === messageId)
            if (msg) {
                msg.value.content = content
                msg.value.updatedAt = new Date().toISOString()
            }
        }
    }

    function removeMessage(familyId: string, messageId: string) {
        const familyMessages = messages.value[familyId]
        if (familyMessages) {
            const index = familyMessages.findIndex(m => m.value.messageId === messageId)
            if (index !== -1) familyMessages.splice(index, 1)
        }
    }

    function addReaction(familyId: string, messageId: string, reaction: string) {
        const familyMessages = messages.value[familyId]
        if (familyMessages) {
            const msg = familyMessages.find(m => m.value.messageId === messageId)
            if (msg) {
                if (!msg.value.reactions) msg.value.reactions = []
                msg.value.reactions.push({ emoji: reaction })
            }
        }
    }

    function loadMessages(familyId: string, newMessages: MessageDto[]) {
        messages.value[familyId] = newMessages.map(message => ref(message))
    }

    return {
        families,
        profiles,
        familiesLoaded,
        members,
        roles,
        tasks,
        editTask,
        activeFamilyTab,
        messages,
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
        loadMessages,
        addMessage,
        updateMessage,
        addReaction,
        removeMessage,
        membersInfo
    }
})

export default useFamilyStore