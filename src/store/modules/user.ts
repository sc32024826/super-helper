import { defineStore } from "pinia";

export const userStore = defineStore("user", {
  state: () => ({
    token: "",
    realName: "",
    avatar: "",
    phone: "",
  }),
  actions: {},
  getters: {
    getToken: (state) => state.token,
    getRealName: (state) => state.realName,
  },
  unistorage: true,
});
