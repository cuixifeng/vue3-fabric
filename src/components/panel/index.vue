<template>
    <div class="editor-props-panel">
        <div class="tab-panel">
            <div class="tab-scrollbar__container">
                <div class="panel-block">
                    <div class="panel-block__header">
                        <div class="panel-block__header-title">画布</div>
                    </div>
                    <div class="panel-block__content">
                        <div class="gda-space-item">
                            <!-- <div class="panel-row">
                                <div class="panel-row__label">尺寸</div>
                                <div class="panel-row__content" v-if="workspace">
                                    {{ parseInt(workspace.width) }} ×
                                    {{ parseInt(workspace.height) }} px
                                </div>
                            </div> -->
                            <div class="gda-space-item">
                                <div class="panel-row">
                                    <div class="panel-row__content">
                                        <button
                                            class="right-canvas-resize-btn"
                                            @click="sizeShow = true"
                                        >
                                            调整尺寸
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="panel-block">
                    <div class="panel-block__header">
                        <div class="panel-block__header-title">背景色</div>
                        <div class="panel-block__header-action">
                            <div class="popup popover">
                                <div
                                    ref="colorRound"
                                    class="swatch--shape-round"
                                    :style="`${getBgColor()}`"
                                    @click="colorShow = true"
                                ></div>
                                <popover
                                    :dom="colorRound"
                                    :show="colorShow"
                                    placement="left"
                                    @close="colorShow = false"
                                >
                                    <template v-slot="{ setSlotRef }">
                                        <div class="content" :ref="(el) => setSlotRef(el)">
                                            <Color @select="selectColor" />
                                        </div>
                                    </template>
                                </popover>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-if="currentItem && currentItem.id != 'workarea'" class="panel-block">
                    <div class="panel-block__header">
                        <div class="panel-block__header-title">水平方向控制</div>
                    </div>
                    <div class="panel-block__content">
                        <div class="gda-space-item">
                            <div class="panel-row">
                                <div class="gda-space-item">
                                    <div
                                        class="panel-row__label"
                                        style="display: flex; align-items: center"
                                    >
                                        <div style="flex: 1">X轴</div>
                                        <el-switch v-model="X" style="margin-left: 100px" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="panel-block__content">
                        <div class="gda-space-item">
                            <div class="panel-row">
                                <div class="gda-space-item">
                                    <div
                                        class="panel-row__label"
                                        style="display: flex; align-items: center"
                                    >
                                        <div style="flex: 1">Y轴</div>
                                        <el-switch v-model="Y" style="margin-left: 100px" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="panel-block__header">
                        <div class="panel-block__header-title">位置信息</div>
                    </div>
                    <div class="panel-block__content">
                        <div class="gda-space-item">
                            <div class="panel-row">
                                <div class="gda-space-item">
                                    <div class="panel-row__label">X</div>
                                    <div class="panel-row__content">
                                        <el-input
                                            v-model="left"
                                            style="width: 240px"
                                            autosize
                                            type="number"
                                            placeholder="Please input"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="panel-block__content">
                        <div class="gda-space-item">
                            <div class="panel-row">
                                <div class="gda-space-item">
                                    <div class="panel-row__label">Y</div>
                                    <div class="panel-row__content">
                                        <el-input
                                            v-model="top"
                                            style="width: 240px"
                                            autosize
                                            type="number"
                                            placeholder="Please input"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="panel-block__content">
                        <div class="gda-space-item">
                            <div class="panel-row">
                                <div class="gda-space-item">
                                    <div class="panel-row__label">旋转角度</div>
                                    <div class="panel-row__content">
                                        <el-input
                                            v-model="angle"
                                            style="width: 240px"
                                            autosize
                                            placeholder="Please input"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-if="currentItem && currentItem.type == 'Image'" class="panel-block">
                    <!-- 🎛️基础调整 -->
                    <div class="panel-block__header">
                        <div class="panel-block__header-title">🎛️基础调整</div>
                    </div>
                    <div class="panel-block__content">
                        <div class="gda-space-item">
                            <div class="panel-row">
                                <div class="gda-space-item">
                                    <div class="panel-row__label">亮度</div>
                                    <div class="panel-row__content">
                                        <el-slider
                                            :min="-1"
                                            :max="1"
                                            :step="0.01"
                                            v-model="brightnessValue"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="panel-block__content">
                        <div class="gda-space-item">
                            <div class="panel-row">
                                <div class="gda-space-item">
                                    <div class="panel-row__label">对比度</div>
                                    <div class="panel-row__content">
                                        <el-slider
                                            :min="-1"
                                            :max="1"
                                            :step="0.01"
                                            v-model="contrastValue"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="panel-block__content">
                        <div class="gda-space-item">
                            <div class="panel-row">
                                <div class="gda-space-item">
                                    <div class="panel-row__label">饱和度</div>
                                    <div class="panel-row__content">
                                        <el-slider
                                            :min="-1"
                                            :max="1"
                                            :step="0.01"
                                            v-model="saturationValue"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 色彩效果 -->
                    <div class="panel-block__header">
                        <div class="panel-block__header-title">🌈 色彩效果</div>
                    </div>
                    <div class="panel-block__content">
                        <div class="gda-space-item">
                            <div class="panel-row">
                                <div class="gda-space-item">
                                    <div class="panel-row__label">色相旋转</div>
                                    <div class="panel-row__content">
                                        <el-slider
                                            :min="0"
                                            :max="360"
                                            :step="1"
                                            v-model="hueRotationValue"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 特效滤镜 -->
                    <div class="panel-block__header">
                        <div class="panel-block__header-title">✨ 特效滤镜</div>
                    </div>
                    <div class="panel-block__content">
                        <div class="gda-space-item">
                            <div class="panel-row">
                                <div class="gda-space-item">
                                    <div class="panel-row__label">模糊度</div>
                                    <div class="panel-row__content">
                                        <el-slider
                                            :min="0"
                                            :max="1"
                                            :step="0.01"
                                            v-model="blurValue"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="panel-block__content">
                        <div class="gda-space-item">
                            <div class="panel-row">
                                <div class="gda-space-item">
                                    <div class="panel-row__label">噪点强度</div>
                                    <div class="panel-row__content">
                                        <el-slider
                                            :min="0"
                                            :max="1000"
                                            :step="10"
                                            v-model="noiseValue"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="panel-block__content">
                        <div class="gda-space-item">
                            <div class="panel-row">
                                <div class="gda-space-item">
                                    <div class="panel-row__label">像素化</div>
                                    <div class="panel-row__content">
                                        <el-slider
                                            :min="1"
                                            :max="20"
                                            :step="1"
                                            v-model="pixelateValue"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="panel-block__content">
                        <div class="gda-space-item">
                            <div class="panel-row">
                                <div class="gda-space-item">
                                    <div class="panel-row__content">
                                        <button
                                            class="right-canvas-resize-btn"
                                            @click="resetAllFilters"
                                        >
                                            重置滤镜
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <button
                        v-if="currentItem && currentItem.type == 'Image'"
                        class="cutImg"
                        @click="open"
                    >
                        图片裁剪
                    </button>
                </div>
                <div v-if="currentItem && currentItem.type == 'textbox'" class="panel-block">
                    <div class="panel-block__header">
                        <div class="panel-block__header-title">文字效果</div>
                    </div>
                    <div class="panel-block__content">
                        <div class="gda-space-item">
                            <div class="panel-row">
                                <div class="gda-space-item">
                                    <div class="panel-row__label">内容</div>
                                    <div class="panel-row__content">
                                        <el-input
                                            v-model="textarea1"
                                            style="width: 240px"
                                            autosize
                                            type="textarea"
                                            placeholder="Please input"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="panel-block__content">
                        <div class="gda-space-item">
                            <div class="panel-row">
                                <div class="gda-space-item">
                                    <div class="panel-row__label">字体大小</div>
                                    <div class="panel-row__content">
                                        <el-input
                                            v-model="fontSize"
                                            style="width: 240px"
                                            autosize
                                            type="number"
                                            placeholder="Please input"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="panel-block__content">
                        <div class="gda-space-item">
                            <div class="panel-row">
                                <div class="gda-space-item">
                                    <div class="panel-row__label">阴影效果</div>
                                    <div class="panel-row__content">
                                        <Color @select="selectShadow" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="panel-block__content">
                        <div class="gda-space-item">
                            <div class="panel-row">
                                <div class="gda-space-item">
                                    <div class="panel-row__label">阴影模糊</div>
                                    <div class="panel-row__content">
                                        <el-input
                                            v-model="shadowBlur"
                                            style="width: 240px"
                                            type="number"
                                            placeholder="模糊半径"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="panel-block__content">
                        <div class="gda-space-item">
                            <div class="panel-row">
                                <div class="gda-space-item">
                                    <div class="panel-row__label">水平偏移</div>
                                    <div class="panel-row__content">
                                        <el-input
                                            v-model="shadowOffsetX"
                                            style="width: 240px"
                                            type="number"
                                            placeholder="水平偏移"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="panel-block__content">
                        <div class="gda-space-item">
                            <div class="panel-row">
                                <div class="gda-space-item">
                                    <div class="panel-row__label">垂直偏移</div>
                                    <div class="panel-row__content">
                                        <el-input
                                            v-model="shadowOffsetY"
                                            style="width: 240px"
                                            type="number"
                                            placeholder="垂直偏移"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="panel-block__content">
                        <div class="gda-space-item">
                            <div class="panel-row">
                                <div class="gda-space-item">
                                    <div class="panel-row__label">粗细</div>
                                    <div class="panel-row__content">
                                        <el-select
                                            v-model="fontWeight"
                                            placeholder="Select"
                                            style="width: 240px"
                                        >
                                            <el-option label="normal" value="normal" />
                                            <el-option label="bold" value="bold" />
                                            <el-option label="bolder" value="bolder" />
                                        </el-select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="panel-block__content">
                        <div class="gda-space-item">
                            <div class="panel-row">
                                <div class="gda-space-item">
                                    <div class="panel-row__label">斜体</div>
                                    <div class="panel-row__content">
                                        <el-select
                                            v-model="fontStyle"
                                            placeholder="Select"
                                            style="width: 240px"
                                        >
                                            <el-option label="normal" value="normal" />
                                            <el-option label="italic" value="italic" />
                                        </el-select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="panel-block__content">
                        <div class="gda-space-item">
                            <div class="panel-row">
                                <div class="gda-space-item">
                                    <div class="panel-row__label">间距</div>
                                    <div class="panel-row__content">
                                        <el-input
                                            v-model="charSpacing"
                                            style="width: 240px"
                                            autosize
                                            type="number"
                                            placeholder="Please input"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <Cutting
            ref="popupRef"
            width="1000px"
            custom-class="body-padding"
            :title="`选择裁剪区域`"
            @confirm="handleConfirm"
            @close="handleClose"
        />
        <transition name="anime">
            <workspace-size v-if="sizeShow" @back="sizeShow = false" />
        </transition>
    </div>
</template>
<script lang="ts">
import { ElInput, ElSelect, ElOption, ElSwitch, ElSlider } from 'element-plus'
import { panel } from '@/constants/panel'
import { ref, computed, inject, shallowRef, watch } from 'vue'
import { useStore } from 'vuex'
import Cutting from './cutting.vue'
import WorkspaceSize from './workspace-size.vue'
// const Color = () => import("./color.vue");
import Color from './color.vue'
import { template } from 'lodash-es'
export default {
    components: {
        WorkspaceSize,
        Color,
        Cutting,
        ElInput,
        ElSelect,
        ElOption,
        ElSwitch,
        ElSlider
    },
    props: {
        onChange: {
            type: Function
        }
    },
    setup(props) {
        const headtool = ref(panel)
        const type = ref('design')
        const sizeShow = ref(false)
        const colorShow = ref(false)
        const colorRound = ref()
        const { state } = useStore()
        const handler = inject('handler')
        const canvas = inject('canvas')
        const textarea1 = ref('在这里输入文字')
        const fontSize = ref(40)
        const left = ref(0)
        const top = ref(0)
        const angle = ref(0)
        const openCut = ref(false)
        const fontWeight = ref('normal')
        const fontStyle = ref('normal')
        const charSpacing = ref(0)
        const X = ref(false)
        const Y = ref(false)
        const brightnessValue = ref(0)

        // 滤镜参数
        const contrastValue = ref(0) // 对比度 (-1 到 1)
        const saturationValue = ref(0) // 饱和度 (-1 到 1)
        const hueRotationValue = ref(0) // 色相旋转 (0 到 360)
        const blurValue = ref(0) // 模糊度 (0 到 1)
        const noiseValue = ref(0) // 噪点强度 (0 到 1000)
        const pixelateValue = ref(1) // 像素化 (1 到 20)

        // 阴影相关数据
        const shadowBlur = ref(10)
        const shadowOffsetX = ref(5)
        const shadowOffsetY = ref(5)
        const shadowColor = ref('rgba(0, 0, 0, 0.3)')

        const popupRef = shallowRef<InstanceType<typeof Cutting>>()

        const workspace = computed(() => {
            return state.workspace
        })
        const currentItem = computed(() => {
            return state.currentItem
        })
        const selectedItem = computed(() => {
            return state.selectedItem
        })
        const bgObject = computed(() => {
            if (selectedItem.value && selectedItem.value.type == 'background') {
                return selectedItem.value
            }
            return null
        })

        // 文字对象属性处理器映射
        const textPropertyHandlers = {
            text: (activeObject, value) => {
                activeObject.set('text', value)
            },
            fontSize: (activeObject, value) => {
                activeObject.set('fontSize', parseInt(value) || 40)
            },
            fontWeight: (activeObject, value) => {
                activeObject.set('fontWeight', value)
            },
            fontStyle: (activeObject, value) => {
                activeObject.set('fontStyle', value)
            },
            charSpacing: (activeObject, value) => {
                activeObject.set('charSpacing', parseInt(value) || 0)
            },
            shadow: (activeObject) => {
                console.log(shadowColor.value, 'shadowColor.value')
                // 设置阴影
                const shadow = {
                    color: shadowColor.value,
                    blur: parseInt(shadowBlur.value) || 10,
                    offsetX: parseInt(shadowOffsetX.value) || 5,
                    offsetY: parseInt(shadowOffsetY.value) || 5
                }
                activeObject.set({ shadow })
            },
            X: (activeObject, value) => {
                activeObject.set('lockMovementX', value)
            },
            Y: (activeObject, value) => {
                activeObject.set('lockMovementY', value)
            },
            angle: (activeObject, value) => {
                activeObject.rotate(parseInt(value) || 0)
                // activeObject.set('angle', parseInt(value) || 0)
            },
            left: (activeObject, value) => {
                activeObject.set('left', parseInt(value) || 0)
            },
            top: (activeObject, value) => {
                activeObject.set('top', parseInt(value) || 0)
            }
        }

        // 检查是否为文字类型对象
        const isTextObject = (obj) => {
            const textTypes = ['textbox', 'FontCustom', 'text', 'i-text', 'Image']
            return obj && textTypes.includes(obj.type)
        }

        // 监听文字相关属性变化，同步到选中的文字图层
        const updateTextObject = (property, value) => {
            const activeObject = canvas.value?.getActiveObject()

            if (!isTextObject(activeObject)) {
                return
            }

            const handler = textPropertyHandlers[property]
            if (handler) {
                handler(activeObject, value)

                activeObject.setCoords()
                canvas.value.renderAll()

                // 触发选择事件更新状态
                if (handler.value && handler.value.onSelect) {
                    handler.value.onSelect(activeObject)
                }
            }
        }

        // 更新阴影的方法
        const updateShadow = () => {
            updateTextObject('shadow', null)
        }

        // 统一的watch监听器配置
        const textWatchConfig = [
            { ref: X, property: 'X' },
            { ref: Y, property: 'Y' },
            { ref: angle, property: 'angle' },
            { ref: left, property: 'left' },
            { ref: top, property: 'top' },
            { ref: textarea1, property: 'text' },
            { ref: fontSize, property: 'fontSize' },
            { ref: fontWeight, property: 'fontWeight' },
            { ref: fontStyle, property: 'fontStyle' },
            { ref: charSpacing, property: 'charSpacing' }
        ]

        // 阴影相关属性监听配置
        const shadowWatchRefs = [shadowBlur, shadowOffsetX, shadowOffsetY]

        // 批量创建文字属性监听器
        textWatchConfig.forEach(({ ref, property }) => {
            watch(ref, (newValue) => {
                updateTextObject(property, newValue)
            })
        })

        // 批量创建阴影属性监听器
        shadowWatchRefs.forEach((shadowRef) => {
            watch(shadowRef, updateShadow)
        })

        const resetAllFilters = () => {
            if (currentItem.value && currentItem.value.type === 'Image') {
                const filters = currentItem.value.filters
                filters.length = 0 // 清空所有滤镜
                brightnessValue.value = 0 // 亮度 (-1 到 1)
                contrastValue.value = 0 // 对比度 (-1 到 1)
                saturationValue.value = 0 // 饱和度 (-1 到 1)
                hueRotationValue.value = 0 // 色相旋转 (0 到 360)
                blurValue.value = 0 // 模糊度 (0 到 1)
                noiseValue.value = 0 // 噪点强度 (0 到 1000)
                pixelateValue.value = 1 // 像素化 (1 到 20)
                currentItem.value.applyFilters()
                canvas.value.renderAll()
            }
        }

        // 通用滤镜应用函数
        const applyFilter = (filterType, propertyName, value) => {
            if (currentItem.value && currentItem.value.type === 'Image') {
                const filters = currentItem.value.filters || []
                const existingFilter = filters.find((f) => f.type === filterType)

                if (existingFilter) {
                    existingFilter[propertyName] = value
                } else {
                    const FilterClass = fabric.Image.filters[filterType]
                    if (FilterClass) {
                        const filterConfig = {}
                        filterConfig[propertyName] = value
                        filters.push(new FilterClass(filterConfig))
                    }
                }

                currentItem.value.filters = filters
                currentItem.value.applyFilters()
                canvas.value.renderAll()
            }
        }

        // 滤镜配置映射
        const filterConfigs = [
            { ref: brightnessValue, type: 'Brightness', property: 'brightness' },
            { ref: contrastValue, type: 'Contrast', property: 'contrast' },
            { ref: saturationValue, type: 'Saturation', property: 'saturation' },
            { ref: hueRotationValue, type: 'HueRotation', property: 'rotation' },
            { ref: blurValue, type: 'Blur', property: 'blur' },
            { ref: noiseValue, type: 'Noise', property: 'noise' },
            { ref: pixelateValue, type: 'Pixelate', property: 'blocksize' }
        ]

        // 批量创建滤镜监听器
        filterConfigs.forEach(({ ref, type, property }) => {
            watch(ref, (newValue) => {
                applyFilter(type, property, newValue)
            })
        })
        // 监听当前选中项变化，更新面板数据
        watch(
            currentItem,
            (newItem) => {
                if (newItem) {
                    // 重置所有滤镜值为默认值
                    brightnessValue.value = 0
                    contrastValue.value = 0
                    saturationValue.value = 0
                    hueRotationValue.value = 0
                    blurValue.value = 0
                    noiseValue.value = 0
                    pixelateValue.value = 1

                    // 如果当前图层有滤镜，回显对应的值
                    if (newItem.filters && newItem.filters.length > 0) {
                        newItem.filters.forEach((filter) => {
                            switch (filter.type) {
                                case 'Brightness':
                                    brightnessValue.value = filter.brightness || 0
                                    break
                                case 'Contrast':
                                    contrastValue.value = filter.contrast || 0
                                    break
                                case 'Saturation':
                                    saturationValue.value = filter.saturation || 0
                                    break
                                case 'HueRotation':
                                    hueRotationValue.value = filter.rotation || 0
                                    break
                                case 'Blur':
                                    blurValue.value = filter.blur || 0
                                    break
                                case 'Noise':
                                    noiseValue.value = filter.noise || 0
                                    break
                                case 'Pixelate':
                                    pixelateValue.value = filter.blocksize || 1
                                    break
                            }
                        })
                    }

                    X.value = newItem.lockMovementX || false
                    Y.value = newItem.lockMovementY || false
                    console.log(newItem, newItem.top)
                    left.value = parseInt(newItem.left) || 0
                    top.value = parseInt(newItem.top) || 0
                    angle.value = parseInt(newItem.angle) || 0
                }
                if (
                    newItem &&
                    (newItem.type === 'textbox' ||
                        newItem.type === 'FontCustom' ||
                        newItem.type === 'text' ||
                        newItem.type === 'i-text')
                ) {
                    // 更新面板数据以反映当前选中文字对象的属性
                    textarea1.value = newItem.text || '在这里输入文字'
                    fontSize.value = newItem.fontSize || 40
                    fontWeight.value = newItem.fontWeight || 'normal'
                    fontStyle.value = newItem.fontStyle || 'normal'
                    charSpacing.value = newItem.charSpacing || 0

                    // 更新阴影相关数据
                    if (newItem.shadow) {
                        shadowColor.value = newItem.shadow.color || 'rgba(0, 0, 0, 0.3)'
                        shadowBlur.value = newItem.shadow.blur || 10
                        shadowOffsetX.value = newItem.shadow.offsetX || 5
                        shadowOffsetY.value = newItem.shadow.offsetY || 5
                    } else {
                        shadowColor.value = 'rgba(0, 0, 0, 0.3)'
                        shadowBlur.value = 10
                        shadowOffsetX.value = 5
                        shadowOffsetY.value = 5
                    }
                }
            },
            { immediate: true, deep: true }
        )

        function selectColor(value) {
            props.onChange(null, value)
        }
        function selectShadow(value) {
            console.log(value, 'selectShadow')
            // 设置阴影颜色
            shadowColor.value = value.fill

            updateShadow()
        }
        async function handleSubmit() {
            popupRef.value?.close()
        }

        function handleConfirm() {
            // 处理确认逻辑
            popupRef.value?.close()
        }

        function handleClose() {
            // 处理关闭逻辑
            openCut.value = false
        }

        function open() {
            console.log(popupRef.value)
            popupRef.value?.open()
        }
        return {
            resetAllFilters,
            brightnessValue,
            contrastValue,
            saturationValue,
            hueRotationValue,
            blurValue,
            noiseValue,
            pixelateValue,
            X,
            Y,
            left,
            top,
            angle,
            fontStyle,
            fontWeight,
            charSpacing,
            textarea1,
            fontSize,
            shadowBlur,
            shadowOffsetX,
            shadowOffsetY,
            shadowColor,
            headtool,
            sizeShow,
            workspace,
            selectColor,
            selectShadow,
            bgObject,
            colorRound,
            colorShow,
            selectedItem,
            openCut,
            handleSubmit,
            handleConfirm,
            handleClose,
            open,
            popupRef,
            currentItem,
            getActiveClass(panelItem) {
                if (Array.isArray(panelItem.type)) {
                    return panelItem.type.includes(type.value) ? 'tabActive' : ''
                }
                return panelItem.type == type.value ? 'tabActive' : ''
            },
            selectTabs(item) {
                type.value = item.type
            },
            getActiveTab(panelItem) {
                return panelItem.type == type.value
            },
            onTabShow(item) {
                if (item.showList) {
                    if (selectedItem.value) {
                        const { type } = selectedItem.value
                        if (item.showList.includes(type)) {
                            return true
                        }
                        return false
                    }
                } else {
                    return true
                }
            },
            async uploadImage(e, type = 'Image') {
                if (e) {
                    await handler.value.utils.fileUpload(e.raw, e.name, type)
                }
            },
            getBgColor() {
                if (!workspace.value) return
                if (typeof workspace.value.fill == 'string') {
                    return `background: ${workspace.value.fill}`
                } else if (workspace.value.backgroundColor) {
                    return `background: ${workspace.value.backgroundColor}`
                }
            },
            onflip() {
                props.onChange(bgObject.value, { scaleX: -1 })
                const zoom = canvas.value.getZoom()
                handler.value.workareaHandler.setZoomAuto(zoom)
            },
            bgToImage() {
                handler.value.workareaHandler.bgToImage()
            },
            remove() {
                handler.value.remove(bgObject.value)
            },
            toGroup() {
                handler.value.toGroup()
            },
            nogroup() {
                handler.value.nogroup()
            }
        }
    }
}
</script>
<style lang="scss" scoped>
.editor-props-panel {
    position: relative;
    background-color: #fff;
    box-sizing: border-box;
    height: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    .anime-enter-from,
    .anime-leave-to {
        left: 100%;
    }
    .anime-enter-to,
    .anime-leave-from {
        left: 0;
    }
    .anime-enter-active {
        transition: left 0.3s cubic-bezier(0.08, 0.82, 0.17, 1);
    }
    .anime-leave-active {
        transition: left 0.3s cubic-bezier(0.78, 0.14, 0.15, 0.86);
    }
    .tab-panel {
        flex: 1;
        position: relative;
        width: 100%;
        height: 100%;
        overflow: hidden;
        .tab-scrollbar__container {
            position: relative;
            z-index: 1;
            width: 100%;
            height: 100%;
            overflow: auto;
            scrollbar-width: none;
            cursor: default;
            .panel-block {
                margin-bottom: 16px;
                &:after {
                    display: block;
                    width: auto;
                    margin: 16px 16px 0;
                    border-top: var(--border-width-small) solid rgba(0, 0, 0, 0.08);
                    content: '';
                }
                .panel-block__header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    height: 36px;
                    padding: 0 16px;
                    & + .panel-block__content {
                        margin-top: 4px;
                    }
                    .panel-block__header-title {
                        display: flex;
                        flex: 1;
                        flex-grow: 1;
                        align-items: center;
                        width: 100%;
                        height: 100%;
                        font: var(--text-p1-bold);
                        color: var(--text-color-primary);
                    }
                    .panel-block__header-action {
                        display: flex;
                        flex: 1;
                        flex-grow: 1;
                        align-items: center;
                        justify-content: flex-end;
                        height: 100%;
                        font: var(--text-p2-regular);
                        color: var(--text-color-secondary);
                        .popup {
                            display: inline-block;
                            cursor: pointer;
                            .swatch--shape-round {
                                border-radius: 4px;
                                width: 24px;
                                height: 24px;
                                background: linear-gradient(
                                    0deg,
                                    rgb(133, 234, 143) 0%,
                                    rgb(240, 252, 105) 29%,
                                    rgb(237, 251, 197) 67%,
                                    rgb(215, 240, 132) 100%
                                );
                                --0e969546: 4px;
                                --62d7e12a: #4c535c;
                                --4bff1efa: rgba(0, 0, 0, 0.12);
                                border: 1px solid rgba(0, 0, 0, 0.24);
                            }
                        }
                    }
                }
                .panel-block__content {
                    margin: 16px 0;
                    display: flex;
                    flex-direction: column;
                    .gda-space-item {
                        width: 100%;
                        .panel-row {
                            display: flex;
                            align-items: center;
                            min-height: 40px;
                            padding: 0 16px;
                            width: 100%;
                            text-align: left;
                            justify-content: space-between;
                            &.panel-row-bg {
                                flex-direction: column;
                                .opacity {
                                    margin-top: 8px;
                                    width: 100%;
                                }
                            }
                            .panel-row-image {
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                height: 120px;
                                padding: 16px;
                                background: #f1f2f4;
                                width: 100%;
                                position: relative;
                                border-radius: var(--border-radius-large);
                                .background-edit-control__tools {
                                    position: absolute;
                                    top: 8px;
                                    right: 4px;
                                    z-index: 1;
                                    display: flex;
                                    align-items: center;
                                    i {
                                        width: 24px;
                                        height: 24px;
                                        padding: 0;
                                        font-size: 14px;
                                        border-radius: var(--border-radius-small);
                                        background: white;
                                        display: flex;
                                        align-items: center;
                                        justify-content: center;
                                        margin-right: 4px;
                                    }
                                }
                                &:hover {
                                    .panel-row__content {
                                        display: block !important;
                                        position: absolute;
                                        bottom: 8px;
                                        z-index: 1;
                                        width: 60%;
                                        padding: 0 8px;
                                        animation: background-edit-control-fade-in 0.5s forwards;
                                        .right-canvas-resize-btn {
                                            background-color: white;
                                            height: 30px;
                                        }
                                    }
                                    &::before {
                                        position: absolute;
                                        top: 0;
                                        left: 0;
                                        width: 100%;
                                        height: 100%;
                                        background-color: rgba(0, 0, 0, 0.08);
                                        border-radius: var(--border-radius-large);
                                        content: '';
                                        opacity: 0;
                                        animation: background-edit-control-fade-in 0.5s forwards;
                                    }
                                }
                                img {
                                    max-width: 100%;
                                    max-height: 100%;
                                    object-fit: contain;
                                    background-color: #b8b8b8;
                                    border-radius: var(--border-radius-large);
                                    background-image: linear-gradient(
                                            45deg,
                                            #ccc 25%,
                                            transparent 0
                                        ),
                                        linear-gradient(45deg, transparent 75%, #ccc 0),
                                        linear-gradient(45deg, #ccc 25%, transparent 0),
                                        linear-gradient(45deg, transparent 75%, #ccc 0);
                                    background-position: 0 0, 5px 5px, 5px 5px, 10px 10px;
                                    background-size: 10px 10px;
                                    box-shadow: 0px 0px 2px 0px rgba(0, 0, 0, 0.08),
                                        0px 4px 12px 0px rgba(0, 0, 0, 0.04);
                                }
                            }
                            .panel-row__label {
                                min-width: 80px;
                                font: var(--text-p1-regular);
                                color: var(--text-color-secondary);
                            }
                            .panel-row__content {
                                display: flex;
                                flex: 1;
                                flex-grow: 1;
                                align-items: center;
                                justify-content: flex-end;
                                width: 100%;
                                font: var(--text-p1-regular);
                                color: var(--text-color-primary);
                                > div {
                                    width: 100%;
                                    :deep(.el-upload) {
                                        width: 100%;
                                    }
                                }
                                .right-canvas-resize-btn {
                                    color: #222529;
                                    background-color: #f1f2f4;
                                    border-color: rgba(0, 0, 0, 0);
                                    font-weight: 400;
                                    width: 100%;
                                    height: 40px;
                                    padding: 0 16px;
                                    outline: 0;
                                    font-size: 14px;
                                    border-radius: var(--border-radius-large);
                                    &:hover {
                                        color: #222529;
                                        background-color: #e8eaec;
                                        border-color: rgba(0, 0, 0, 0);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    .tab-panel-header {
        display: flex;
        box-sizing: border-box;
        padding: 8px 0;
        flex-direction: column;
        border-bottom: var(--border-width-small) solid rgba(0, 0, 0, 0.08);
        .tab-panel-bloack_content {
            display: flex;
            align-items: center;
            padding: 0 16px 0;
        }
    }
    .tab-panel-block__header {
        width: 100%;
        display: flex;
        flex-wrap: nowrap;
        overflow-x: auto;
        background: white;
        z-index: 2;
        align-items: center;
        // justify-content: space-between;
        height: 36px;
        padding: 0 16px;

        .tabActive {
            color: #33383e;
        }

        .tab-button {
            padding: 4.5px 0 6.5px;
            font-weight: 500;
            margin-right: 16px;
            font-size: 14px;
            line-height: 20px;
            position: relative;
            cursor: pointer;
            border: none;
            outline: none;
            user-select: none;
            color: #9da3ac;
            background-color: #fff;
            .tab-content {
                position: relative;
                white-space: nowrap;
                font: var(--text-p1-bold);
            }
        }
    }
}

@keyframes background-edit-control-fade-in {
    0% {
        opacity: 0;
    }
    100% {
        opacity: 1;
    }
}
.cutImg {
    width: 100%;
    // position: absolute;
    // bottom: 10px;
}
</style>
