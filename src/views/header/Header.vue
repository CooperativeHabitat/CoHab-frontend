<template>
  <nav class="navbar navbar-expand sticky-top border-bottom bg-body">
    <div class="container">
      <a href="/" class="navbar-brand d-flex align-items-center gap-2 text-primary">
        <HomeIcon :size="24" />
        <strong>Семейный органайзер</strong>
      </a>
      <ul v-if="state?.requiresAuth" class="navbar-nav ms-auto">
        <li class="nav-item">
          <button @click="handleProfileClick" class="btn nav-link" title="Профиль">
            <UserIcon :size="20" />
          </button>
        </li>
        <li class="nav-item">
          <button @click="handleLogoutClick" class="btn nav-link text-danger" title="Выйти">
            <LogOutIcon :size="20" />
          </button>
        </li>
      </ul>
    </div>
  </nav>
</template>

<script src="./Header.ts" lang="ts"></script>