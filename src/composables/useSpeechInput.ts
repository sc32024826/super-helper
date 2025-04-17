import { ref } from "vue";

// 声明 requirePlugin 类型
declare function requirePlugin(name: string): any;

// 语音识别配置参数
const ASRCONFIG = {
  secretId: "AKIDYv493pMehV9Zt42mtrcATXMxJQJzXrwn",
  secretKey: "f6KL8h280e3D7oY8YmnZ7QUKvHOq67tR",
  appId: 1347756222, // 数字类型
};

/**
 * 语音输入组合式API
 * @returns 语音输入相关的状态和方法
 */
export function useSpeechInput() {
  // 引入腾讯云智能语音识别插件
  const plugin = requirePlugin("QCloudAIVoice");
  const manager = plugin.speechRecognizerManager();

  // 状态变量
  const isVoiceMode = ref(false); // 是否处于语音输入模式
  const isPressing = ref(false); // 是否正在按住说话
  const isRecording = ref(false); // 是否正在录音
  const isDataReceived = ref(false); // 数据是否接收完成
  const tempResult = ref(""); // 临时存储识别结果
  const recognizedText = ref(""); // 最终识别的文本内容

  /**
   * 初始化录音事件监听
   * @param onRecognitionComplete 识别完成回调
   */
  const initManagerEvents = (
    onRecognitionComplete?: (text: string) => void
  ) => {
    // 开始识别
    manager.OnRecognitionStart = (res: any) => {
      isRecording.value = true;
      tempResult.value = ""; // 开始新的识别时清空临时结果
    };

    manager.OnSentenceBegin = (res: any) => {
      // 一句话开始
    };

    manager.OnRecognitionResultChange = (res: any) => {
      // 识别变化时
    };

    // 一句话结束时的识别结果
    manager.OnSentenceEnd = (res: any) => {
      if (res && res.result && res.result.voice_text_str) {
        tempResult.value += res.result.voice_text_str;
        recognizedText.value = tempResult.value;
      }
    };

    // 识别完成
    manager.OnRecognitionComplete = (res: any) => {
      isPressing.value = false;
      isRecording.value = false;

      if (recognizedText.value) {
        if (onRecognitionComplete) {
          onRecognitionComplete(recognizedText.value);
        }
        tempResult.value = ""; // 发送后清空临时结果
      } else {
        uni.showToast({
          title: "未识别到有效内容，请重试",
          icon: "none",
        });
      }
    };

    // 识别错误
    manager.OnError = (res: any) => {
      // 错误处理
    };

    // 录音结束（最长10分钟）时回调
    manager.OnRecorderStop = (res: any) => {
      // 录音结束处理
    };
  };

  /**
   * 切换输入模式（文本/语音）
   */
  const toggleInputMode = () => {
    recognizedText.value = ""; // 清空识别的文本内容
    isVoiceMode.value = !isVoiceMode.value;
  };

  /**
   * 开始录音
   */
  const startRecording = () => {
    isPressing.value = true;
    isRecording.value = true;

    uni.getSetting({
      success: (res) => {
        if (res.authSetting["scope.record"]) {
          if (!isPressing.value) {
            return;
          }

          manager.start({
            engine_model_type: "16k_zh",
            voice_format: 1, // PCM 格式
            needvad: 1,
            vad_silence_time: 2000, // 增加到2000ms
            filter_dirty: 1,
            filter_modal: 1,
            filter_punc: 0,
            convert_num_mode: 1,
            secretid: ASRCONFIG.secretId,
            secretkey: ASRCONFIG.secretKey,
            appid: ASRCONFIG.appId,
          });
          uni.vibrateLong();
        } else {
          // 如果未授权，则请求授权
          uni.authorize({
            scope: "scope.record",
            success: () => {
              // 录音权限已授权
            },
            fail: () => {
              // 用户拒绝授权，引导用户去设置页面开启
              uni.showModal({
                title: "提示",
                content: "需要您授权麦克风权限才能使用语音功能",
                confirmText: "去设置",
                success: (modalRes) => {
                  if (modalRes.confirm) {
                    uni.openSetting();
                  }
                },
              });
            },
          });
        }
      },
      fail: () => {
        uni.showToast({
          title: "麦克风权限获取失败",
          icon: "none",
        });
      },
    });
  };

  /**
   * 停止录音
   */
  const stopRecording = () => {
    isRecording.value = false;
    isPressing.value = false;
    manager.stop();
  };

  /**
   * 清理资源
   */
  const dispose = () => {
    // 清理录音相关资源
    if (isRecording.value) {
      manager.stop();
    }
    isRecording.value = false;
    isPressing.value = false;
    tempResult.value = "";
    recognizedText.value = "";
  };

  return {
    // 状态
    isVoiceMode,
    isPressing,
    isRecording,
    isDataReceived,
    recognizedText,

    // 方法
    initManagerEvents,
    toggleInputMode,
    startRecording,
    stopRecording,
    dispose,
  };
}
