<template>
  <div class="min-h-screen relative">
    <Header />
    <EditTaskComponent
        v-if="showEditTaskComponent"
        @close="handleCloseTaskForm"
    />
    <CreateInvitationComponent
      v-if="showCreateInvitationComponent"
      @close-invitation="handleCloseInvitationForm"
    />
    <div class="p-8 space-y-8">
      <!-- Loading Indicator -->
      <div v-if="homeLoading || familyMembersLoading || tasksLoading"
           class="fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
        Загрузка...
      </div>

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-[95%] mx-auto relative">
        <!-- Tasks Section -->
        <div class="backdrop-blur rounded-2xl shadow-xl p-8 border border-gray-200 card-hover">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-semibold text-gray-800">Задачи семьи</h2>
            <!-- Отображение активной семьи в заголовке -->
            <span v-if="activeFamilyTab && families[activeFamilyTab]"
                  class="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
              {{ families[activeFamilyTab].name }}
            </span>
          </div>

          <!-- Tasks List -->
          <div class="space-y-4">
            <div v-if="tasksLoading"
                 class="fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
              Загрузка...
            </div>
            <div v-if="currentTasks.length === 0" class="text-center py-8">
              <p class="text-gray-500">Задачи пока не добавлены</p>
            </div>

            <div v-else class="max-h-[70vh] md:max-h-[500px] lg:max-h-[600px] overflow-y-auto">
              <div class="space-y-4 pr-2">
                <TaskComponent
                    v-for="task in currentTasks"
                    :key="task.id"
                    :task="task"
                    :current-user-id="familyStore.profiles[activeFamilyTab]?.id"
                    :family-members="familyMembers"
                @mark-task="handleMarkTask"
                @check-task="handleCheckTask"
                @edit-task="handleEditTaskPress"
                @delete-task="handleDeleteTask"
                />
              </div>
            </div>
          </div>


          <div class="mt-6">
            <button @click="loadTasks(activeFamilyTab)"
                    :disabled="!activeFamilyTab"
                    class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium w-full disabled:bg-gray-400 disabled:cursor-not-allowed">
              Обновить задачи
            </button>
          </div>
        </div>

        <!-- Family Members Section -->
        <div class="backdrop-blur rounded-2xl shadow-xl p-8 border border-gray-200 card-hover">
          <!-- Вкладки для семей -->
          <div class="flex border-b border-gray-200 mb-6 overflow-x-auto">
            <button
                v-for="(family, id) in families"
                :key="id"
                @click="familyStore.activeFamilyTab = id"
                :class="[
                'px-4 py-2 font-medium text-sm whitespace-nowrap',
                activeFamilyTab === id
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              ]"
            >
              {{ family.familyName }}
            </button>
            <button
                @click="familyStore.activeFamilyTab = null"
                :class="[
                'px-4 py-2 font-medium text-sm',
                !activeFamilyTab
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              ]"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
              </svg>
            </button>
          </div>

          <!-- Содержимое для выбранной семьи -->
          <div v-if="activeFamilyTab && families[activeFamilyTab]">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-2xl font-semibold text-gray-800">
                Члены семьи "{{ families[activeFamilyTab].familyName }}"
              </h2>
              <span class="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
                {{ familyMembers.length }} человек
              </span>
            </div>

            <!-- Family Members List -->
            <div class="space-y-4">
              <div v-if="familyMembers.length === 0" class="text-center py-8">
                <p class="text-gray-500">Члены семьи не найдены</p>
              </div>
              <div
                  v-else
                  v-for="member in familyMembers"
                  :key="member.value.id"
                  class="p-4 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <div class="flex items-center space-x-4">
                  <div
                      class="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold"
                  >
                    {{
                      (member.value.personalInfo?.firstname?.charAt(0) || '') +
                      (member.value.personalInfo?.lastname?.charAt(0) || '')
                    }}
                  </div>
                  <div class="flex-1">
                    <h3 class="font-medium text-gray-800">
                      {{ member.value.personalInfo?.firstname || 'Не указано' }}
                      {{ member.value.personalInfo?.lastname || 'Не указано' }}
                    </h3>
                    <p class="text-sm text-gray-600">{{ member.value.username || 'Без логина' }}</p>
                    <p class="text-xs text-gray-500 mt-1">
                      Дата рождения:
                      {{
                        member.value.personalInfo?.birthDate
                            ? formatDate(member.value.personalInfo.birthDate)
                            : 'Не указана'
                      }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div class="mt-6">
              <button
                  @click="loadMembers(activeFamilyTab)"
                  class="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium w-full"
              >
                Обновить список
              </button>
            </div>
          </div>

          <!-- Если нет выбранной семьи (кнопка +) -->
          <div v-else>
            <!-- Choice between create and join -->
            <div v-if="!showCreateFamilyForm && !showJoinFamilyForm" class="text-center py-8">
              <div class="mb-6">
                <h3 class="text-2xl font-bold text-gray-800 mb-2">Добавить семью</h3>
                <p class="text-gray-600">Создайте новую семью или присоединитесь к существующей</p>
              </div>

              <div class="space-y-4 max-w-md mx-auto">
                <!-- Create Family Button -->
                <button
                    @click="showCreateFamilyForm = true"
                    class="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium py-4 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 flex items-center justify-center"
                >
                  <svg
                      class="w-5 h-5 mr-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 4v16m8-8H4"
                    ></path>
                  </svg>
                  Создать новую семью
                </button>

                <div class="relative flex items-center justify-center">
                  <div class="flex-grow border-t border-gray-300"></div>
                  <span class="mx-4 text-gray-500">или</span>
                  <div class="flex-grow border-t border-gray-300"></div>
                </div>

                <!-- Join Family Button -->
                <button
                    @click="showJoinFamilyForm = true"
                    class="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-medium py-4 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 flex items-center justify-center"
                >
                  <svg
                      class="w-5 h-5 mr-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                    ></path>
                  </svg>
                  Вступить по коду приглашения
                </button>
              </div>
            </div>

            <!-- Create Family Form -->
            <div v-if="showCreateFamilyForm" class="text-center py-8">
              <button
                  @click="showCreateFamilyForm = false"
                  class="mb-4 text-blue-600 hover:text-blue-800 flex items-center justify-center"
              >
                <svg
                    class="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  ></path>
                </svg>
                Назад к выбору
              </button>

              <div class="mb-6">
                <h3 class="text-2xl font-bold text-gray-800 mb-2">Создание семьи</h3>
                <p class="text-gray-600">Придумайте название для вашей семьи</p>
              </div>

              <div class="max-w-md mx-auto">
                <input
                    v-model="newFamilyName"
                    type="text"
                    placeholder="Например: Семья Ивановых"
                    class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition mb-4"
                    @keyup.enter="handleCreateFamily"
                />
                <button
                    @click="handleCreateFamily"
                    :disabled="creatingFamily || !newFamilyName.trim()"
                    class="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  <span v-if="creatingFamily" class="flex items-center">
                    <svg
                        class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                      <circle
                          class="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          stroke-width="4"
                      ></circle>
                      <path
                          class="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Создание...
                  </span>
                  <span v-else>Создать семью</span>
                </button>
              </div>
            </div>

            <!-- Join Family Form -->
            <div v-if="showJoinFamilyForm" class="text-center py-8">
              <button
                  @click="showJoinFamilyForm = false"
                  class="mb-4 text-blue-600 hover:text-blue-800 flex items-center justify-center"
              >
                <svg
                    class="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  ></path>
                </svg>
                Назад к выбору
              </button>

              <div class="mb-6">
                <h3 class="text-2xl font-bold text-gray-800 mb-2">Вступление в семью</h3>
                <p class="text-gray-600">Введите код приглашения, который вам отправили</p>
              </div>

              <div class="max-w-md mx-auto">
                <input
                    v-model="joinFamilyCode"
                    type="text"
                    placeholder="Например: ABC123XY"
                    class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition mb-4 text-center text-lg tracking-widest"
                    @keyup.enter="handleJoinFamily"
                />

                <div class="text-sm text-gray-500 mb-6">
                  <p>Код приглашения обычно состоит из 6-12 символов</p>
                  <p>Его может отправить вам администратор существующей семьи</p>
                </div>

                <button
                    @click="handleJoinFamily"
                    :disabled="joiningFamily || !joinFamilyCode.trim()"
                    class="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-medium py-3 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  <span v-if="joiningFamily" class="flex items-center">
                    <svg
                        class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                      <circle
                          class="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          stroke-width="4"
                      ></circle>
                      <path
                          class="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Присоединение...
                  </span>
                  <span v-else>Присоединиться к семье</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="max-w-[95%] mx-auto backdrop-blur rounded-2xl shadow-xl p-8 border border-gray-200">
        <h3 class="text-xl font-semibold text-gray-800 mb-4">Быстрые действия</h3>
        <div class="flex flex-wrap gap-4">
          <button
              @click="showAddTaskForm"
              :disabled="!activeFamilyTab"
              class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Новая задача
          </button>
          <button
              class="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium"
              :disabled="!activeFamilyTab"
              @click="handleOpenInvitationForm"
          >
            Создать код приглашения
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script src="./Home.ts" lang="ts"></script>