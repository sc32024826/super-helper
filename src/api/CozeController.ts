import http from "@/utils/request";

export class CozeController {
  /**
   *
   * @param conversation_id 会话ID
   * @param data body
   * @param option header option
   * @returns []
   */
  static conversation_list(conversation_id: string, data = {}, option = {}) {
    return http.post(
      `https://api.coze.cn/v1/conversation/message/list?conversation_id=${conversation_id}`,
      data,
      option
    );
  }
}
