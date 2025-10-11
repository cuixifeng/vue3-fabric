<template>
    <div class="resource-station__panel page-scrollbar_container" v-if="activeModule">
        <div class="add" v-if="activeModule.type == 'add'">
            <div class="addList" v-for="(list, index) in addData" :key="index">
                <div class="header">
                    <div class="title">{{ list.title }}</div>
                </div>
                <div class="container">
                    <div class="list">
                        <div class="content">
                            <div
                                class="addItem"
                                @click="handlerOption(list.type, item.type)"
                                v-for="(item, vindex) in list.list"
                                :key="vindex"
                            >
                                <el-upload
                                    v-if="list.type == 'image'"
                                    :show-file-list="false"
                                    :auto-upload="false"
                                    :on-change="(e) => uploadImage(e, 'background')"
                                >
                                    <div class="img-icon">
                                        <img :src="item.icon" alt="" />
                                    </div>
                                    <div class="name" v-if="item.title">{{ item.title }}</div>
                                </el-upload>

                                <template v-else>
                                    <div class="img-icon">
                                        <img :src="item.icon" alt="" />
                                    </div>
                                    <div class="name" v-if="item.title">{{ item.title }}</div>
                                </template>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="material" v-if="activeModule.type == 'material'">
            <div class="nav-container">
                <div class="navlist">
                    <div
                        class="navItem"
                        @click="selectItem = null"
                        :class="!selectItem ? 'navItemActive' : ''"
                    >
                        全部
                    </div>
                    <div
                        class="navItem"
                        v-for="item in materialList.slice(0, 4)"
                        :class="selectItem && selectItem.title == item.title ? 'navItemActive' : ''"
                        :key="item.id"
                        @click="onChange(item)"
                    >
                        {{ item.title }}
                    </div>
                    <el-dropdown
                        @command="onChange"
                        v-if="materialList.length > 4"
                        class="navItem"
                        popper-class="navItem"
                        trigger="click"
                        :teleported="false"
                    >
                        <span class="el-dropdown-link">
                            更多
                            <el-icon class="el-icon--right">
                                <arrow-down />
                            </el-icon>
                        </span>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item
                                    :command="item"
                                    v-for="item in materialList.slice(4)"
                                    :key="item.id"
                                    ><span
                                        :class="
                                            selectItem && selectItem.title == item.title
                                                ? 'navItemActive'
                                                : ''
                                        "
                                        >{{ item.title }}</span
                                    ></el-dropdown-item
                                >
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                </div>
            </div>
            <div class="material-container">
                <div class="container page-scrollbar_container">
                    <div class="panel-block" v-for="item in materialList" :key="item.id">
                        <panel-block
                            :title="item.title"
                            subTitle="查看更多"
                            @change="onChange(item)"
                        />
                        <div class="panel-content">
                            <div class="panel-batch" v-if="item.interval">
                                <div
                                    class="material-detail"
                                    v-for="i in getIndex(item.interval).slice(0, 8)"
                                    :key="i"
                                >
                                    <el-image
                                        :src="`${repoSrc}svg/${i}.svg`"
                                        lazy
                                        :draggable="true"
                                        @dragstart="handleDragStart($event, item, i)"
                                    ></el-image>
                                </div>
                            </div>
                            <div class="panel-batch" v-else>
                                <div
                                    class="material-detail"
                                    style="width: 60px; height: 60px"
                                    v-for="(item, index) in icons.slice(0, 8)"
                                    :key="index"
                                >
                                    <el-image
                                        :src="item.url"
                                        lazy
                                        :draggable="true"
                                        @dragstart="handleDragStart($event, item)"
                                    ></el-image>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <transition name="anime">
                    <div class="detail-list page-scrollbar_container" v-if="selectItem">
                        <template v-if="selectItem.interval">
                            <div
                                class="detail-item"
                                v-for="item in getIndex(selectItem.interval)"
                                :key="item"
                            >
                                <el-image
                                    style="width: 88px; height: 88px"
                                    :src="`${repoSrc}svg/${item}.svg`"
                                    :draggable="true"
                                    @dragstart="handleDragStart($event, item)"
                                    lazy
                                ></el-image>
                            </div>
                        </template>
                        <template v-else-if="icons && icons.length > 0">
                            <div class="detail-item" v-for="(item, index) in icons" :key="index">
                                <el-image
                                    style="width: 88px; height: 88px"
                                    :src="item.url"
                                    :draggable="true"
                                    @dragstart="handleDragStart($event, item)"
                                    lazy
                                ></el-image>
                            </div>
                        </template>
                    </div>
                </transition>
            </div>
        </div>
        <div class="Image" v-if="activeModule.type == 'Image'">
            <Waterifall :list="imageList" :column="2">
                <template v-slot="{ item }">
                    <el-image
                        :src="item.url"
                        loading="lazy"
                        lazy
                        @dragstart="handleDragStart($event, item)"
                    >
                        <template #placeholder>
                            <div class="image-slot"></div>
                        </template>
                    </el-image>
                </template>
            </Waterifall>
        </div>
        <div class="Img" v-if="activeModule.type == 'Img'">
            <div
                @click="selectlayer(index + 1, item)"
                :class="['layer', selectIndex === index + 1 ? 'active' : '']"
                v-for="(item, index) in state.alllayers.slice(1)"
                :key="item.id"
            >
                <div v-if="item.type != 'textbox'" class="image">
                    <img :src="item.src" alt="layer" />
                </div>
                <div class="text" v-else>
                    {{ item.text }}
                </div>
                <div v-if="selectIndex === index + 1" class="del" @click.stop="moveLayerDown(item)">
                    <svg
                        width="1.2em"
                        height="1.2em"
                        xmlns="http://www.w3.org/2000/svg"
                        xmlns:xlink="http://www.w3.org/1999/xlink"
                        viewBox="0 0 23.76 29.241"
                        class="icon"
                    >
                        <g class="b">
                            <path
                                fill="currentColor"
                                d="M5.286,19.191a1.154,1.154,0,1,0,1.632,1.632l3.8-3.8V28.087a1.154,1.154,0,0,0,2.308,0V17.022l3.8,3.8a1.154,1.154,0,1,0,1.632-1.632L12.689,13.42a1.153,1.153,0,0,0-1.632,0Z"
                            ></path>
                            <path
                                fill="#fff"
                                stroke="currentColor"
                                stroke-miterlimit="10"
                                stroke-width="2"
                                d="M22.76,2.793v4.5a1.793,1.793,0,0,1-1.793,1.793H2.793A1.793,1.793,0,0,1,1,7.289v-4.5A1.793,1.793,0,0,1,2.793,1H20.967A1.793,1.793,0,0,1,22.76,2.793"
                            ></path>
                            <rect
                                fill="currentColor"
                                width="21.76"
                                height="8.082"
                                rx="1.793"
                                transform="translate(1 1)"
                            ></rect>
                        </g>
                    </svg>
                </div>
                <div v-if="selectIndex === index + 1" class="del" @click.stop="moveLayerUp(item)">
                    <svg
                        width="1.2em"
                        height="1.2em"
                        xmlns="http://www.w3.org/2000/svg"
                        xmlns:xlink="http://www.w3.org/1999/xlink"
                        viewBox="0 0 23.76 29.241"
                        class="icon"
                    >
                        <g class="b">
                            <path
                                fill="currentColor"
                                d="M18.473,10.05a1.154,1.154,0,1,0-1.632-1.632l-3.8,3.8V1.154a1.154,1.154,0,1,0-2.308,0V12.219l-3.8-3.8A1.154,1.154,0,0,0,5.3,10.05l5.771,5.771a1.153,1.153,0,0,0,1.632,0Z"
                            ></path>
                            <path
                                fill="#fff"
                                stroke="currentColor"
                                stroke-miterlimit="10"
                                stroke-width="2"
                                d="M1,26.448v-4.5a1.793,1.793,0,0,1,1.793-1.793H20.967a1.793,1.793,0,0,1,1.793,1.793v4.5a1.793,1.793,0,0,1-1.793,1.793H2.793A1.793,1.793,0,0,1,1,26.448"
                            ></path>
                            <rect
                                fill="currentColor"
                                width="21.76"
                                height="8.082"
                                rx="1.793"
                                transform="translate(1 20.159)"
                            ></rect>
                        </g>
                    </svg>
                </div>
                <!-- <div @click="deletItem(item)" class="del">
                    <svg
                        width="1.2em"
                        height="1.2em"
                        xmlns="http://www.w3.org/2000/svg"
                        xmlns:xlink="http://www.w3.org/1999/xlink"
                        viewBox="0 0 23.8 28"
                        class="icon"
                    >
                        <g fill="currentColor">
                            <g class="b" transform="translate(0 0)">
                                <path
                                    class="c"
                                    d="M14.155,2.1a.7.7,0,0,1,.686.563L15.289,4.9H8.511l.447-2.237A.7.7,0,0,1,9.645,2.1ZM17.43,4.9,16.9,2.251A2.8,2.8,0,0,0,14.155,0H9.645A2.8,2.8,0,0,0,6.9,2.251L6.37,4.9H1.05a1.05,1.05,0,1,0,0,2.1h.9L3.626,24.206A4.2,4.2,0,0,0,7.806,28h8.186a4.2,4.2,0,0,0,4.181-3.794L21.846,7h.9a1.05,1.05,0,0,0,0-2.1ZM19.736,7,18.084,24a2.1,2.1,0,0,1-2.091,1.9H7.806A2.1,2.1,0,0,1,5.717,24L4.064,7ZM8.75,13.3a1.05,1.05,0,1,1,2.1,0v6.3a1.05,1.05,0,0,1-2.1,0ZM14,12.25a1.05,1.05,0,0,0-1.05,1.05v6.3a1.05,1.05,0,0,0,2.1,0V13.3A1.051,1.051,0,0,0,14,12.25"
                                    transform="translate(0 0)"
                                ></path>
                            </g>
                        </g>
                    </svg>
                </div> -->
            </div>
        </div>
    </div>
</template>
<script setup>
import { computed, shallowRef, ref, inject, watch, nextTick } from 'vue'
import { useStore } from 'vuex'
import { addTab } from '@/constants/addtab'
import material from '@/constants/material'
import { ArrowDown } from '@element-plus/icons-vue'
import PanelBlock from '@/common/panel-block.vue'
import Waterifall from '@/common/waterfall.vue'
import { ElImage, ElDropdown, ElDropdownMenu, ElDropdownItem, ElIcon, ElUpload } from 'element-plus'

const store = useStore()
const { state } = store
const repoSrc = ref('https://haixin-fang.github.io/vue-design-editor-static/')
const selectItem = ref()
const selectIndex = ref(0) //选中层级
const handler = inject('handler')
const canvas = inject('canvas')
const workspace = computed(() => {
    return state.workspace
})
const activeModule = computed(() => {
    return state.activeModule
})

const imageList = computed(() => {
    if (state.imageList) {
        state.imageList.forEach((item) => {
            item.url = repoSrc.value + 'image/' + item.url
        })
        return state.imageList
    }
    return []
})

const selectlayer = (index, targetObject) => {
    selectIndex.value = index
    if (handler.value && targetObject) {
        handler.value.select(targetObject)
        // 同步更新store中的currentItem
        store.commit('setCurrentItem', targetObject)
    }
}

// 监听store中currentItem的变化，同步更新selectIndex
watch(
    () => state.currentItem,
    (newCurrentItem) => {
        if (newCurrentItem && canvas.value) {
            // 获取所有对象（跳过第一个背景对象）
            const allObjects = canvas.value.getObjects().slice(1)
            // 找到当前选中对象在图层列表中的索引
            const index = allObjects.findIndex((obj) => obj === newCurrentItem)
            if (index !== -1) {
                // 更新selectIndex（+1是因为显示时从1开始计数）
                selectIndex.value = index + 1
            } else if (newCurrentItem.id === 'workarea' || !newCurrentItem.id) {
                // 如果选中的是工作区或空白区域，重置选中状态
                selectIndex.value = 0
            }
        } else {
            // 如果没有选中任何对象，重置选中状态
            selectIndex.value = 0
        }
    },
    { immediate: true }
)

// 升序操作：图层在列表中向上移动（在画布中向后移动）
const moveLayerUp = (targetObject) => {
    if (handler.value && targetObject) {
        handler.value.bringForward(targetObject)
        // handler.value.sendBackwards(targetObject)
        console.log('move up', canvas.value.getObjects())
        // 更新图层列表
        updateLayersList()
        // 更新selectIndex以跟随移动的图层
        updateSelectIndexAfterMove(targetObject)
    }
}

// 降序操作：图层在列表中向下移动（在画布中向前移动）
const moveLayerDown = (targetObject) => {
    console.log('move Down', canvas.value.getObjects())
    if (handler.value && targetObject) {
        handler.value.sendBackwards(targetObject)
        // 更新图层列表
        updateLayersList()
        // 更新selectIndex以跟随移动的图层
        updateSelectIndexAfterMove(targetObject)
    }
}

// 在图层移动后更新selectIndex
const updateSelectIndexAfterMove = (targetObject) => {
    // 等待下一个tick，确保图层列表已更新
    nextTick(() => {
        if (canvas.value) {
            const allObjects = canvas.value.getObjects()
            // 跳过第一个对象（背景），找到目标对象的新索引
            const newIndex = allObjects.slice(1).findIndex((obj) => obj === targetObject)
            if (newIndex !== -1) {
                selectIndex.value = newIndex + 1
            }
        }
    })
}

// 更新图层列表状态
const updateLayersList = () => {
    if (canvas.value) {
        store.commit('setLayers', canvas.value.getObjects())
    }
}
const deletItem = (target) => {
    if (selectIndex.value > 0) {
        canvas.value.remove(target)
        canvas.value.renderAll()
    }
}

const icons = computed(() => {
    return state.icons
})

const addData = shallowRef(addTab)
const materialList = shallowRef(material.map((item, index) => ({ ...item, id: index })))
function onChange(item) {
    selectItem.value = item
}

const getIndex = ([start, end]) => {
    const arr = Array(end - (start - 1)).fill('')
    return arr.map((item, i) => i + start)
}

function handleDragStart(e, item, i) {
    if (activeModule.value.type == 'material') {
        item.type = 'Image'
    } else {
        item.type = activeModule.value.type
    }
    if (item.interval) {
        item.url = `${repoSrc.value}svg/${i}.svg`
    }
    e.dataTransfer.setData('item', JSON.stringify(item))
}

function handlerOption(type, itemType) {
    if (type == 'image') {
        console.log('image')
    } else {
        const urlMap = {
            VT323: 'url(https://fonts.gstatic.com/s/vt323/v17/pxiKyp0ihIEF2isfFJXUdVNF.woff2)',
            Pacifico:
                'url(https://fonts.gstatic.com/s/pacifico/v22/FwZY7-Qmy14u9lezJ-6H6MmBp0u-.woff2)'
        }
        // correctly instantiate new Fontfaces
        const fontVT323 = new FontFace('VT323', urlMap.VT323, {
            style: 'normal',
            weight: 'normal'
        })
        const fontPacifico = new FontFace('Pacifico', urlMap.Pacifico, {
            style: 'normal',
            weight: 'normal'
        })

        // // wait for them to load
        Promise.all([fontVT323.load(), fontPacifico.load()]).then(() => {
            // add the css to the document for those loaded fonts
            document.fonts.add(fontVT323)
            document.fonts.add(fontPacifico)
            const random = parseInt(Math.random() * 80)
            var option = {
                width: 500,
                height: 500,
                fontSize: itemType == 'h1' ? 220 : 180,
                name: '自定义字体',
                text: 'Hello',
                type: 'textbox',
                fontFamily: itemType == 'Aa' ? 'VT323' : itemType == '3D' ? 'Pacifico' : 'Arial',
                left: workspace.value.left + workspace.value.width / 2 - 150 - random,
                top: workspace.value.top + workspace.value.height / 2 - 15 - random
            }
            handler.value.add(option)
        })

        // console.log(type,itemType)
    }
}
async function uploadImage(e, type = 'Image') {
    console.log(e)
    if (e) {
        await handler.value.utils.fileUpload(e.raw, e.name, type)
    }
}
</script>
<style lang="scss" scoped>
::v-deep .el-upload {
    display: flex;
    flex-direction: column;
}
.anime-enter-from,
.anime-leave-to {
    left: 100% !important;
}
.anime-enter-to,
.anime-leave-from {
    left: 0 !important;
}
.anime-enter-active {
    transition: left 0.3s cubic-bezier(0.08, 0.82, 0.17, 1);
}
.anime-leave-active {
    transition: left 0.3s cubic-bezier(0.78, 0.14, 0.15, 0.86);
}
.navItemActive {
    color: #2254f4;
}
.resource-station__panel {
    position: relative;
    z-index: 1;
    height: 100%;
    width: 100%;
    cursor: default;
    overflow: auto;
    background-color: #ffffff;
    &::-webkit-scrollbar {
        width: 0;
        height: 0;
    }
    .add {
        display: flex;
        flex-direction: column;
        .addList {
            margin-bottom: 16px;
            &:first-child {
                margin-top: 8px;
            }
            .header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                height: 36px;
                padding: 0 16px;
                .title {
                    display: flex;
                    flex: 1;
                    flex-grow: 1;
                    align-items: center;
                    width: 100%;
                    height: 100%;
                    font: var(--text-p1-bold);
                    color: var(--text-color-primary);
                }
            }
            .container {
                margin: 4px 0 0;
                .list {
                    display: flex;
                    align-items: center;
                    min-height: 40px;
                    padding: 0 16px;
                    .content {
                        // display: flex;
                        display: grid;
                        // flex-wrap: wrap;
                        flex: 1;
                        grid-template-columns: repeat(3, 33%);
                        grid-column-gap: 10px;
                        width: 100%;
                        font: var(--text-p1-regular);
                        color: var(--text-color-primary);
                        .addItem {
                            margin-right: 8px;
                            margin-bottom: 8px;
                            position: relative;
                            display: flex;
                            width: 88px;
                            flex-direction: column;
                            align-items: center;
                            justify-content: center;
                            font: var(--text-p2-regular);
                            line-height: 18px;
                            color: var(--text-color-secondary);
                            text-align: center;
                            background-color: var(--background-color-tertiary-regular);
                            border-radius: var(--border-radius-large);
                            cursor: pointer;
                            -webkit-user-select: none;
                            user-select: none;
                            padding: 15px 22px;
                            .img-icon {
                                width: 40px;
                                height: 40px;
                            }
                            &:nth-child(3n + 3) {
                                margin-right: 0;
                            }
                            .name {
                                margin-top: 6px;
                                white-space: nowrap;
                            }
                        }
                    }
                }
            }
        }
    }
    .material {
        display: flex;
        width: 100%;
        height: 100%;
        flex-direction: column;
        align-items: center;
        .nav-container {
            padding: 16px;
            .navlist {
                display: flex;
                flex-wrap: wrap;
                .navItem {
                    color: var(--actionbutton-color-regular);
                    background-color: #f1f2f4;
                    border-color: rgba(0, 0, 0, 0);
                    font-weight: 400;
                    height: 32px;
                    padding: 0 12px;
                    font-size: 14px;
                    border-radius: var(--border-radius-medium);
                    position: relative;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    white-space: nowrap;
                    text-align: center;
                    background-image: none;
                    border-color: transparent;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
                    -webkit-user-select: none;
                    -moz-user-select: none;
                    user-select: none;
                    touch-action: manipulation;
                    vertical-align: middle;
                    margin-bottom: 4px;
                    margin-left: 4px;
                    &.navItemActive {
                        background-color: #2254f4;
                        color: white;
                    }
                    &:not(.navItemActive):hover {
                        color: #222529;
                        background-color: #e8eaec;
                        border-color: rgba(0, 0, 0, 0);
                    }
                    .el-icon {
                        margin-left: 0;
                    }
                }
            }
        }
        .material-container {
            flex: 1;
            width: 100%;
            position: relative;
            overflow: hidden;
            &.disabled-scroll {
                overflow: hidden;
            }
            .container {
                overflow: auto;
                height: 100%;
                width: 100%;
            }

            .detail-list {
                width: 100%;
                height: 100%;
                overflow: auto;
                display: flex;
                flex-wrap: wrap;
                align-self: center;
                position: absolute;
                top: 0;
                left: 0;
                z-index: 2;
                background: white;
                justify-content: space-around;
                padding: 0 16px;
                align-content: flex-start;
                .detail-item {
                    background: rgb(241, 242, 244);
                    transition: all 0.1s ease-in;
                    margin-bottom: 8px;
                    &:hover {
                        background-color: rgb(232, 234, 236);
                    }
                }
            }
            .panel-content {
                display: flex;
                flex: 1;
                flex-grow: 1;
                align-items: center;
                width: 100%;
                font: var(--text-p1-regular);
                color: var(--text-color-primary);
                min-height: 40px;
                padding: 0 16px;
                margin: 8px 0 16px;
                .panel-batch {
                    display: flex;
                    flex-wrap: wrap;
                    align-items: center;
                    padding: 4px;
                    background: #f1f2f4;
                    border-radius: var(--border-radius-large);
                    display: grid;
                    grid-template-columns: repeat(4, 25%);
                }
                .material-detail {
                    margin: 4px;
                    border-radius: 8px;
                    width: 60px;
                    height: 60px;
                    display: flex;
                    align-items: center;
                    justify-content: center;

                    background: rgb(241, 242, 244);
                    transition: all 0.1s ease-in;
                    img {
                        width: 100%;
                        height: 100%;
                    }
                    &:hover {
                        background-color: rgb(232, 234, 236);
                    }
                }
            }
        }
    }
}
:deep(img[draggable='true']) {
    cursor: pointer;
}
.Image {
    padding: 5px;
    .el-image {
        width: 100%;
        min-height: 100px;
    }
    .image-slot {
        // display: flex;
        // justify-content: center;
        // align-items: center;
        // width: 100%;
        // height: 100%;
        // background: #f5f7fa;
        // color: #a8abb2;
        // font-size: 14px;
        position: absolute;
        top: 0;
        z-index: 3;
        width: 100%;
        height: 100%;
        overflow: hidden;
        background: linear-gradient(90deg, #f2f2f2 25%, #e6e6e6 37%, #f2f2f2 63%);
        background-size: 400% 100%;
        animation: dui-skeleton-loading 1.4s ease infinite;
    }
    @keyframes dui-skeleton-loading {
        0% {
            background-position: 100% 50%;
        }
        100% {
            background-position: 0% 50%;
        }
    }
    .dot {
        animation: dot 2s infinite steps(3, start);
        overflow: hidden;
    }
}
.Img {
    padding: 10px;
}
.layer.active {
    background-color: #e6e6e6;
}
.layer .image {
    width: 0;
    height: 100%;
    display: -webkit-box;
    display: -webkit-flex;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-pack: center;
    -webkit-justify-content: center;
    -ms-flex-pack: center;
    justify-content: center;
    -webkit-box-align: center;
    -webkit-align-items: center;
    -ms-flex-align: center;
    align-items: center;
    -webkit-box-flex: 1;
    -webkit-flex: 1;
    -ms-flex: 1;
    flex: 1;
    border-radius: 0.5rem;
    overflow: hidden;
    background: #f9fafb;
}
.layer .del {
    -webkit-flex-shrink: 0;
    -ms-flex-negative: 0;
    flex-shrink: 0;
    display: -webkit-box;
    display: -webkit-flex;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-pack: center;
    -webkit-justify-content: center;
    -ms-flex-pack: center;
    justify-content: center;
    -webkit-box-align: center;
    -webkit-align-items: center;
    -ms-flex-align: center;
    align-items: center;
    width: 2rem;
    height: 2rem;
    border-radius: 0.5rem;
    font-size: 1.125rem;
    color: #6b7280;
    background: #6b72801a;
    -webkit-transition: all 0.2s ease;
    transition: all 0.2s ease;
}
.layer {
    width: 100%;
    height: 4rem;
    position: relative;
    margin-bottom: 0.5rem;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    display: -webkit-box;
    display: -webkit-flex;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-pack: center;
    -webkit-justify-content: center;
    -ms-flex-pack: center;
    justify-content: center;
    -webkit-box-align: center;
    -webkit-align-items: center;
    -ms-flex-align: center;
    align-items: center;
    padding: 0.75rem 1rem;
    border-radius: 0.75rem;
    gap: 0.75rem;
    background: #fff;
    border: 1px solid #e5e7eb;
    -webkit-box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    box-shadow: 0 1px 3px #0000000d;
    -webkit-transition: all 0.2s ease;
    transition: all 0.2s ease;
    cursor: pointer;
}
.layer .text {
    width: 0;
    height: 100%;
    display: -webkit-box;
    display: -webkit-flex;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-pack: start;
    -webkit-justify-content: flex-start;
    -ms-flex-pack: start;
    justify-content: flex-start;
    -webkit-box-align: center;
    -webkit-align-items: center;
    -ms-flex-align: center;
    align-items: center;
    -webkit-box-flex: 1;
    -webkit-flex: 1;
    -ms-flex: 1;
    flex: 1;
    padding: 0 0.5rem;
}
.layer .image img {
    height: 85%;
    -o-object-fit: contain;
    object-fit: contain;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    pointer-events: none;
    border-radius: 0.375rem;
    -webkit-box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    box-shadow: 0 1px 3px #0000001a;
}
</style>
