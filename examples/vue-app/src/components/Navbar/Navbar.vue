<script setup lang="ts">
import { Button } from '@toruslabs/vue-components'
import { logout, privKey } from '@/store'

const handleDocsLink = () => {
  window.open('https://github.com/torusresearch/CustomAuth', '_blank')
}

const handleLogout = () => {
  logout()
}

</script>

<template>
  <div class="w-full relative">
    <div :class="[
      'py-4 px-4 sm:py-6 sm:px-8 flex items-center justify-between bg-app-white dark:bg-app-gray-800 w-full'
    ]">
      <img src="@/assets/web3auth.svg" alt="web3auth demo logo" class="cursor-pointer h-8 sm:!h-12 w-auto" />
      <div class="w-full text-center">
        <h1 class="mb-2 text-xl sm:text-3xl font-bold">demo-customauth.web3auth.io</h1>
        <p v-if="privKey" class="dashboard-subheading">CustomAuth Private key : {{ privKey }}</p>
      </div>

      <Button v-if="privKey" variant="secondary" @on-click="handleLogout">Logout</Button>
      <Button v-else @on-click="handleDocsLink" id="w3a-documentation" variant="secondary">
        Github
      </Button>
    </div>
  </div>
</template>