<template>
  <div id="app">
    <div>
      <span :style="{marginRight: '20px'}">verifier:</span>
      <select v-model="selectedVerifier">
        <option selected value="google">Google</option>
        <option value="facebook">Facebook</option>
        <option value="twitch">Twitch</option>
        <option value="discord">Discord</option>
      </select>
    </div>
    <div :style="{marginTop: '20px'}">
      <button @click="login">Login with Torus</button>
    </div>
    <div id="console">
      <p></p>
    </div>
  </div>
</template>

<script>
import TorusSdk from "@toruslabs/torus-direct-web-sdk";

export default {
  name: "App",
  data() {
    return {
      selectedVerifier: "google"
    };
  },
  methods: {
    async login() {
      const torus = new TorusSdk({ verifier: this.selectedVerifier });
      const loginDetails = await torus.triggerLogin(this.selectedVerifier);
      this.console(loginDetails);
    },
    console(text) {
      document.querySelector("#console>p").innerHTML = typeof text === "object" ? JSON.stringify(text) : text;
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
#console {
  border: 1px solid black;
  height: 80px;
  padding: 2px;
  bottom: 10px;
  position: absolute;
  text-align: left;
  width: calc(100% - 20px);
  border-radius: 5px;
}
#console::before {
  content: "Console :";
  position: absolute;
  top: -20px;
  font-size: 12px;
}
#console > p {
  margin: 0.5em;
  word-wrap: break-word;
}
</style>
