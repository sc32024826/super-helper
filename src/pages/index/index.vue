<template>
    <view class="login-container">
        <view class="login-form">
            <view class="form-title">用户登录</view>
            <view class="input-group">
                <input type="number" v-model="formData.phone" placeholder="请输入手机号" maxlength="11" class="input-field" />
            </view>
            <view class="input-group">
                <input type="password" v-model="formData.password" placeholder="请输入密码" class="input-field" />
            </view>
            <button class="login-btn" @click="handleLogin">登录</button>
        </view>
    </view>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'

const formData = reactive({
    phone: '',
    password: ''
})

const handleLogin = () => {
    if (!formData.phone) {
        uni.showToast({
            title: '请输入手机号',
            icon: 'none'
        })
        return
    }
    if (!formData.password) {
        uni.showToast({
            title: '请输入密码',
            icon: 'none'
        })
        return
    }
    // TODO: 调用登录接口
    console.log('登录信息：', formData)
}

onMounted(() => {
    // 页面加载时的初始化操作
    // 临时存储 token
    uni.setStorage({
        key: 'token',
        data: 'pat_Xbefq7nXVeRTtVmPtPm4APwvK6z2XCt3Jo6zSJfI1V5lWrif482DDxHBRvnxt1aP'
    })
    uni.redirectTo({
        url: '/pages/home/index',
    })
})
</script>

<style>
.login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background-color: #f5f5f5;
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
    font-size: 24px;
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
    background-color: #007AFF;
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
