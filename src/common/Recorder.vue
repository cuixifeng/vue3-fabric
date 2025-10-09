<template>
    <!-- <button @click="startRecording">开始录制</button> -->
    <button @click="openReplayPage">回放</button>
    <div></div>
</template>

<script setup>
import * as rrweb from 'rrweb'
import { useStore } from 'vuex'

const store = useStore()
let recorder = null

const startRecording = () => {
    // 启动录制前清空历史事件
    // store.commit('clearRecorder')
    recorder = rrweb.record({
        emit(event) {
            // 将事件逐条追加到数组
            console.log('录制事件:', event)
            store.commit('addRecorderEvent', event)
        },
        // 录制 Fabric 的 canvas 操作
        recordCanvas: true,
        // 可选采样率：降低帧率以减少事件体积（根据性能调整）
        sampling: {
            canvas: 20
        },
        // 可选图片格式设置：压缩画布帧，减少事件体积
        dataURLOptions: {
            type: 'image/webp',
            quality: 0.6
        }
    })
}

startRecording()
// 在新页面回放：将事件写入 localStorage，然后打开 /#/replay
const openReplayPage = () => {
    recorder()
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
    const newWindow = window.open(url, '_blank')

    if (newWindow) {
        const timer = setInterval(() => {
            if (newWindow.closed) {
                clearInterval(timer)
                startRecording()
            }
        }, 1000)
    }
}
</script>
