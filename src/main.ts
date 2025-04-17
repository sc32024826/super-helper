import { createSSRApp } from "vue";
import App from "./App.vue";

import "./static/font/iconfont.css";
// import 'vant/lib/index.css';

export function createApp() {
  const app = createSSRApp(App);
  return {
    app,
  };
}
