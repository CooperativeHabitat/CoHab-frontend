<template>
  <div class="d-flex flex-column vh-100">
    <Header />
    <EditTaskComponent v-if="showEditTaskComponent" @close="handleCloseTaskForm" />
    <CreateInvitationComponent v-if="showCreateInvitationComponent" @close-invitation="handleCloseInvitationForm" />
    
    <main class="flex-grow-1 d-flex flex-column p-4 overflow-hidden">
      <div v-if="homeLoading" class="d-flex justify-content-center align-items-center flex-grow-1">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Загрузка...</span>
        </div>
      </div>

      <template v-else>
        <div class="card shadow-sm flex-grow-1 d-flex flex-column overflow-hidden">
          <div class="card-header bg-body-tertiary border-bottom">
            <ul class="nav nav-tabs card-header-tabs gap-1">
              <li v-for="(family, id) in familyStore.families" :key="id" class="nav-item">
                <button @click="familyStore.activeFamilyTab = id; showFamilySettings = false"
                        :class="['nav-link', { active: activeFamilyTab === id && !showFamilySettings }]">
                  {{ family.familyName }}
                  <span class="badge bg-primary ms-2">{{ family.memberCount }}</span>
                </button>
              </li>
              <li class="nav-item">
                <button @click="familyStore.activeFamilyTab = null; showFamilySettings = false"
                        :class="['nav-link', { active: !activeFamilyTab && !showFamilySettings }]">
                  +
                </button>
              </li>
            </ul>
          </div>

          <div class="card-body flex-grow-1 overflow-hidden d-flex flex-column">
            <FamilySettings v-if="showFamilySettings && activeFamilyTab && familyStore.families[activeFamilyTab]"
                            :family-name="familyStore.families[activeFamilyTab].familyName"
                            :error="familySettingsError"
                            :roles="currentRoles"
                            :accesses="familyStore.accesses"
                            @back="showFamilySettings = false"
                            @save="handleSaveFamilyName"
                            @create-role="handleCreateRole"
                            @update-role="handleUpdateRole"
                            @delete-role="handleDeleteRole" />

            <div v-if="!activeFamilyTab && !showFamilySettings" class="mx-auto my-auto" style="max-width: 48rem;">
              <div v-if="!showCreateFamilyForm && !showJoinFamilyForm" class="row g-4">
                <div class="col-md-6">
                  <div class="card h-100">
                    <div class="card-header">
                      <h3>Создать семью</h3>
                    </div>
                    <div class="card-body">
                      <p>Создайте новую семью и приглашайте участников</p>
                    </div>
                    <div class="card-footer">
                      <button @click="showCreateFamilyForm = true" class="btn btn-primary w-100">Создать семью</button>
                    </div>
                  </div>
                </div>

                <div class="col-md-6">
                  <div class="card h-100">
                    <div class="card-header">
                      <h3>Вступить в семью</h3>
                    </div>
                    <div class="card-body">
                      <p>Присоединитесь к существующей семье по коду приглашения</p>
                    </div>
                    <div class="card-footer">
                      <button @click="showJoinFamilyForm = true" class="btn btn-outline-primary w-100">Вступить по коду</button>
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="showCreateFamilyForm">
                <button @click="showCreateFamilyForm = false" class="btn btn-outline-secondary btn-sm mb-3">Назад</button>
                <div class="card">
                  <div class="card-header"><h3>Новая семья</h3></div>
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
                <button @click="showJoinFamilyForm = false" class="btn btn-outline-secondary btn-sm mb-3">Назад</button>
                <div class="card">
                  <div class="card-header"><h3>Вступить в семью</h3></div>
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

            <div v-if="activeFamilyTab && familyStore.families[activeFamilyTab] && !showFamilySettings" class="flex-grow-1 overflow-hidden">
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
                                    @settings="showFamilySettings = true"
                                    @invite="handleOpenInvitationForm" />
                    </Pane>
                    
                    <Pane :size="45" :min-size="20">
                      <ChatComponent/>
                    </Pane>
                  </Splitpanes>
                </Pane>
              </Splitpanes>
            </div>
          </div>
        </div>
      </template>
    </main>
  </div>
</template>

<script src="./Home.ts" lang="ts"></script>