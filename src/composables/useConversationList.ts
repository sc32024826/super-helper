import { CozeController } from "@/api";
import { useConversationStore } from "@/store";

export const useConversationList = () => {
  const conversationStore = useConversationStore();
  const conversationList = conversationStore.conversationList;

  // 当前会话ID
  let currentCvsId = "";
  let list = []
  // 如果会话列表为空 则创建新的会话
  if (conversationList.length === 0) {
    CozeController.create_conversation().then((res) => {
      currentCvsId = res.data.id;
      conversationStore.setCurrentConversationId(res.data.id);

      // 将会话id 存入列表
      conversationStore.addConversation(res.data.id);
      list = conversationStore.conversationList;
    });
  } else {
    // 否则获取当前会话ID(最新会话id)
    currentCvsId = conversationStore.currentConversationId;
    list = conversationStore.conversationList;
  }

  return {
    list,
    currentCvsId,
  };
};
