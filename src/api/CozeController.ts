import http from "@/utils/request";

export class CozeController {
  /**
   * 查询消息列表
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

  /**
   * 查询会话列表
   * @returns []
   */
  static conversations(data = {}, option = {}) {
    return http.get("https://api.coze.cn/v1/conversations", {}, option);
  }

  /**
   * 创建会话
   * @param data body
   * @param option
   * @returns
   */
  static create_conversation(data = {}, option = {}) {
    return http.post("https://api.coze.cn/v1/conversation/create", {});
  }

  /**
   * 清空上下文
   * @param conversation_id 会话ID
   * @returns
   */
  static clear_conversation(conversation_id: string) {
    return http.post(
      `https://api.coze.cn/v1/conversations/:${conversation_id}/clear`
    );
  }
}
