<template>
  <div id="app">
    <div class="mode">
      <router-link to="/redirectMode"><button>Login with Redirect Mode (Recommended)</button></router-link>
      <router-link to="/popupMode"><button>Login with Popup Mode</button></router-link>
    </div>
    <!-- <div>
      <span :style="{ marginRight: '20px' }">verifier:</span>
      <select v-model="selectedVerifier">
        <option :key="login" v-for="login in Object.keys(verifierMap)" :value="login">{{ verifierMap[login].name }}</option>
      </select>
    </div>
    <div :style="{ marginTop: '20px' }" v-if="selectedVerifier === 'passwordless'">
      <input type="email" v-model="loginHint" placeholder="Enter your email" />
    </div>
    <div :style="{ marginTop: '20px' }">
      <button @click="login">Login with Torus</button>
    </div>
    <p>Please note that the verifiers listed in the example have http://localhost:3000/serviceworker/redirect configured as the redirect uri.</p>
    <p>If you use any other domains, they won't work.</p>
    <p>The verifiers listed here only work with the client id's specified in example. Please don't edit them</p>
    <p>The verifiers listed here are for example reference only. Please don't use them for anything other than testing purposes.</p>
    <div>
      Reach out to us at <a href="mailto:hello@tor.us">hello@tor.us</a> or <a href="https://t.me/torusdev">telegram group</a> to get your verifier
      deployed for your client id.
    </div>
    <div id="console">
      <p></p>
    </div> -->
  </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "App",
  data() {
    return {};
  },
});
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
.mode {
  display: "flex";
  flex-direction: "row";
  justify-content: "center";
  align-items: "center";
  margin: 100;
}

#console {
  border: 1px solid black;
  height: 40px;
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
}
button {
  height: 25px;
  margin: 5px;
  background: none;
  border-radius: 5px;
  cursor: pointer;
}
</style>
