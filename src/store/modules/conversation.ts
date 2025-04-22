import { defineStore } from "pinia";

export const useConversationStore = defineStore("conversation", {
  state: () => {
    return {
      conversationList: [] as any[],
      currentConversationId: ""
    };
  },
  actions: {
    // 添加会话的方法
    addConversation(conversation: any) {
      this.conversationList.push(conversation);
    },
    // 删除会话的方法
    deleteConversation(index: number) {
      if (index >= 0 && index < this.conversationList.length) {
        this.conversationList.splice(index, 1);
      }
    },
    setCurrentConversationId(id: string) {
      this.currentConversationId = id;
    }
  },
  unistorage: true,
});
