<template>
  <div>
    <Navbar />
    <router-view />
  </div>
</template>

<style>
html,
body,
* {
  padding: 0;
  margin: 0;
  font-family: "Poppins", sans-serif !important;
}
</style>

<script setup lang="ts">
import Navbar from '@/components/Navbar';
</script>