<template>
  <Header />
  <main class="auth-container">
    <article>
      <header>
        <h2>С возвращением!</h2>
        <p>Войдите в аккаунт</p>
      </header>

      <div v-if="hasErrors" class="error">
        <ValidationErrorComponent :error="errorState.validationError" />
        <AuthErrorComponent :error="errorState.authError" />
      </div>

      <form @submit.prevent="handleLogin">
        <label>
          Имя пользователя
          <input v-model="username" type="text" placeholder="Введите имя пользователя" required />
        </label>

        <label>
          Пароль
          <input v-model="password" type="password" placeholder="Введите пароль" required />
        </label>

        <button type="submit">Войти</button>
      </form>

      <footer>
        <small>Нет аккаунта? <a href="/cohab/registration">Зарегистрироваться</a></small>
      </footer>
    </article>
  </main>
</template>

<script src="./Login.ts" lang="ts"></script>

<style scoped>
.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

</style>