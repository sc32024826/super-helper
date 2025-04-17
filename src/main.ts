import { createSSRApp } from "vue";
import App from "./App.vue";

import "./static/font/iconfont.css";

export function createApp() {
  const app = createSSRApp(App);
  return {
    app,
  };
}
