<template>
  <main class="d-flex align-items-center justify-content-center min-vh-100 p-3">
    <div class="card shadow" style="max-width: 28rem; width: 100%;">
      <div class="card-header text-center">
        <h2>С возвращением!</h2>
        <p class="text-muted mb-0">Войдите в аккаунт</p>
      </div>

      <div class="card-body">
        <div v-if="hasErrors" class="alert alert-danger">
          <ValidationErrorComponent :error="errorState.validationError" />
          <AuthErrorComponent :error="errorState.authError" />
        </div>

        <form @submit.prevent="handleLogin">
          <div class="mb-3">
            <label class="form-label">Имя пользователя</label>
            <input v-model="username" type="text" class="form-control" placeholder="Введите имя пользователя" required />
          </div>

          <div class="mb-3">
            <label class="form-label">Пароль</label>
            <input v-model="password" type="password" class="form-control" placeholder="Введите пароль" required />
          </div>

          <button type="submit" class="btn btn-primary w-100">Войти</button>
        </form>
      </div>

      <div class="card-footer text-center">
        <small class="text-muted">Нет аккаунта? <a href="/registration">Зарегистрироваться</a></small>
      </div>
    </div>
  </main>
</template>

<script src="./Login.ts" lang="ts"></script>
