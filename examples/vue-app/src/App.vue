<template>
  <div id="app">
    <button @click="login">Login with Torus</button>
  </div>
</template>

<script>
import TorusSdk from "torus-direct-web-sdk";

export default {
  name: "App",
  methods: {
    login() {
      const torus = new TorusSdk()
      torus.triggerLogin('google')
    }
  }
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
