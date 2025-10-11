import WorkareaHandler from './WorkareaHandler'
import FabricHandler from './FabricHandler'
import UitlsHandler from './UtilsHandler'
import ImageHandler from './ImageHandler'
import ControlHandler from './ControlHandler'
import { WorkareaOption, WorkareaObject, FabricImage } from '@/types/utils'
import { objectOption, propertiesToInclude } from '../constants/workspace'
import { v4 as uuid } from 'uuid'
import _ from '@/utils/_'
import '@/core/FabricObjects'
export interface HandlerOption {
    /**
     * 工作区默认配置
     */
    workareaOption: WorkareaOption
    /**
     * fabric实例
     */
    canvas?: any
    /*
     * 画布顶部dom
     */
    container?: HTMLDivElement
    utils?: UitlsHandler
    onAdd: (target: WorkareaObject) => void
    onSelect: (target: any) => void
    init?: () => void
    /**
     * 画布是否可编辑
     */
    editable?: boolean
    /**
     * 工作区对象
     */
    [key: string]: any
}

export type HandlerOptions = HandlerOption

interface FabricOptions {
    [key: string]: any
}

class Handler implements HandlerOptions {
    public workareaOption
    public workareaHandler: WorkareaHandler
    public fabricObjects: FabricHandler & FabricOptions
    public utils: UitlsHandler
    public imageHandler: ImageHandler
    public objectOption?: any = objectOption
    private control: ControlHandler
    public propertiesToInclude = propertiesToInclude
    public isimporting = false
    public canvas
    public onAdd
    public onSelect
    public init
    public editable
    public container

    undo() {
        // undo方法现在由FabricHistory类处理
        this.canvas.undo()
        this.canvas.renderAll()
    }

    redo() {
        // redo方法现在由FabricHistory类处理
        this.canvas.redo()
        this.canvas.renderAll()
    }

    constructor(options: HandlerOptions) {
        this.workareaOption = options.workareaOption
        this.canvas = options.canvas
        this.container = options.container
        this.editable = options.editable
        this.onAdd = options.onAdd
        this.init = options.init
        this.onSelect = options.onSelect

        this.workareaHandler = new WorkareaHandler(this)
        this.fabricObjects = new FabricHandler(this)
        this.utils = new UitlsHandler(this)
        this.imageHandler = new ImageHandler(this)
        this.control = new ControlHandler()

        this.initialize(options)
    }

    async initialize(options: HandlerOptions) {
        const { init } = this
        this.initOption(options)

        // 设置全局高清渲染配置
        this.setupHighQualityRendering()

        // 设置scaling事件处理
        this.setupScalingEvents()

        // 设置删除处理器
        // this.control.setDeleteHandler((target: any) => {
        //   this.remove(target);
        // });

        // 设置画布尺寸为1000x2000
        this.workareaHandler.setSize(1000, 2000)
        init && init()
    }

    // 设置高质量渲染配置
    setupHighQualityRendering() {
        // 获取设备像素比
        const devicePixelRatio = window.devicePixelRatio || 1

        // 设置Fabric.js全局渲染优化
        const fabric = require('fabric').fabric

        // 全局图片渲染优化
        fabric.Image.prototype.crossOrigin = 'anonymous'
        fabric.Image.prototype.objectCaching = false
        fabric.Image.prototype.statefullCache = true
        fabric.Image.prototype.noScaleCache = true
        fabric.Image.prototype.strokeUniform = true
        fabric.Image.prototype.dirty = true
        fabric.Image.prototype.perPixelTargetFind = true

        // 文本渲染优化
        fabric.Text.prototype.objectCaching = false
        fabric.Text.prototype.statefullCache = true
        fabric.Text.prototype.strokeUniform = true
        fabric.Text.prototype.dirty = true
        fabric.Text.prototype.fontFamily = 'Arial, "Microsoft YaHei", sans-serif'
        fabric.Text.prototype.fontSize = 16
        fabric.Text.prototype.fontWeight = 'normal'
        fabric.Text.prototype.charSpacing = 0
        fabric.Text.prototype.lineHeight = 1.2

        // 路径和形状渲染优化
        fabric.Path.prototype.objectCaching = false
        fabric.Path.prototype.strokeUniform = true
        fabric.Path.prototype.dirty = true
        fabric.Path.prototype.strokeLineCap = 'round'
        fabric.Path.prototype.strokeLineJoin = 'round'

        // 通用对象渲染优化
        fabric.Object.prototype.objectCaching = false
        fabric.Object.prototype.statefullCache = true
        fabric.Object.prototype.noScaleCache = true
        fabric.Object.prototype.strokeUniform = true
        fabric.Object.prototype.dirty = true

        // 画布渲染优化
        if (this.canvas) {
            this.canvas.enableRetinaScaling = true
            this.canvas.imageSmoothingEnabled = true
            this.canvas.renderOnAddRemove = true
            this.canvas.skipTargetFind = false
            this.canvas.perPixelTargetFind = true

            // 设置画布上下文的高质量渲染
            const ctx = this.canvas.getContext()
            if (ctx) {
                // 如果是高DPI设备，确保上下文缩放正确
                if (devicePixelRatio > 1) {
                    ctx.scale(devicePixelRatio, devicePixelRatio)
                }

                ctx.imageSmoothingEnabled = true
                ctx.imageSmoothingQuality = 'high'
                ctx.textRenderingOptimization = 'optimizeQuality'

                // 设置字体渲染优化
                if ('textRendering' in ctx) {
                    ;(ctx as any).textRendering = 'optimizeLegibility'
                }
            }

            // 设置上层canvas的高质量渲染
            const upperCtx = this.canvas.upperCanvasEl?.getContext('2d')
            if (upperCtx) {
                if (devicePixelRatio > 1) {
                    upperCtx.scale(devicePixelRatio, devicePixelRatio)
                }
                upperCtx.imageSmoothingEnabled = true
                upperCtx.imageSmoothingQuality = 'high'
            }

            // 强制重新渲染以应用设置
            this.canvas.requestRenderAll()
        }

    }

    // 设置scaling事件处理
    setupScalingEvents() {
        if (!this.canvas) return

        // 对象开始缩放事件
        this.canvas.on('object:scaling', (e: any) => {
            const target = e.target
            if (target && target.id !== 'workarea') {
                // 缩放过程中的处理逻辑
                this.onObjectScaling(target)
            }
        })

        // 对象缩放完成事件
        this.canvas.on('object:scaled', (e: any) => {
            const target = e.target
            if (target && target.id !== 'workarea') {
                // 缩放完成后的处理逻辑
                this.onObjectScaled(target)
            }
        })
    }

    // 对象正在缩放时的处理
    onObjectScaling(target: any) {
        // 可以在这里添加缩放过程中的限制逻辑
        // 例如：最小/最大缩放比例限制
        const minScale = 0.1
        const maxScale = 10

        if (target.scaleX < minScale) {
            target.scaleX = minScale
        }
        if (target.scaleY < minScale) {
            target.scaleY = minScale
        }
        if (target.scaleX > maxScale) {
            target.scaleX = maxScale
        }
        if (target.scaleY > maxScale) {
            target.scaleY = maxScale
        }

        // 实时更新对象坐标
        target.setCoords()
    }

    // 对象缩放完成时的处理
    onObjectScaled(target: any) {
        // 缩放完成后的处理逻辑
        console.log(`对象 ${target.type} (ID: ${target.id}) 缩放完成`)
        console.log(`最终尺寸: ${target.width * target.scaleX} x ${target.height * target.scaleY}`)

        // 更新对象坐标
        target.setCoords()

        // 触发选择事件，更新属性面板
        if (this.onSelect) {
            this.onSelect(target)
        }

        // 重新渲染画布
        this.canvas.renderAll()

        // 可以在这里添加历史记录保存等逻辑
        // this.saveHistory();
    }

    initOption = (options: HandlerOptions) => {
        // 默认配置
        this.setObjectOption(options.objectOption)
    }

    setObjectOption = (objectOption: any) => {
        this.objectOption = Object.assign({}, this.objectOption, objectOption)
    }

    select = (obj: WorkareaObject, find = false) => {
        let findObject: WorkareaObject | null = obj
        if (find) {
            findObject = this.utils.find(obj)
        }
        if (findObject) {
            this.canvas.discardActiveObject()
            this.canvas.setActiveObject(findObject)
            this.canvas.requestRenderAll()
            this.onSelect(findObject)
        }
    }

    cancelSelect = (obj?: WorkareaObject, canvas = this.canvas) => {
        const target = obj || canvas.getActiveObject()
        if (target) {
            canvas.discardActiveObject()
            canvas.renderAll()
            this.onSelect(null)
        }
    }
    setImage = (obj: FabricImage, source: any) => {
        return new Promise((resolve) => {
            if (!this.canvas.contextTop) return
            if (source instanceof File) {
                const reader = new FileReader()
                reader.onload = () => {
                    obj.set('file', source)
                    obj.set('src', null)

                    obj.setSrc(
                        reader.result,
                        () => {
                            if (!this.canvas.contextTop) return
                            this.canvas.renderAll()
                            resolve(obj)
                        },
                        {
                            dirty: true
                        }
                    )
                }
                reader.readAsDataURL(source)
            } else {
                obj.set('file', null)
                obj.set('src', source)
                obj.setSrc(
                    source,
                    () => {
                        if (!this.canvas.contextTop) return
                        this.canvas.renderAll()
                        resolve(obj)
                    },
                    {
                        dirty: true,
                        crossOrigin: 'Anonymous'
                    }
                )
            }
        })
    }

    // 置顶
    bringToFront(createdObj: WorkareaObject) {
        const target = createdObj || this.canvas.getActiveObject()
        if (target) {
            this.canvas.bringToFront(target)
            // 确保背景图始终在最顶层
            this.ensureBackgroundOnTop()
        }
    }
    // 上移一层
    bringForward(createdObj: WorkareaObject) {
        const target = createdObj || this.canvas.getActiveObject()
        if (target) {
            const objects = this.canvas.getObjects()
            const currentIndex = objects.indexOf(target)
            
            // 检查是否已经是最顶层的非背景对象
            const backgroundObjects = objects.filter(obj => obj.type === 'background')
            const maxIndex = backgroundObjects.length > 0 ? objects.length - backgroundObjects.length - 1 : objects.length - 1
            
            if (currentIndex < maxIndex) {
                // 暂时关闭历史记录
                this.canvas.offHistory()
                this.canvas.bringForward(target)
                // 确保背景图始终在最顶层
                this.ensureBackgroundOnTop()
                // 重新开启历史记录并保存状态
                this.canvas.onHistory()
            }
        }
    }

    // 置底
    sendToBack(createdObj: WorkareaObject | any) {
        const target = createdObj || this.canvas.getActiveObject()
        if (target) {
            // 如果有背景元素则元素再前一层
            let isbg = false
            this.canvas.getObjects().find((item: WorkareaObject) => {
                if (item.type == 'background') {
                    isbg = true
                    return item
                }
            })
            this.canvas.sendToBack(target)
            this.canvas.sendToBack(this.canvas.getObjects()[1])
            console.log(this.canvas.getObjects())

            if (isbg && target.type != 'background') {
                this.bringForward(target)
            }
        }
    }
    // 下移一层
    sendBackwards(item: WorkareaObject) {
        const target = item || this.canvas.getActiveObject()
        if (target) {
            const objects = this.canvas.getObjects()
            const currentIndex = objects.indexOf(target)
            
            // 找到第一个非工作区对象的索引
            let minIndex = 0
            for (let i = 0; i < objects.length; i++) {
                if (objects[i].type !== 'workarea' && objects[i].type !== 'background') {
                    minIndex = i
                    break
                }
            }
            
            // 检查是否已经是最底层的非工作区对象
            if (currentIndex > minIndex) {
                // 暂时关闭历史记录
                this.canvas.offHistory()
                this.canvas.sendBackwards(target)
                // 确保背景图始终在最顶层
                this.ensureBackgroundOnTop()
                // 重新开启历史记录并保存状态
                this.canvas.onHistory()
            }
        }
    }

    // 确保背景图始终在最顶层
    ensureBackgroundOnTop() {
        const bgObject = this.canvas.getObjects().find((item: any) => {
            return item.type === 'background'
        })
        if (bgObject) {
            this.canvas.bringToFront(bgObject)
        }
    }

    set = async (selectedItem: WorkareaObject, changedValues: any) => {
        const activeObject =
            selectedItem || this.canvas.getActiveObject() || this.workareaHandler.workspace
        const changedKey = Object.keys(changedValues)[0]
        const changedValue = changedValues[changedKey]
        if (changedKey == 'gradient') {
            this.fabricObjects[changedKey](activeObject, changedValue)
            // this.colors.set(activeObject, changedKey, changedValue);
        } else {
            activeObject.set(changedKey, changedValue)
        }
        activeObject.setCoords()
        this.canvas.renderAll()
        this.onSelect(activeObject)
    }

    remove = (selectedItem: any) => {
        const target = selectedItem || this.canvas.getActiveObject()
        this.canvas.remove(target)
        this.canvas.requestRenderAll()
        if (target.dispose) {
            target.dispose()
        }
        this.onSelect(null)
    }

    /**
     * 画布json数据
     * @returns
     */
    exportJSON = () => {
        const objects = this.canvas.toObject(this.propertiesToInclude).objects
        return objects
    }
    /**
     *
     * @param type 导出类型
     * @param quality 导出质量
     * @returns
     */
    exportImage = (type: string, quality = 100) => {
        if (type == 'jpg') {
            type = 'jpeg'
        }
        const viewportTransform = this.canvas.viewportTransform || []
        
        // 临时清除上层画布以避免导出时的渲染问题
        if (this.canvas.contextTop) {
            this.canvas.clearContext(this.canvas.contextTop)
        }
        
        this.canvas.setViewportTransform([1, 0, 0, 1, 0, 0])
        const { width, height, left, top } = this.workareaHandler.workspace as any
        const image = this.canvas.toDataURL({
            format: type || 'png',
            quality: quality / 100 || 1,
            width,
            height,
            left,
            top
        })
        this.canvas.setViewportTransform(viewportTransform)
        return image
    }

    // 判断是否是空白画布
    isEmptyCanvas() {
        const json = this.exportJSON().filter((item: any) => {
            if (item.id != 'workarea' || (item.id == 'workarea' && item.fill != '#fff')) {
                return item
            }
        })
        if (!(json && Array.isArray(json))) {
            return true
        }
        if (json.length > 1) {
            return false
        } else if (json.length == 1) {
            if (json[0].backgroundColor != 'rgba(0,0,0,0)') {
                return false
            } else {
                return true
            }
        }
        return true
    }

    importGroup = async (group: any, render = false, activeObject?: any) => {
        const objects = group.objects
        if (!Array.isArray(objects)) return []
        const res = []
        for (let i = 0; i < objects.length; i++) {
            if (!objects[i]) continue
            if (objects[i].type == 'group') {
                const groupObject: any = await this.importGroup(objects[i], false, activeObject)
                if (render) {
                    delete objects[i].objects
                    delete objects[i].width
                    delete objects[i].height
                }
                const { editable } = this
                const option = {
                    editable,
                    locked: editable,
                    hasControls: editable, // 当设置为 `false` 时，对象的控件不显示并且不能用于操作对象
                    hasBorders: editable, // 当设置为 `false` 时，对象的控制边界不会被渲染
                    selectable: editable, // 当设置为 `false` 时，不能选择对象进行修改（使用基于点单击或基于组的选择）。但事件仍然发生在它身上。
                    lockMovementX: !editable, // 当`true`时，对象水平移动被锁定
                    lockMovementY: !editable //当`true`时，对象垂直移动被锁定
                }
                const object: any = new fabric.Group(groupObject, {
                    ...objects[i],
                    ...option,
                    ...JSON.parse(JSON.stringify(this.objectOption))
                })
                if (!object.id) {
                    object.id = uuid()
                }
                res.push(object)
            } else {
                if (render) {
                    delete objects[i].width
                    delete objects[i].height
                }
                if (!objects[i].id) {
                    objects[i].id = uuid()
                }
                if (activeObject && activeObject.id == objects[i].id) {
                    activeObject.left = objects[i].left
                    activeObject.top = objects[i].top
                    res.push(activeObject)
                } else {
                    const object = await this.add(objects[i], false)
                    res.push(object)
                }
            }
        }
        return res
    }

    public toGroup = (target?: WorkareaObject) => {
        const activeObject: any =
            target || (this.canvas.getActiveObject() as fabric.ActiveSelection)
        if (!activeObject) {
            return null
        }
        if (activeObject.type !== 'activeSelection') {
            return null
        }
        const group = activeObject.toGroup()
        group.set({
            id: uuid(),
            name: 'New group',
            type: 'group',
            ...this.objectOption
        })
        if (this.onSelect) {
            this.onSelect(group)
        }
        this.canvas.renderAll()
        console.log(JSON.stringify(this.canvas.getObjects()))
        return group
    }

    public nogroup = (target?: any) => {
        const activeObject = target || (this.canvas.getActiveObject() as fabric.Group)
        if (!activeObject) {
            return
        }
        if (activeObject.type !== 'group') {
            return
        }
        const activeSelection = activeObject.toActiveSelection()
        if (this.onSelect) {
            this.onSelect(activeSelection)
        }
        this.canvas.renderAll()
        return activeSelection
    }

    importGroupJSON = async (obj: any) => {
        const res = await this.importGroup(obj)
        delete obj.objects
        const { editable } = this
        const option = {
            editable,
            locked: !editable,
            hasControls: editable, // 当设置为 `false` 时，对象的控件不显示并且不能用于操作对象
            hasBorders: editable, // 当设置为 `false` 时，对象的控制边界不会被渲染
            selectable: editable, // 当设置为 `false` 时，不能选择对象进行修改（使用基于点单击或基于组的选择）。但事件仍然发生在它身上。
            lockMovementX: !editable, // 当`true`时，对象水平移动被锁定
            lockMovementY: !editable //当`true`时，对象垂直移动被锁定
        }
        delete obj.width
        delete obj.height
        // const group = this.canvas.group(res);
        const group: any = new fabric.Group(res, {
            ...option,
            ...JSON.parse(JSON.stringify(this.objectOption)),
            ...obj
        })
        if (!group.id) {
            group.id = uuid()
        }
        if (!this.canvas.contextTop) return
        this.canvas.add(group)
        this.canvas.renderAll()
    }

    /**
     *
     * @param {*} json
     */
    importJSON = async (json: any) => {
        if (!this.canvas.contextTop) return
        this.isimporting = true
        try {
            if (!this.isEmptyCanvas()) {
                this.canvas.clear()
            }
            if (typeof json === 'string') {
                json = JSON.parse(json)
            }
            
       
            this.workareaHandler.initialize()
            for (let i = 0; i < json.length; i++) {
                const obj = json[i]
                if (obj.id == 'workarea') continue
                if (obj.id == 'background') {
                    await this.workareaHandler.setBgImage(obj)
                    continue
                } else if (obj.type == 'group') {
                    await this.importGroupJSON(obj)
                    continue
                }
                if (!obj.id) {
                    obj.id = uuid()
                }
                console.log(obj,'obj')
                await this.add(obj, true)
            }
            this.canvas.renderAll()
        } catch (e) {
            console.error(e)
        }
        this.isimporting = false
        this.cancelSelect()
        console.log(this.canvas.getObjects())
    }

    /**
     *
     * @param obj 元素配置
     * @param isAdd 是否添加到画布中
     * @returns
     */
    add = async (obj: any, isAdd = true) => {
        const { editable } = this
        const option = {
            editable: editable,
            hasControls: editable, // 当设置为 `false` 时，对象的控件不显示并且不能用于操作对象
            hasBorders: editable, // 当设置为 `false` 时，对象的控制边界不会被渲染
            selectable: editable, // 当设置为 `false` 时，不能选择对象进行修改（使用基于点单击或基于组的选择）。但事件仍然发生在它身上。
            lockMovementX: !editable, // 当`true`时，对象水平移动被锁定
            lockMovementY: !editable //当`true`时，对象垂直移动被锁定
        }
        const newOption = Object.assign(
            {},
            option,
            JSON.parse(JSON.stringify(this.objectOption)),
            obj,
            {
                container: this.container
            }
        )
        let createdObj
        if (obj.type == 'material') {
            obj.type = 'Image'
        }
        try {
            // 首先尝试使用定义的方法
            if (typeof this.fabricObjects[obj.type] === 'function') {
                createdObj = this.fabricObjects[obj.type](newOption)
            } else {
                // 如果没有找到对应的方法，使用通用创建方法
                createdObj = this.fabricObjects.createObject(obj.type, newOption)
            }
        } catch (e) {
            console.error(`Error creating object of type ${obj.type}:`, e)
            // 最后的回退：创建一个基本矩形
            try {
                createdObj = this.fabricObjects.rect({
                    ...newOption,
                    fill: 'rgba(255, 0, 0, 0.3)',
                    stroke: 'red',
                    strokeWidth: 2,
                    width: 100,
                    height: 100
                })
            } catch (fallbackError) {
                console.error('Failed to create fallback object:', fallbackError)
                return
            }
        }

        if (_.isPromise(createdObj)) {
            const res = await createdObj
            if (!isAdd) {
                return res
            }
            createdObj = this.addContent(res, isAdd)
            // createdObj.then((res) => {
            //     this.addContent(res, obj);
            // });
        } else if (createdObj) {
            if (!isAdd) {
                return createdObj
            }
            createdObj = this.addContent(createdObj, isAdd)
        }
        return createdObj
    }

    addContent(createdObj: any, isAdd: boolean) {
        const { onAdd } = this
        if (createdObj) {
            if (!createdObj.id) {
                createdObj.id = this.utils.uuid()
            }
            if (isAdd) {
                this.canvas.add(createdObj)
                // // 确保背景图始终在最顶层
                // this.ensureBackgroundOnTop();
            }
            if (onAdd) {
                onAdd(createdObj)
            }
        }
        this.canvas.renderAll()
        return createdObj
    }
}

export default Handler
