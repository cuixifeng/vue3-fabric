import { createStore } from 'vuex'
import request from '@/service/request'

export default createStore({
    state: {
        isClose: true,
        activeModule: null,
        imageList: [],
        loadOk: false,
        icons: [],
        selectedItem: null, // 选中的画布元素
        workspace: null, // 画布对象
        currentItem: null, //当前点击选择的元素
        recorder: [], // 操作记录
        alllayers: [] // 所有图层
    },
    getters: {},
    mutations: {
        setClose(state, value) {
            state.isClose = value
        },
        setActiveModule(state, value) {
            state.activeModule = value
        },
        Ok(state, value) {
            state.loadOk = true
            state.imageList = value
        },
        COMMIT_ICONS(state, value) {
            state.icons = value
        },
        setActivateItem(state, value) {
            state.selectedItem = value
        },
        setCurrentItem(state, value) {
            state.currentItem = value
            state.selectedItem = value
        },
        setWorkarea(state, value) {
            state.workspace = value
        },
        setRecorder(state, value) {
            state.recorder = value
        },
        addRecorderEvent(state, event) {
            // 将单个事件追加到数组
            state.recorder.push(event)
        },
        clearRecorder(state) {
            // 清空已录制事件
            state.recorder = []
        },
        setLayers(state, value) {
            state.alllayers = value
        }
    },
    actions: {
        getMaterial({ commit }) {
            const pro = []
            pro.push(
                request({
                    url: 'https://haixin-fang.github.io/vue-design-editor-static/imglist.json',
                    timeout: 10000,
                    methods: 'get'
                })
            )
            pro.push(
                request({
                    url: 'https://haixin-fang.github.io/icons/bootstrap-icons.json',
                    timeout: 10000,
                    methods: 'get'
                })
            )
            Promise.all(pro).then((data) => {
                if (Array.isArray(data)) {
                    if (data[0]) {
                        commit('Ok', data[0])
                    }
                    if (data[1]) {
                        const values = Object.keys(data[1])
                        const icons: any = []
                        values.forEach((item) => {
                            const url = `https://haixin-fang.github.io/icons/icons/${item}.svg`
                            icons.push({
                                url
                            })
                        })
                        commit('COMMIT_ICONS', icons)
                    }
                }
            })
        }
    },
    modules: {}
})
