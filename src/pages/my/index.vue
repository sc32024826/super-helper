<template>
    <view class="my-page">
        <!-- 头像区域 -->
        <view class="avatar-container">
            <image :src="avatarUrl" mode="aspectFill" class="avatar" />
        </view>
        <!-- 用户信息区域 -->
        <view class="user-info">
            <view class="info-item">
                <text class="info-label">真实名称</text>
                <text class="info-value">{{ realName }}</text>
            </view>
            <view class="info-item">
                <text class="info-label">绑定账号</text>
                <text class="info-value">{{ boundAccount }}</text>
            </view>
        </view>
    </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { userStore } from '@/store'
import { onLoad } from '@dcloudio/uni-app'

const userStoreInstance = userStore()

// 定义响应式数据
const avatarUrl = ref('')
const realName = ref('')
const boundAccount = ref('')

onLoad(() => {
    avatarUrl.value = userStoreInstance.avatar
    realName.value = userStoreInstance.realName
    boundAccount.value = userStoreInstance.phone
})
</script>

<style lang="scss" scoped>
.my-page {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 2rem;
    min-height: 100vh;

    .avatar-container {
        width: 120px;
        height: 120px;
        border-radius: 50%;
        overflow: hidden;
        margin-bottom: 2rem;
        border: 1px solid black;
        // box-shadow: 0 0 20px rgba(0, 255, 255, 0.5);

        .avatar {
            width: 100%;
            height: 100%;
        }
    }

    .user-info {
        width: 100%;
        max-width: 300px;

        .info-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem 0;
            border-bottom: 1px solid #333333;

            .info-label {
                font-weight: bold;
            }

            .info-value {
                // color: #cccccc;/
            }
        }
    }
}
</style>
