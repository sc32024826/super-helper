<template>
    <!-- Start Generation Here -->
    <div class="login-container">
        <button class="login-button" type="primary" open-type="getUserInfo" @getuserinfo="getUserInfo">登录</button>
    </div>
    <!-- End Generation Here -->

</template>

<script setup lang="ts">
import { ref } from 'vue'

const getUserInfo = () => {
    console.log('111');
    
}
</script>

<style></style>
