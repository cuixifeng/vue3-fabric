<!--
 * @Author: 'cuixifneg' '5387080+cuixifneg@user.noreply.gitee.com'
 * @Date: 2025-10-09 09:35:02
 * @LastEditors: 'cuixifneg' '5387080+cuixifneg@user.noreply.gitee.com'
 * @LastEditTime: 2025-10-09 09:35:12
 * @FilePath: \vue-edtior-fabric\src\page\Replay.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
    <div class="replay-page">
        <div class="toolbar">
            <button @click="startReplay">开始回放</button>
        </div>
        <div id="replay-container" class="container"></div>
    </div>
</template>

<script setup>
import { onMounted } from 'vue'
import rrwebPlayer from 'rrweb-player'
import 'rrweb-player/dist/style.css'

function getEventsFromStorage() {
    try {
        const raw = localStorage.getItem('rrwebEvents')
        if (!raw) return []
        const events = JSON.parse(raw)
        return Array.isArray(events) ? events : []
    } catch (e) {
        console.warn('读取事件失败:', e)
        return []
    }
}

function startReplay() {
    const events = getEventsFromStorage()
    if (!Array.isArray(events) || events.length < 2) {
        console.warn('回放需要至少两个录制事件，请返回录制页面进行操作。')
        return
    }
    const target = document.getElementById('replay-container')
    if (!target) return
    target.innerHTML = ''
    new rrwebPlayer({
        target,
        props: {
            events,
            speedOption: [1, 2, 5, 10],
            UNSAFE_replayCanvas: true
        }
    })
}

onMounted(() => {
    // 进入页面后尝试回放
    startReplay()
})
</script>

<style scoped>
.replay-page {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 8px;
}
.container {
    width: 100%;
    height: calc(100vh - 80px);
}
.toolbar {
    display: flex;
    gap: 8px;
}
</style>
