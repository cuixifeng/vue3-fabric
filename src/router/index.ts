import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import Editor from '../page/editor.vue'
import Canvas from '../components/workarea/canvas.vue'
import Replay from '../page/Replay.vue'
const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        name: 'home',
        component: Editor
    },
    {
        path: '/test',
        name: 'test',
        component: Canvas
    },
    {
        path: '/replay',
        name: 'replay',
        component: Replay
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
