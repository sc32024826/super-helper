import http from "@/utils/request";

interface BindAccountParams {
  openId: string;
  username: string;
  password: string;
  bind: boolean;
}

// 金环系统相关接口
export class GoldController {
  /**
   * 绑定金环账号
   * @param param0
   * @param option
   * @returns token
   */
  static bindAccount(data: BindAccountParams, option = {}) {
    return http.post("/login", data, option);
  }
}
