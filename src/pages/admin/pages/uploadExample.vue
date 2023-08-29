<template>
    <div>
        <UploadOss v-model="uploadObj.list" :path="'/'"/>
    </div>
</template>

<script setup>
import UploadOss from '../../../components/UploadOss.vue';
import { reactive, watch } from 'vue';

const uploadObj = reactive({
    list: []
})

watch(
    () => uploadObj.list, 
    (val) => {
        console.log('val::', val)
    }, 
    {
        deep:true, // 深度监听
        immediate:true // 立即执行
    })
</script>