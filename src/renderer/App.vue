<script setup lang="ts">
import HelloWorld from './components/HelloWorld.vue'
// In a declaration file, e.g., electron-api.d.ts
interface ElectronApi {
    sendMessage(message: string): void;
    getDbPath(): Promise<string>;
}

declare global {
    interface Window {
        electronAPI: ElectronApi;
    }
}

window.electronAPI.sendMessage('Hello from App.vue!');

async function getDbPath() {
  const path = await window.electronAPI.getDbPath();
  console.log(path);
}
getDbPath();
</script>

<template>
  <div>
    <a href="https://vitejs.dev" target="_blank">
      <img src="/vite.svg" class="logo" alt="Vite logo" />
    </a>
    <a href="https://vuejs.org/" target="_blank">
      <img src="/vue.svg" class="logo vue" alt="Vue logo" />
    </a>
  </div>
  <HelloWorld msg="Vite + Vue" />
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}

.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}

.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
