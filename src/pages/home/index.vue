<template>
  <view class="ai-chat-container">
    <!-- 消息列表 -->
    <scroll-view
      class="message-list no-scrollbar"
      scroll-y
      :scroll-top="scrollTop"
      :scroll-into-view="scrollTarget"
      :show-scrollbar="false"
      @scrolltoupper="loadMoreMessages"
      :style="{ height: scrollViewHeight + 'rpx' }"
    >
      <view
        v-for="(message, index) in messages"
        :key="index"
        class="message-item"
        :class="message.role === 'user' ? 'user-message' : 'ai-message'"
      >
        <view class="message-content" v-if="message.role === 'user'">
          <text>{{ message.content }}</text>
        </view>
        <view class="message-content markdown-content" v-else>
          <towxml :nodes="strToMarkdown(message.content)" />
        </view>
      </view>
      <!-- 正在输入的消息 -->
      <view v-if="isTyping" class="message-item ai-message">
        <view class="message-content markdown-content">
          <towxml :nodes="strToMarkdown(typingContent)" />
        </view>
        <view class="typing-indicator">
          思考中
          <view class="dot"></view>
          <view class="dot"></view>
          <view class="dot"></view>
        </view>
      </view>
      <!-- 占位  撑开高度 -->
      <view style="height: 400px" id="target"></view>
    </scroll-view>
    <!-- 输入框 -->
    <view class="input-area" :style="{ paddingBottom: inputBottom + 'px' }">
      <van-field
        :placeholder="isVoiceMode ? '按住说话' : '发送消息'"
        placeholder-style="color: #8b8b8b; "
        type="textarea"
        autosize
        :value="inputMessage"
        :adjust-position="false"
        :show-confirm-bar="false"
        :border="false"
        :custom-style="fieldStyle"
        @focus="onFieldFocus"
        @blur="onFieldBlur"
        @change="onFieldChange"
        class="input-message-field"
      >
        <template #left-icon>
          <!-- <view class="switch-button" @click="toggleInputMode">
            <text
              :class="[
                'iconfont',
                isVoiceMode ? 'icon-jianpan' : 'icon-yuyin',
                'switch-icon',
              ]"
            ></text>
          </view> -->
        </template>
        <template #button>
          <button
            class="send-button"
            @click="sendMessage"
            v-if="!isVoiceMode"
            :disabled="isTyping || (isVoiceMode && isRecording)"
          >
            发送
          </button>
        </template>
      </van-field>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { marked } from "marked";
import { CozeController } from "@/api";
import { onLoad } from "@dcloudio/uni-app";
import { useThrottle } from "@/utils";

const towxml = require("../../wxcomponents/towxml/index.js");

const strToMarkdown = computed(() => {
  return (str: string) => {
    return towxml(str, "markdown");
  };
});

// 声明微信插件
// declare const requirePlugin: (name: string) => any;

interface Message {
  role: "user" | "assistant";
  content: string;
}
const { safeAreaInsets, screenWidth, platform } = uni.getSystemInfoSync();

const messages = ref<Message[]>([]);
const inputMessage = ref("");
const scrollTop = ref(0);
const scrollViewHeight = ref(0);

const isTyping = ref(false);
const typingContent = ref("");
const isRecording = ref(false);
const isVoiceMode = ref(false);
const scrollTarget = ref("");
const keyboardHeight = ref(0);
// const isPressing = ref(false);
const fieldStyle = ref(
  "background-color: #efefef; border-radius: 48rpx; padding: 5px 10px !important;min-height: 105rpx; display: flex; align-items: center; font-size: 34rpx;"
);
const inputBottom = ref(20);
const pixelRate = ref(1);
// const scrollTopHeight = ref(0);
const initialFieldBottom = ref(0);

// 配置marked
marked.setOptions({
  breaks: true, // 支持换行符
  gfm: true, // 支持GitHub风格的Markdown
});

// 监听键盘高度变化
const initKeyboardListener = () => {
  uni.onKeyboardHeightChange((res) => {
    keyboardHeight.value = res.height;
    if (res.height > 0) {
      // 键盘弹出时，只使用键盘高度
      inputBottom.value = res.height + 10;
      scrollViewHeight.value =
        uni.getSystemInfoSync().windowHeight - res.height - 120;
      scrollToBottom();
    } else {
      // 键盘收起时，使用安全区高度
      inputBottom.value = initialFieldBottom.value;
      scrollViewHeight.value = uni.getSystemInfoSync().windowHeight - 120;
    }
  });
};

// 移除不必要的输入框事件处理
const onFieldFocus = () => {};
const onFieldBlur = () => {};
const onFieldChange = (e: any) => {
  inputMessage.value = e.detail
};

// 优化滚动节流，增加延迟
// const setScrollTopHeight = useThrottle(function (val: number = 200000) {
//   if (scrollTopHeight.value >= val) {
//     scrollTopHeight.value += 1;
//     return;
//   }
//   scrollTopHeight.value += val;
// }, 200);

// 发送消息
const sendMessage = async () => {
  console.log('send', inputMessage.value);
  if (!inputMessage.value.trim() || isTyping.value) return;

  // 添加用户消息
  const userMessage = inputMessage.value.trim();
  messages.value.push({
    role: "user",
    content: userMessage,
  });

  // 清空输入框
  inputMessage.value = "";

  // 滚动到底部
  scrollToBottom();

  try {
    isTyping.value = true;
    typingContent.value = "";

    await fetchAIResponse(userMessage);

    isTyping.value = false;
    typingContent.value = "";
  } catch (error) {
    console.error("发送消息失败:", error);
    uni.showToast({
      title: "发送失败，请重试",
      icon: "none",
    });
    isTyping.value = false;
  }
};

const fetchAIResponse = async (message: string): Promise<string> => {
  return new Promise((resolve) => {
    let fullResponse = "";

    const requestTask = uni.request({
      url: "https://api.coze.cn/v1/workflows/chat",
      method: "POST",
      header: {
        Authorization:
          "Bearer pat_Xbefq7nXVeRTtVmPtPm4APwvK6z2XCt3Jo6zSJfI1V5lWrif482DDxHBRvnxt1aP",
        "Content-Type": "application/json",
        Accept: "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
      data: {
        workflow_id: "7493062678941253667",
        app_id: "7493051052225282100",
        additional_messages: [
          {
            role: "user",
            type: "question",
            content_type: "text",
            content: message,
          },
        ],
        parameters: {
          input: message,
        },
        conversation_id: "7490816084174520332",
      },
      enableChunked: true,
      success: (res) => {
        // console.log('请求成功:', res)
      },
      fail: (err) => {
        console.error("请求失败:", err);
        resolve("抱歉，请求失败，请稍后重试");
      },
      complete: () => {
        resolve(fullResponse);
      },
    });

    // 监听数据块 仅微信小程序支持
    // @ts-ignore
    requestTask.onChunkReceived((chunk: { data: AllowSharedBufferSource }) => {
      try {
        // 将 Uint8Array 转换为文本
        const textDecoder = new TextDecoder("utf-8");
        const text = textDecoder.decode(chunk.data);

        // 解析 SSE 数据
        const chunks = text.split("\n\n");

        if (chunks.length > 1) {
          chunks.slice(0, -1).forEach((chunk) => {
            let tmp = chunk.split("\n");
            let [eventType, text] = tmp;
            let answerData = {} as any;

            switch (eventType) {
              // 组装完成
              case "event: conversation.message.completed":
                let res = text.replace("data: ", "");
                answerData = JSON.parse(res);
                if (answerData.content && answerData.type === "answer") {
                  // 添加AI回复
                  messages.value.push({
                    role: "assistant",
                    content: marked.parse(answerData.content) as string,
                  });
                  fullResponse = "";
                  typingContent.value = "";
                  scrollToBottom();
                }

                break;
              // 增量数据
              case "event: conversation.message.delta":
                try {
                  let res = text.replace("data: ", "");
                  answerData = JSON.parse(res);
                  console.log("增量数据: ", answerData);

                  if (answerData.content && answerData.type === "answer") {
                    fullResponse += answerData.content;
                    // 更新打字效果
                    typingContent.value = marked.parse(fullResponse) as string;
                  }
                } catch (err) {
                  console.log(err);
                  return;
                }
                break;
              case "event: done":
                console.log("回答完毕");
                break;
              default:
                console.log(eventType, text);
                break;
            }
            console.log(fullResponse);
          });
        }
      } catch (e) {
        console.error("解析 SSE 数据失败:", e);
      }
    });
  });
};

// 滚动到底部
const scrollToBottom = () => {
  setTimeout(() => {
    scrollTop.value = 999999;
    scrollTarget.value = "target";
  }, 100);
};

// 加载更多消息
const loadMoreMessages = () => {
  // 实现加载历史消息的逻辑
  // console.log('加载更多消息')
};

// 切换输入模式
const toggleInputMode = () => {
  isVoiceMode.value = !isVoiceMode.value;
  if (!isVoiceMode.value) {
    // 切换到文本模式时，确保停止录音
    if (isRecording.value) {
      // stopRecording();
    }
  }
};
const loadHistory = () => {
  CozeController.conversation_list("7490816084174520332", {
    limit: 10,
  }).then((res) => {
    messages.value = res.data.reverse().map((m) => ({
      role: m.role,
      content:
        m.role === "user" ? m.content : (marked.parse(m.content) as string),
    }));
    // scrollToBottom()
    setTimeout(() => {
      console.log("滚动到底部");
      scrollTarget.value = "target";
    }, 100);
  });
};

// 解析markdown为towxml格式
const parseMarkdown = (content: string) => {
  return marked(content);
};

onMounted(() => {
  loadHistory();
  initKeyboardListener();
});

onLoad(() => {
  pixelRate.value = 750 / screenWidth;
  initialFieldBottom.value = safeAreaInsets!.bottom;
  if (initialFieldBottom.value === 0) {
    initialFieldBottom.value = 12;
  }
  inputBottom.value = initialFieldBottom.value;
  scrollViewHeight.value = uni.getSystemInfoSync().windowHeight - 120;
});
</script>

<style lang="scss" scoped>
/* 全局样式或页面样式 */
.no-scrollbar ::-webkit-scrollbar {
  display: none;
  /* Chrome/Safari/Opera */
  width: 0 !important;
  /* Firefox */
  height: 0 !important;
}

.no-scrollbar {
  -ms-overflow-style: none;
  /* IE/Edge */
  scrollbar-width: none;
  /* Firefox */
}

.ai-chat-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f5f5;
  box-sizing: border-box;
}

.message-list {
  flex: 1;
  padding: 20rpx;
  box-sizing: border-box;
  padding-bottom: 120rpx; // 为底部输入区域留出空间
  background-color: #f5f5f5;
  height: calc(100vh - 120rpx); // 添加固定高度
  overflow: hidden; // 防止内容溢出
  margin-bottom: var(--keyboard-height); // 为键盘留出空间
}

.message-item {
  margin-bottom: 20rpx;
  display: flex;
  flex-direction: column;
  overflow: scroll;
}

.message-content {
  padding: 20rpx;
  border-radius: 10rpx;
  word-break: break-all;
}

.markdown-content {
  background-color: white;
  color: #333;
}

.user-message {
  align-items: flex-end;

  .message-content {
    background-color: #007aff;
    color: white;
  }
}

.ai-message {
  align-items: flex-start;
}

.typing-indicator {
  display: flex;
  align-items: center;
  margin-top: 20rpx;

  .dot {
    width: 8rpx;
    height: 8rpx;
    background-color: #999;
    border-radius: 50%;
    margin-right: 8rpx;
    animation: typing 1.4s infinite ease-in-out;

    &:nth-child(2) {
      animation-delay: 0.2s;
    }

    &:nth-child(3) {
      animation-delay: 0.4s;
    }
  }
}

@keyframes typing {
  0%,
  60%,
  100% {
    transform: translateY(0);
  }

  30% {
    transform: translateY(-10rpx);
  }
}

.input-area {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20rpx;
  background-color: white;
  display: flex;
  align-items: center;
  border-top: 1rpx solid #eee;
  box-sizing: border-box;
  z-index: 100;
  transform: translateY(0);
  transition: transform 0.3s ease;
}

// 当键盘弹出时，输入框区域会向上移动
.input-area.keyboard-show {
  transform: translateY(calc(-var(--keyboard-height) + 20rpx));
}

.input-wrapper {
  display: flex;
  align-items: center;
  width: 100%;
}

.switch-button {
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  border-radius: 40rpx;
  margin-right: 20rpx;

  .switch-icon {
    font-size: 50rpx;
    color: #666;
  }
}

.voice-input {
  flex: 1;
  height: 80rpx;
  background-color: #f5f5f5;
  border-radius: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
  transition: all 0.3s ease;

  .voice-text {
    font-size: 28rpx;
    color: #666;
  }

  &.voice-input-pressing {
    background-color: #007aff;

    .voice-text {
      color: white;
    }
  }
}

.message-input {
  flex: 1;
  height: 80rpx;
  background-color: #f5f5f5;
  border-radius: 40rpx;
  padding: 0 30rpx;
  margin-right: 20rpx;
}

.send-button {
  width: 120rpx;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  background-color: #007aff;
  color: white;
  border-radius: 40rpx;
  font-size: 28rpx;

  &:disabled {
    opacity: 0.5;
  }
}
.input-message-field {
  width: 100%;
  height: 105rpx;

  :deep(.van-field__control) {
    margin-left: 20rpx;
  }
}
</style>
