<template>
  <Header />
  <main class="auth-container">
    <article>
      <header>
        <h2>С возвращением!</h2>
        <p>Войдите в семейный аккаунт</p>
      </header>

      <div v-if="hasErrors" class="error">
        <ValidationErrorComponent :error="errorState.validationError" />
        <AuthErrorComponent :error="errorState.authError" />
      </div>

      <form @submit.prevent="handleRegistration">
        <label>
          Имя пользователя
          <input v-model="username" type="text" placeholder="Введите имя пользователя" required />
        </label>

        <label>
          Пароль
          <input v-model="password" type="password" placeholder="Введите пароль" required />
        </label>

        <label>
          Имя
          <input v-model="firstname" type="text" placeholder="Введите ваше имя" required />
        </label>

        <label>
          Фамилия
          <input v-model="lastname" type="text" placeholder="Введите вашу фамилию" required />
        </label>

        <label>
          День рождения
          <input v-model="birthDate" type="date" required />
        </label>

        <button type="submit">Создать аккаунт</button>
      </form>

      <footer>
        <small>Есть аккаунт? <a href="/cohab/login">Войти</a></small>
      </footer>
    </article>
  </main>
</template>

<script src="./Registration.ts" lang="ts"></script>
<style src="@/styles/base.css"></style>

<style scoped>
.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.auth-container article {
  max-width: 28rem;
  width: 100%;
}
</style>