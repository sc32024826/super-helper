<template>
  <view class="login-container">
    <view class="login-form">
      <view class="form-title">绑定金环账号</view>
      <view class="input-group">
        <input
          type="tel"
          v-model="formData.phone"
          placeholder="请输入手机号"
          maxlength="11"
          class="input-field"
        />
      </view>
      <view class="input-group">
        <input
          type="password"
          password
          v-model="formData.password"
          placeholder="请输入密码"
          class="input-field"
        />
      </view>
      <button class="login-btn" @click="handleLogin">绑定账号</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from "vue";
import { GoldController } from "@/api";
import { userStore } from "@/store";

const formData = reactive({
  phone: "",
  password: "",
});

const userStoreInstance = userStore();

const handleLogin = () => {
  const phoneRegex = /^1[3-9]\d{9}$/;
  if (!phoneRegex.test(formData.phone)) {
    uni.showToast({
      title: "请输入有效的手机号",
      icon: "none",
    });
    return;
  }
  if (formData.password.length < 6) {
    uni.showToast({
      title: "密码长度需大于6位",
      icon: "none",
    });
    return;
  }
  // 调用微信小程序的 wx.login 接口
  uni.login({
    provider: "weixin",
    success: (res) => {
      if (res.code) {
        console.log("微信登录 code:", res.code);
        GoldController.bindAccount({
          openId: res.code,
          username: formData.phone,
          password: formData.password,
          bind: true,
        }).then((resp) => {
          const { adminToken, realName } = resp.data;

          userStoreInstance.token = adminToken;
          userStoreInstance.realName = realName;
          // TODO: 将 code 和 formData 提交到后端进行绑定操作
          uni.showToast({
            title: "账号绑定成功",
            icon: "success",
          });
          uni.switchTab({
            url: "/pages/home/index",
          });
        });
      } else {
        console.error("获取微信登录 code 失败:", res);
        uni.showToast({
          title: "登录失败，请重试",
          icon: "none",
        });
      }
    },
    fail: (err) => {
      console.error("微信登录失败:", err);
      uni.showToast({
        title: "微信登录失败",
        icon: "none",
      });
    },
  });
};

onMounted(() => {
  uni.showLoading({
    title: "检查账号权限中...",
  });
  // 校验  金环token 是否存在
  if (userStoreInstance.token) {
    uni.hideLoading();
    uni.switchTab({
      url: "/pages/home/index",
    });
  } else {
    uni.hideLoading();

    if (process.env.NODE_ENV === "development") {
      formData.phone = "18705735690";
      formData.password = "a123456";
    }
  }
  // 页面加载时的初始化操作
  // 临时存储 token
  //   uni.setStorage({
  //     key: "token",
  //     data: "pat_Xbefq7nXVeRTtVmPtPm4APwvK6z2XCt3Jo6zSJfI1V5lWrif482DDxHBRvnxt1aP",
  //   });
});
</script>

<style scoped lang="scss">
.login-container {
  display: flex;
  justify-content: center;
  padding: 32rpx;
}

.login-form {
  width: 90%;
  max-width: 400px;
  padding: 30px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.form-title {
  text-align: center;
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 30px;
  color: #333;
}

.input-group {
  margin-bottom: 20px;
}

.input-field {
  width: 100%;
  height: 50px;
  padding: 0 15px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 16px;
  box-sizing: border-box;
}

.login-btn {
  width: 100%;
  height: 50px;
  background-color: #007aff;
  color: #fff;
  border: none;
  border-radius: 5px;
  font-size: 18px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-btn:active {
  opacity: 0.8;
}
</style>
