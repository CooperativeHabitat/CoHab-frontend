<template>
  <div id="app">
    <Header />
    <div id="toast-container" class="toast-container position-fixed bottom-0 end-0 p-3"></div>
    <router-view v-slot="{ Component }">
      <keep-alive>
        <component :is="Component" />
      </keep-alive>
    </router-view>
  </div>
</template>

<script setup lang="ts"></script>