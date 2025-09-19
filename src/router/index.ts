import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import Editor from '../page/editor.vue'
import Canvas from '../components/workarea/canvas.vue'
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
    }
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

export default router
