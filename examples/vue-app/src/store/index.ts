import { reactive, ref } from "vue";
import { LOCAL_NETWORK } from "@/constants";
import router from "@/router";

export const isLoggedIn = reactive(ref(true));
export const logout = () => {
  isLoggedIn.value = false;
  setPrivKey("");
  localStorage.removeItem(LOCAL_NETWORK);
  router.push("/");
};
export const privKey = reactive(ref("" as string | null));
export const setPrivKey = (newKey: string) => {
  privKey.value = newKey;
  localStorage.setItem("privateKey", newKey);
};

export const store = reactive({
  loginMode: "" as string,
  isLoggedIn: true,
  privateKey: "",
  selectedVerifier: "google" as string,
  changeKey(newKey: string) {
    this.privateKey = newKey;
  },
  login() {
    this.isLoggedIn = true;
  },
});
