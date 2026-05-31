<template>
  <header class="header">
    <div class="container">
      <nav>
        <ul>
          <li>
            <a href="/" class="logo">
              <HomeIcon :size="24" />
              <strong>Семейный органайзер</strong>
            </a>
          </li>
        </ul>
        <ul v-if="state?.requiresAuth">
          <li>
            <button @click="handleProfileClick" title="Профиль">
              <UserIcon :size="20" />
            </button>
          </li>
          <li>
            <button @click="handleLogoutClick" title="Выйти" class="logout-btn">
              <LogOutIcon :size="20" />
            </button>
          </li>
        </ul>
      </nav>
    </div>
  </header>
</template>

<script src="./Header.ts" lang="ts"></script>
<style src="@/styles/base.css"></style>

<style scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 50;
  backdrop-filter: blur(12px);
  background: var(--pico-card-background-color);
  border-bottom: 1px solid var(--pico-muted-border-color);
  border-radius: 0 0 1rem 1rem !important;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--pico-primary);
  text-decoration: none;
}

.logout-btn:hover {
  color: var(--pico-primary-inverse);
  background: var(--pico-del-color);
}
</style>