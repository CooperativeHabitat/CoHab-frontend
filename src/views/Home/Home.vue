<template>
  <div>
    <Header />
    <EditTaskComponent v-if="showEditTaskComponent" @close="handleCloseTaskForm" />
    <CreateInvitationComponent v-if="showCreateInvitationComponent" @close-invitation="handleCloseInvitationForm" />
    
    <main class="container-fluid" style="padding: 2rem; max-width: 100%;">
      <dialog v-if="homeLoading || familyMembersLoading || tasksLoading" open>
        <article>Загрузка...</article>
      </dialog>

      <div class="grid">
        <!-- Tasks -->
        <article>
          <header>
            <h2>Задачи</h2>
            <span v-if="activeFamilyTab && families[activeFamilyTab]" class="badge">
              {{ families[activeFamilyTab].name }}
            </span>
          </header>

          <div v-if="currentTasks.length === 0">
            <p>Нет задач</p>
          </div>
          <div v-else class="list">
            <TaskComponent
              v-for="task in currentTasks"
              :key="task.id"
              :task="task"
              :current-user-id="familyStore.profiles[activeFamilyTab]?.id"
              @mark-task="handleMarkTask"
              @check-task="handleCheckTask"
              @edit-task="handleEditTaskPress"
              @delete-task="handleDeleteTask"
            />
          </div>

          <footer>
            <button @click="loadTasks(activeFamilyTab)" :disabled="!activeFamilyTab">Обновить</button>
          </footer>
        </article>

        <!-- Family -->
        <article>
          <nav class="tabs">
            <ul>
              <li v-for="(family, id) in families" :key="id">
                <button @click="familyStore.activeFamilyTab = id"
                        :class="['tab', { 'tab-active': activeFamilyTab === id }]">
                  {{ family.familyName }}
                </button>
              </li>
              <li>
                <button @click="familyStore.activeFamilyTab = null"
                        :class="['tab', { 'tab-active': !activeFamilyTab }]">
                  +
                </button>
              </li>
            </ul>
          </nav>

          <div v-if="activeFamilyTab && families[activeFamilyTab]">
            <header>
              <h2>{{ families[activeFamilyTab].familyName }}</h2>
              <span class="badge">{{ familyMembers.length }} чел.</span>
            </header>

            <div v-if="familyMembers.length === 0">
              <p>Нет участников</p>
            </div>
            <div v-else class="list">
              <div v-for="member in familyMembers" :key="member.value.id">
                <FamilyMemberCard :member="member.value" />
              </div>
            </div>

            <footer>
              <button @click="loadMembers(activeFamilyTab)">Обновить</button>
            </footer>
          </div>

          <div v-else>
            <div v-if="!showCreateFamilyForm && !showJoinFamilyForm" class="family-actions">
              <h3>Создание семьи</h3>
              <p>Создайте новую семью или присоединитесь к существующей</p>
              <button @click="showCreateFamilyForm = true" class="full-width">Создать семью</button>
              <div class="divider">
                <span>или</span>
              </div>
              <button @click="showJoinFamilyForm = true" class="secondary full-width">Вступить по коду</button>
            </div>

            <div v-if="showCreateFamilyForm">
              <button @click="showCreateFamilyForm = false" class="outline small">Назад</button>
              <h3>Новая семья</h3>
              <input v-model="newFamilyName" type="text" placeholder="Название семьи"
                     @keyup.enter="handleCreateFamily" />
              <button @click="handleCreateFamily" :disabled="creatingFamily || !newFamilyName.trim()" class="full-width">
                {{ creatingFamily ? 'Создание...' : 'Создать' }}
              </button>
            </div>

            <div v-if="showJoinFamilyForm">
              <button @click="showJoinFamilyForm = false" class="outline small">Назад</button>
              <h3>Вступить в семью</h3>
              <input v-model="joinFamilyCode" type="text" placeholder="Код приглашения"
                     @keyup.enter="handleJoinFamily" />
              <button @click="handleJoinFamily" :disabled="joiningFamily || !joinFamilyCode.trim()" class="full-width">
                {{ joiningFamily ? 'Вступление...' : 'Вступить' }}
              </button>
            </div>
          </div>
        </article>
      </div>

      <!-- Actions -->
      <article style="margin-top: 1.5rem;">
        <h3>Действия</h3>
        <div class="actions">
          <button @click="showAddTaskForm" :disabled="!activeFamilyTab">Добавить задачу</button>
          <button @click="handleOpenInvitationForm" :disabled="!activeFamilyTab" class="secondary">
            Приглашение
          </button>
        </div>
      </article>
    </main>
  </div>
</template>

<script src="./Home.ts" lang="ts"></script>
<style src="@/styles/base.css"></style>