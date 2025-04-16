<template>
    <view></view>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'

// const getUserInfo = () => {
//     uni.login({
//         provider: 'weixin',
//         success: (res) => {
//             console.log(res);

//             uni.getUserInfo({
//                 provider: 'weixin',
//                 success: (result) => {
//                     console.log(result);
//                     // userInfo.nickName = result.userInfo.nickName
//                     // userInfo.avatarUrl = result.userInfo.avatarUrl
//                     http.post('/api/sys/wxlogin', { code: res.code, encryptedData: result.encryptedData, iv: result.iv }).then(ret => {
//                         console.log(ret);

//                     })
//                 },
//             })
//         },
//     })
// }


onMounted(() => {

    // 临时存储 token
    uni.setStorage({
        key:'token',
        data: 'pat_Xbefq7nXVeRTtVmPtPm4APwvK6z2XCt3Jo6zSJfI1V5lWrif482DDxHBRvnxt1aP'
    })
    uni.redirectTo({
        url:'/pages/home/index',
    })
    //     console.log('初始化');
    //     uni.login({
    //         provider: 'weixin',
    //         success: (res) => {
    //             console.log(res);
    //             http.post('/api/sys/wxlogin', { code: res.code }).then(ret => {
    //                 console.log(ret);

    //             })
    //             // uni.getUserInfo({
    //             //     provider:'weixin',
    //             //     success:(result)=>{
    //             //         console.log(result);

    //             //     },
    //             // })
    //         },
    //     })
})

</script>

<style></style>
