<template>
  <div class="d-flex flex-column vh-100">
    <EditTaskComponent v-if="showEditTaskComponent" @close="handleCloseTaskForm" />
    <CreateInvitationComponent v-if="showCreateInvitationComponent" @close-invitation="handleCloseInvitationForm" />
    
    <main class="flex-grow-1 d-flex flex-column p-2 p-md-4 overflow-hidden">
      <div v-if="homeLoading" class="d-flex justify-content-center align-items-center flex-grow-1">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Загрузка...</span>
        </div>
      </div>

      <template v-else>
        <div class="card shadow-sm flex-grow-1 d-flex flex-column overflow-hidden">
          <!-- Заголовок с вкладками семей -->
          <div class="card-header bg-body-tertiary border-bottom flex-shrink-0">
            <!-- Мобильная версия: выпадающий список -->
            <select 
              class="form-select d-md-none" 
              v-model="selectedFamilyId"
            >
              <option value="">+ Создать/Вступить</option>
              <option 
                v-for="(family, id) in familyStore.families" 
                :key="id" 
                :value="id"
              >
                {{ family.familyName }} ({{ family.memberCount }})
              </option>
            </select>

            <!-- Десктопная версия: табы -->
            <ul class="nav nav-tabs card-header-tabs gap-1 d-none d-md-flex flex-nowrap">
              <li v-for="(family, id) in familyStore.families" :key="id" class="nav-item text-nowrap">
                <button @click="familyStore.activeFamilyTab = id"
                        :class="['nav-link', { active: activeFamilyTab === id }]">
                  {{ family.familyName }}
                  <span class="badge bg-primary ms-2">{{ family.memberCount }}</span>
                </button>
              </li>
              <li class="nav-item text-nowrap">
                <button @click="familyStore.activeFamilyTab = undefined"
                        :class="['nav-link', { active: !activeFamilyTab }]">
                  +
                </button>
              </li>
            </ul>
          </div>

          <div class="card-body flex-grow-1 overflow-hidden d-flex flex-column">
            <!-- Экран без активной семьи -->
            <div v-if="!activeFamilyTab" class="mx-auto my-auto" style="max-width: 48rem;">
              <div v-if="!showCreateFamilyForm && !showJoinFamilyForm" class="row g-4">
                <div class="col-12 col-md-6">
                  <div class="card h-100">
                    <div class="card-header">
                      <h3 class="h5 h3-md">Создать семью</h3>
                    </div>
                    <div class="card-body">
                      <p class="small">Создайте новую семью и приглашайте участников</p>
                    </div>
                    <div class="card-footer">
                      <button @click="showCreateFamilyForm = true" class="btn btn-primary w-100">Создать семью</button>
                    </div>
                  </div>
                </div>

                <div class="col-12 col-md-6">
                  <div class="card h-100">
                    <div class="card-header">
                      <h3 class="h5 h3-md">Вступить в семью</h3>
                    </div>
                    <div class="card-body">
                      <p class="small">Присоединитесь к существующей семье по коду приглашения</p>
                    </div>
                    <div class="card-footer">
                      <button @click="showJoinFamilyForm = true" class="btn btn-outline-primary w-100">Вступить по коду</button>
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="showCreateFamilyForm">
                <button @click="showCreateFamilyForm = false" class="btn btn-outline-secondary btn-sm mb-3">← Назад</button>
                <div class="card">
                  <div class="card-header"><h3 class="h5">Новая семья</h3></div>
                  <div class="card-body">
                    <input v-model="newFamilyName" type="text" placeholder="Название семьи" class="form-control" @keyup.enter="handleCreateFamily" />
                  </div>
                  <div class="card-footer">
                    <button @click="handleCreateFamily" :disabled="creatingFamily || !newFamilyName.trim()" class="btn btn-primary w-100">
                      {{ creatingFamily ? 'Создание...' : 'Создать' }}
                    </button>
                  </div>
                </div>
              </div>

              <div v-if="showJoinFamilyForm">
                <button @click="showJoinFamilyForm = false" class="btn btn-outline-secondary btn-sm mb-3">← Назад</button>
                <div class="card">
                  <div class="card-header"><h3 class="h5">Вступить в семью</h3></div>
                  <div class="card-body">
                    <input v-model="joinFamilyCode" type="text" placeholder="Код приглашения" class="form-control" @keyup.enter="handleJoinFamily" />
                  </div>
                  <div class="card-footer">
                    <button @click="handleJoinFamily" :disabled="joiningFamily || !joinFamilyCode.trim()" class="btn btn-primary w-100">
                      {{ joiningFamily ? 'Вступление...' : 'Вступить' }}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Активная семья -->
            <div v-if="activeFamilyTab && familyStore.families[activeFamilyTab]" class="flex-grow-1 overflow-hidden d-flex flex-column">
              <!-- Мобильная версия: вкладки -->
              <ul class="nav nav-pills mb-3 d-md-none flex-shrink-0">
                <li class="nav-item">
                  <button 
                    :class="['nav-link', { active: mobileTab === 'tasks' }]"
                    @click="mobileTab = 'tasks'"
                  >
                    Задачи
                  </button>
                </li>
                <li class="nav-item">
                  <button 
                    :class="['nav-link', { active: mobileTab === 'members' }]"
                    @click="mobileTab = 'members'"
                  >
                    Участники
                  </button>
                </li>
                <li class="nav-item">
                  <button 
                    :class="['nav-link', { active: mobileTab === 'chat' }]"
                    @click="mobileTab = 'chat'"
                  >
                    Чат
                  </button>
                </li>
              </ul>

              <!-- Десктопная версия: Splitpanes -->
              <div class="d-none d-md-flex flex-grow-1 overflow-hidden">
                <Splitpanes class="default-theme" style="height: 100%;">
                  <Pane :size="60" :min-size="40">
                    <TaskManager :tasks="currentTasks"
                                 :tasks-loading="tasksLoading"
                                 :current-user-id="familyStore.profiles[activeFamilyTab]?.id"
                                 @mark-task="handleMarkTask"
                                 @check-task="handleCheckTask"
                                 @edit-task="handleEditTaskPress"
                                 @delete-task="handleDeleteTask"
                                 @refresh="loadTasks(activeFamilyTab, true)"
                                 @add-task="showAddTaskForm" />
                  </Pane>
                  
                  <Pane :size="40" :min-size="25">
                    <Splitpanes class="default-theme" :horizontal="true" style="height: 100%;">
                      <Pane :size="55" :min-size="30">
                        <MembersPanel :members="familyMembers"
                                      :members-loading="familyMembersLoading"
                                      :available-roles="familyStore.roles[activeFamilyTab] || []"
                                      @settings="navigateToFamilySettings"
                                      @invite="handleOpenInvitationForm"
                                      @assign-role="handleAssignRole"
                                      @detach-role="handleDetachRole" />
                      </Pane>
                      
                      <Pane :size="45" :min-size="20">
                        <ChatComponent/>
                      </Pane>
                    </Splitpanes>
                  </Pane>
                </Splitpanes>
              </div>

              <!-- Мобильная версия: контент по вкладкам -->
              <div class="d-md-none flex-grow-1 overflow-hidden">
                <div v-show="mobileTab === 'tasks'" class="h-100">
                  <TaskManager 
                    :tasks="currentTasks"
                    :tasks-loading="tasksLoading"
                    :current-user-id="familyStore.profiles[activeFamilyTab]?.id"
                    @mark-task="handleMarkTask"
                    @check-task="handleCheckTask"
                    @edit-task="handleEditTaskPress"
                    @delete-task="handleDeleteTask"
                    @refresh="loadTasks(activeFamilyTab, true)"
                    @add-task="showAddTaskForm" 
                  />
                </div>
                
                <div v-show="mobileTab === 'members'" class="h-100">
                  <MembersPanel 
                    :members="familyMembers"
                    :members-loading="familyMembersLoading"
                    :available-roles="familyStore.roles[activeFamilyTab] || []"
                    @settings="navigateToFamilySettings"
                    @invite="handleOpenInvitationForm"
                    @assign-role="handleAssignRole"
                    @detach-role="handleDetachRole" 
                  />
                </div>
                
                <div v-show="mobileTab === 'chat'" class="h-100">
                  <ChatComponent />
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </main>
  </div>
</template>

<script src="./Home.ts" lang="ts"></script>