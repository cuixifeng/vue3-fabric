<template>
    <div class="counte">
        <!-- <button @click="startPlayback">开始回放</button> -->
        <button @click="openReplayPage">新窗口回放</button>
        <div id="playback"></div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useStore } from 'vuex'
import rrwebPlayer from 'rrweb-player'
import 'rrweb-player/dist/style.css'
const store = useStore()
//回放实例
const replayer = ref(null)
onMounted(() => {
    // 页面加载时尝试回放（若事件不足会直接返回）
    startPlayback()
})
// //4.点击回放
const startPlayback = () => {
    const events = store.state.recorder
    // rrweb-player 至少需要两个事件（如快照 + 变化）
    if (!Array.isArray(events) || events.length < 2) {
        console.warn('回放需要至少两个录制事件，请先进行录制操作。')
        return
    }
    const target = document.getElementById('playback')
    if (!target) return
    // 清空容器，避免重复创建导致叠加
    target.innerHTML = ''
    replayer.value = new rrwebPlayer({
        target, // 可以自定义 DOM 元素
        props: {
            events,
            speedOption: [1, 2, 5, 10],
            // 启用 Canvas 回放（与录制端的 recordCanvas 配套）
            UNSAFE_replayCanvas: true
        },
        showController: false
    })
}

// 在新页面回放：将事件写入 localStorage，然后打开 /#/replay
const openReplayPage = () => {
    const events = store.state.recorder
    if (!Array.isArray(events) || events.length < 2) {
        console.warn('回放需要至少两个录制事件，请先进行录制操作。')
        return
    }
    try {
        localStorage.setItem('rrwebEvents', JSON.stringify(events))
    } catch (e) {
        console.error('写入回放事件失败:', e)
    }
    const url = `${window.location.origin}/#/replay`
    window.open(url, '_blank')
}
</script>

<style>
.n {
    display: none;
}
</style>
