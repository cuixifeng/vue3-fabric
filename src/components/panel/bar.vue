<template>
    <div class="bar"></div>
</template>
<script>
import { mapState } from 'vuex'

export default {
    components: {},
    props: {
        onChange: {
            type: Function
        },
        canvasRef: {
            type: Object
        },
        barShow: {
            type: Array,
            default: () => ['locked', 'layer', 'flip', 'copy', 'delete']
        },
        poi: {
            type: String,
            default: 'bottom'
        }
    },

    computed: {
        ...mapState(['currentItem', 'workspace']),
        islocked() {
            return false
        }
    },
    inject: {
        canvas: {
            from: 'canvas'
        },
        handler: {
            from: 'handler'
        }
    },
    data() {
        return {
            locked: { locked: false },
            isTip: false
        }
    },

    methods: {
        getBarShow(type) {
            return this.barShow.includes(type)
        },
        handleDelete() {
            const canvas = this.canvas
            console.log(this.currentItem)
            if (this.currentItem) {
                canvas.remove(this.currentItem) // 删除对象
                canvas.renderAll() // 渲染画布
            }
        }
    },
    watch: {
        currentItem: {
            handler(newValue) {
                // 在这里处理 currentItem 变化的逻辑
                if (newValue) {
                    if (newValue.id == 'workarea') {
                        this.isTip = false
                    } else {
                        this.isTip = true
                    }
                    // 判断当前选中的元素是否为工作区
                    newValue.id == 'workarea'
                        ? (this.locked.locked = false)
                        : (this.locked.locked = newValue.lockMovementX)
                } else {
                    console.log('没有选中的元素')
                    this.locked.locked = false
                }
            },
            immediate: true, // 立即执行一次
            deep: true // 深度监听对象变化
        }
    }
}
</script>
<style lang="scss" scoped>
.bar {
    position: relative;
    text-align: left;
    display: inline-flex;
    align-items: center;

    .icon_noactive {
        :deep(.switch) {
            color: #bec3c9;
            cursor: not-allowed;
            font-size: 20px;
        }
    }
    .func-content {
        color: #000;
        border: none;
        border-radius: 4px;
        font-weight: 500;
        // padding: 0 12px;
        line-height: 40px;
        display: inline-flex;
        flex: 1;
        justify-content: space-between;
        align-items: center;
        width: 32px;
        height: 32px;
        padding: 0;
        font-size: var(--font-size-medium);
        border-radius: var(--border-radius-medium);
        cursor: pointer;
        &:first-child {
            margin-left: -4px;
        }
        .icon_noactive {
            color: #bec3c9;
            cursor: not-allowed;
        }
        > i,
        > div {
            width: 100%;
            // font-size: 20px;
            display: flex;
            justify-content: center;
        }
        &:hover {
            color: #222529;
            background: rgba(0, 0, 0, 0.04);
        }
    }
}
</style>
