<template>
  <div id="app">
    <div>
      <span :style="{ marginRight: '20px' }">verifier:</span>
      <select v-model="selectedVerifier">
        <option value="google">Google</option>
        <option value="github">Github</option>
        <option value="email_password">Email Password</option>
        <option value="passwordless">Passwordless</option>
      </select>
    </div>
    <div :style="{ marginTop: '20px' }">
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
      selectedVerifier: "passwordless",
    };
  },
  methods: {
    async login() {
      try {
        // AUTH0_DOMAIN: "torus-test.auth0.com"
        // AUTH0_CLIENT_ID: "sqKRBVSdwa4WLkaq419U7Bamlh5vK1H7"
        // GOOGLE_CLIENT_ID: "876733105116-i0hj3s53qiio5k95prpfmj0hp0gmgtor.apps.googleusercontent.com",
        // FACEBOOK_CLIENT_ID: "2554219104599979",

        let loginDetails;
        // AUTH0
        if (this.selectedVerifier === "github") {
          const torusdirectsdk = new TorusSdk({
            baseUrl: "http://localhost:3000/serviceworker",
            enableLogging: true,
            proxyContractAddress: "0x4023d2a0D330bF11426B12C6144Cfb96B7fa6183", // details for test net
            network: "ropsten", // details for test net
          });
          await torusdirectsdk.init();
          loginDetails = await torusdirectsdk.triggerLogin({
            typeOfLogin: this.selectedVerifier,
            verifier: "torus-auth0",
            clientId: "PC2a4tfNRvXbT48t89J5am0oFM21Nxff",
            jwtParams: {
              domain: "https://torus-test.auth0.com",
            },
          });
        } else if (this.selectedVerifier === "email_password") {
          const torusdirectsdk = new TorusSdk({
            baseUrl: "http://localhost:3000/serviceworker",
            enableLogging: true,
            proxyContractAddress: "0x4023d2a0D330bF11426B12C6144Cfb96B7fa6183", // details for test net
            network: "ropsten", // details for test net
          });
          await torusdirectsdk.init();
          loginDetails = await torusdirectsdk.triggerLogin({
            typeOfLogin: this.selectedVerifier,
            verifier: "torus-auth0",
            clientId: "sqKRBVSdwa4WLkaq419U7Bamlh5vK1H7",
            jwtParams: {
              domain: "https://torus-test.auth0.com",
            },
          });
        } else if (this.selectedVerifier === "passwordless") {
          const torusdirectsdk = new TorusSdk({
            baseUrl: "http://localhost:3000/serviceworker",
            enableLogging: true,
            proxyContractAddress: "0x4023d2a0D330bF11426B12C6144Cfb96B7fa6183", // details for test net
            network: "ropsten", // details for test net
          });
          await torusdirectsdk.init();
          loginDetails = await torusdirectsdk.triggerLogin({
            typeOfLogin: this.selectedVerifier,
            verifier: "torus-auth0",
            clientId: "P7PJuBCXIHP41lcyty0NEb7Lgf7Zme8Q",
            jwtParams: {
              domain: "https://torus-test.auth0.com",
              connection: "email",
              login_hint: "chai@tor.us",
            },
          });
        } else if (this.selectedVerifier === "google") {
          // GOOGLE
          const torusdirectsdk = new TorusSdk({
            baseUrl: "http://localhost:3000/serviceworker",
            enableLogging: true,
            // proxyContractAddress: "0x4023d2a0D330bF11426B12C6144Cfb96B7fa6183", // details for test net
            // network: "ropsten", // details for test net
          });
          await torusdirectsdk.init();
          loginDetails = await torusdirectsdk.triggerLogin({
            typeOfLogin: this.selectedVerifier,
            verifier: this.selectedVerifier,
            clientId: "876733105116-i0hj3s53qiio5k95prpfmj0hp0gmgtor.apps.googleusercontent.com",
          });
        }

        // AGGREGATE LOGIN
        // const loginDetails = await torusdirectsdk.triggerAggregateLogin("single_id_verifier", "google-google", [
        //   {
        //     clientId: "238941746713-qqe4a7rduuk256d8oi5l0q34qtu9gpfg.apps.googleusercontent.com",
        //     typeOfLogin: "google",
        //     verifier: "google-shubs",
        //   },
        // ]);
        this.console(loginDetails);
      } catch (error) {
        console.error(error, "caught");
      }
    },
    console(text) {
      document.querySelector("#console>p").innerHTML = typeof text === "object" ? JSON.stringify(text) : text;
    },
  },
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
