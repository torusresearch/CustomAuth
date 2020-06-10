<template>
  <div id="app">
    <div>
      <span :style="{ marginRight: '20px' }">verifier:</span>
      <select v-model="selectedVerifier">
        <option :key="login" v-for="login in Object.keys(typesOfLogin)" :value="login">{{ typesOfLogin[login] }}</option>
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

const GOOGLE = "google";
const FACEBOOK = "facebook";
const DISCORD = "discord";
const TWITCH = "twitch";
const GITHUB = "github";
const LINKEDIN = "linkedin";
const TWITTER = "twitter";
const WEIBO = "weibo";
const EMAIL_PASSWORD = "email_password";
const PASSWORDLESS = "passwordless";

export default {
  name: "App",
  data() {
    return {
      torusdirectsdk: undefined,
      selectedVerifier: "google",
      typesOfLogin: {
        [GOOGLE]: "Google",
        [FACEBOOK]: "Facebook",
        [TWITCH]: "Twitch",
        [DISCORD]: "Discord",
        [EMAIL_PASSWORD]: "Email Password",
        [PASSWORDLESS]: "Passwordless",
        [GITHUB]: "Github",
        [LINKEDIN]: "Linkedin",
        [TWITTER]: "Twitter",
        [WEIBO]: "Weibo",
      },
      clientIdMap: {
        [GOOGLE]: "876733105116-i0hj3s53qiio5k95prpfmj0hp0gmgtor.apps.googleusercontent.com",
        [FACEBOOK]: "2554219104599979",
        [TWITCH]: "tfppratfiloo53g1x133ofa4rc29px",
        [DISCORD]: "630308572013527060",
        [EMAIL_PASSWORD]: "sqKRBVSdwa4WLkaq419U7Bamlh5vK1H7",
        [PASSWORDLESS]: "P7PJuBCXIHP41lcyty0NEb7Lgf7Zme8Q",
        [GITHUB]: "PC2a4tfNRvXbT48t89J5am0oFM21Nxff",
        [LINKEDIN]: "59YxSgx79Vl3Wi7tQUBqQTRTxWroTuoc",
        [TWITTER]: "A7H8kkcmyFRlusJQ9dZiqBLraG2yWIsO",
        [WEIBO]: "dhFGlWQMoACOI5oS5A1jFglp772OAWr1",
      },
      loginToConnectionMap: {
        [EMAIL_PASSWORD]: { connection: "Username-Password-Authentication", domain: "https://torus-test.auth0.com" },
        [PASSWORDLESS]: { connection: "email", domain: "https://torus-test.auth0.com", login_hint: "chai@tor.us" },
        [GITHUB]: { connection: "github", domain: "https://torus-test.auth0.com" },
        [LINKEDIN]: { connection: "linkedin", domain: "https://torus-test.auth0.com" },
        [TWITTER]: { connection: "twitter", domain: "https://torus-test.auth0.com" },
        [WEIBO]: { connection: "weibo", domain: "https://torus-test.auth0.com" },
      },
      verifierMap: {
        [GOOGLE]: "google",
        [FACEBOOK]: "facebook",
        [TWITCH]: "twitch",
        [DISCORD]: "discord",
        [EMAIL_PASSWORD]: "torus-auth0-email-password",
        [PASSWORDLESS]: "torus-auth0-passwordless",
        [GITHUB]: "torus-auth0-github",
        [LINKEDIN]: "torus-auth0-linkedin",
        [TWITTER]: "torus-auth0-twitter",
        [WEIBO]: "torus-auth0-weibo",
      },
    };
  },
  methods: {
    async login() {
      try {
        if (!this.torusdirectsdk) return;
        const jwtParams = this.loginToConnectionMap[this.selectedVerifier] || {};
        const loginDetails = await this.torusdirectsdk.triggerLogin({
          typeOfLogin: this.selectedVerifier,
          verifier: this.verifierMap[this.selectedVerifier],
          clientId: this.clientIdMap[this.selectedVerifier],
          jwtParams: jwtParams,
        });

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
  async mounted() {
    try {
      const torusdirectsdk = new TorusSdk({
        baseUrl: `${location.origin}/serviceworker`,
        enableLogging: true,
        proxyContractAddress: "0x4023d2a0D330bF11426B12C6144Cfb96B7fa6183", // details for test net
        network: "ropsten", // details for test net
      });

      await torusdirectsdk.init({ skipSw: false });
      this.torusdirectsdk = torusdirectsdk;
    } catch (error) {
      console.error(error, "mounted caught");
    }
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
