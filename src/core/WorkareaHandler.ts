import { fabric } from 'fabric'
import Handler from './handler'
import { WorkareaOption, FabricRect, FabricImage } from '@/types/utils'
import initAligningGuidelines from './AligningGuidelines'

class EditorWorkspace {
    canvas: fabric.Canvas
    workspaceEl: HTMLElement
    workspace: FabricRect | null
    bgObject: any | null
    option: WorkareaOption
    handler: Handler
    unitEnum: any
    constructor(handler: Handler) {
        this.handler = handler
        this.canvas = handler.canvas
        const container = handler.container
        if (!container) {
            throw new Error('element #workspace is missing, plz check!')
        }
        this.workspaceEl = container
        this.workspace = null
        this.bgObject = null
        this.option = handler.workareaOption
        this.initialize()
        // 像素转换, 1cm等于37.9像素等
        this.unitEnum = {
            cm: 37.9,
            mm: 3.78,
            px: 1
        }
    }

    initialize() {
        this._initBackground()
        this._initWorkspace()
        this._initResizeObserve()
    }

    // 初始化背景
    _initBackground() {
        this.canvas.backgroundImage = ''
        this.canvas.setWidth(this.workspaceEl.offsetWidth).setHeight(this.workspaceEl.offsetHeight)
    }

    // 初始化画布
    _initWorkspace() {
        const deleteIcon =
            "data:image/svg+xml,%3C%3Fxml version='1.0' encoding='utf-8'%3F%3E%3C!DOCTYPE svg PUBLIC '-//W3C//DTD SVG 1.1//EN' 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'%3E%3Csvg version='1.1' id='Ebene_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' width='595.275px' height='595.275px' viewBox='200 215 230 470' xml:space='preserve'%3E%3Ccircle style='fill:%23F44336;' cx='299.76' cy='439.067' r='218.516'/%3E%3Cg%3E%3Crect x='267.162' y='307.978' transform='matrix(0.7071 -0.7071 0.7071 0.7071 -222.6202 340.6915)' style='fill:white;' width='65.545' height='262.18'/%3E%3Crect x='266.988' y='308.153' transform='matrix(0.7071 0.7071 -0.7071 0.7071 398.3889 -83.3116)' style='fill:white;' width='65.544' height='262.179'/%3E%3C/g%3E%3C/svg%3E"

        const deleteImg = document.createElement('img')
        deleteImg.src = deleteIcon
        function renderIcon(ctx: any, left: any, top: any, _styleOverride: any, fabricObject: any) {
            const size = 24 // 使用固定大小而不是this.cornerSize
            ctx.save()
            ctx.translate(left, top)
            ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle))
            ctx.drawImage(deleteImg, -size / 2, -size / 2, size, size)
            ctx.restore()
        }
        function deleteObject(_eventData: any, transform: any) {
            const canvas = transform.target.canvas
            canvas.remove(transform.target)
            canvas.requestRenderAll()
        }
        const workspace = new fabric.Rect(this.option)
        workspace.controls.deleteControl = new fabric.Control({
            x: 0.5,
            y: -1,
            offsetY: 16,
            cursorStyle: 'pointer',
            mouseUpHandler: deleteObject as any,
            render: renderIcon
        })
        this.canvas.add(workspace)
        this.canvas.renderAll()
        this.workspace = workspace
        this.auto()
    }

    /**
     * 设置画布中心到指定对象中心点上
     * @param {Object} obj 指定的对象
     */
    setCenterFromObject(obj: fabric.Rect) {
        const { canvas } = this
        const objCenter = obj.getCenterPoint()
        const viewportTransform = canvas.viewportTransform
        if (canvas.width === undefined || canvas.height === undefined || !viewportTransform) return
        const ruleWidth = 10 // 标尺宽度
        // viewportTransform[0] x轴缩放
        viewportTransform[4] = canvas.width / 2 - objCenter.x * viewportTransform[0] + ruleWidth
        viewportTransform[5] = canvas.height / 2 - objCenter.y * viewportTransform[3]
        canvas.setViewportTransform(viewportTransform)
        canvas.renderAll()
    }

    // 初始化监听器
    _initResizeObserve() {
        const resizeObserver = new ResizeObserver(() => {
            this.auto()
        })
        resizeObserver.observe(this.workspaceEl)
    }

    setSize(width: number, height: number) {
        this._initBackground()
        const unit = this.workspace?.unit || 'px'
        this.option.width = width * this.unitEnum[unit]
        this.option.height = height * this.unitEnum[unit]
        // 重新设置workspace
        this.workspace = this.handler.utils.findById('workarea') as fabric.Rect
        if (!this.workspace) {
            this.initialize()
        }
        this.workspace.set('width', this.option.width)
        this.workspace.set('height', this.option.height)
        this.auto()
    }

    getBili() {
        return this.option.width / this.option.height
    }

    setWidth(width: number) {
        this._initBackground()
        const unit = this.workspace?.unit || 'px'
        this.option.width = width * this.unitEnum[unit]
        // 重新设置workspace
        this.workspace = this.handler.utils.findById('workarea') as fabric.Rect
        this.workspace.set('width', width)
        this.auto()
    }

    setHeight(height: number) {
        this._initBackground()
        const unit = this.workspace?.unit || 'px'
        this.option.height = height * this.unitEnum[unit]
        // 重新设置workspace
        this.workspace = this.handler.utils.findById('workarea') as fabric.Rect
        this.workspace.set('height', height)
        this.auto()
    }

    setZoomAuto(scale: number, cb?: (left?: number, top?: number) => void) {
        const { workspaceEl } = this
        const width = workspaceEl.offsetWidth
        const height = workspaceEl.offsetHeight

        // 获取设备像素比
        const devicePixelRatio = window.devicePixelRatio || 1

        // 设置画布尺寸
        this.canvas.setWidth(width)
        this.canvas.setHeight(height)

        // 如果是高DPI设备，重新设置canvas的实际像素尺寸
        if (devicePixelRatio > 1) {
            const canvasElement = this.canvas.getElement()
            const ctx = canvasElement.getContext('2d')

            // 设置canvas实际像素尺寸
            canvasElement.width = width * devicePixelRatio
            canvasElement.height = height * devicePixelRatio

            // 设置canvas显示尺寸
            canvasElement.style.width = width + 'px'
            canvasElement.style.height = height + 'px'

            // 重新设置上下文的高质量渲染
            if (ctx) {
                ctx.scale(devicePixelRatio, devicePixelRatio)
                ctx.imageSmoothingEnabled = true
                ctx.imageSmoothingQuality = 'high'
            }
        }

        const center = this.canvas.getCenter()
        this.canvas.setViewportTransform(fabric.iMatrix.concat())
        this.canvas.zoomToPoint(new fabric.Point(center.left, center.top), scale)
        if (!this.workspace) return
        this.setCenterFromObject(this.workspace)
        // this.canvas.centerObject(this.workspace);

        // 超出画布不展示
        this.workspace.clone((cloned: fabric.Rect) => {
            this.canvas.clipPath = cloned
            this.canvas.requestRenderAll()
        })
        // 背景图自适应
        if (this.bgObject) {
            const obj = this._getBgPosition(this.bgObject)
            this.bgObject.set(obj)
        }
        
        // 重新初始化对齐辅助线，确保使用正确的zoom值
        initAligningGuidelines(this.canvas, this.canvas.getZoom())
        
        if (cb) cb(this.workspace.left, this.workspace.top)
    }

    unpdateUnit(unit: string) {
        this.workspace?.set('unit', unit)
    }

    async setBgImage(options: WorkareaOption) {
        const { src } = options || {}
        const editable = true
        const option = {
            editable,
            hasControls: editable, // 当设置为 `false` 时，对象的控件不显示并且不能用于操作对象
            hasBorders: editable, // 当设置为 `false` 时，对象的控制边界不会被渲染
            selectable: editable, // 当设置为 `false` 时，不能选择对象进行修改（使用基于点单击或基于组的选择）。但事件仍然发生在它身上。
            lockMovementX: !editable, // 当`true`时，对象水平移动被锁定
            lockMovementY: !editable, //当`true`时，对象垂直移动被锁定
            lockScalingX: !editable,
            lockScalingY: !editable,
            hoverCursor: 'default',
            name: '背景图片',
            type: 'background',
            src
        }
        // 去重, 防止出现多个背景元素
        const bgObject = this.getBgObject()
        if (bgObject && bgObject.src !== src) {
            this.handler.canvas.remove(bgObject)
        }
        const poiOptions = this._getBgPosition(options)
        const newOptions = Object.assign({}, option, poiOptions)
        this.bgObject = await this.handler.add(newOptions, false)
        if (this.bgObject) {
            this.canvas.add(this.bgObject)
            this.canvas.sendToBack(this.bgObject)
            this.canvas.bringForward(this.bgObject)
        }
        this.canvas.requestRenderAll()
        return this.bgObject
    }

    // 获取背景元素
    getBgObject() {
        return this.handler.canvas.getObjects().find((item: any) => {
            if (item.type == 'background') {
                return item
            }
        })
    }

    bgToImage() {
        if (this.bgObject) {
            const editable = true
            const option = {
                editable,
                hasControls: editable,
                hasBorders: editable,
                selectable: editable,
                lockMovementX: !editable,
                lockMovementY: !editable,
                lockScalingX: !editable,
                lockScalingY: !editable,
                hoverCursor: 'default',
                name: '',
                type: 'Image'
            }
            this.bgObject.set(option)
            this.canvas.renderAll()
            console.log(this.canvas.getObjects())
            this.handler.onSelect(this.bgObject)
            this.bgObject = null
        }
    }

    _getScale() {
        const viewPortWidth = this.workspaceEl.offsetWidth
        const viewPortHeight = this.workspaceEl.offsetHeight
        // 按照宽度
        if (viewPortWidth / viewPortHeight < this.option.width / this.option.height) {
            return viewPortWidth / this.option.width
        } // 按照宽度缩放
        return viewPortHeight / this.option.height
    }

    /**
     * 获取背景图的位置(缩放比例和left、top)
     */
    _getBgPosition(bgObject: FabricImage | any) {
        const { width, height } = this.workspace as any
        let scale = 1
        if (width > bgObject.width || height > bgObject.height) {
            if (width / bgObject.width > height / bgObject.height) {
                scale = width / bgObject.width
            } else {
                scale = height / bgObject.height
            }
        }
        // 居中
        const bgHeight = bgObject.height * scale
        const bgWidth = bgObject.width * scale
        const bgLeft = -(bgWidth - width) / 2
        const bgTop = -(bgHeight - height) / 2
        return {
            left: bgLeft,
            top: bgTop,
            scaleX: scale,
            scaleY: scale
        }
    }

    // 放大
    big() {
        let zoomRatio = this.canvas.getZoom()
        zoomRatio += 0.05
        // const center = this.canvas.getCenter();
        // this.canvas.zoomToPoint(
        //   new fabric.Point(center.left, center.top),
        //   zoomRatio > 5 ? 5 : zoomRatio
        // );
        this.setZoomAuto(zoomRatio > 5 ? 5 : zoomRatio)
    }

    // 缩小
    small() {
        let zoomRatio = this.canvas.getZoom()
        zoomRatio -= 0.05
        // const center = this.canvas.getCenter();
        // this.canvas.zoomToPoint(
        //   new fabric.Point(center.left, center.top),
        //   zoomRatio < 0 ? 0.01 : zoomRatio
        // );
        this.setZoomAuto(zoomRatio < 0 ? 0.01 : zoomRatio)
    }

    // 自动缩放
    auto() {
        const scale = this._getScale()
        this.setZoomAuto(scale - 0.08 < 0.01 ? 0.01 : scale - 0.08)
    }

    // 1:1 放大
    one() {
        this.setZoomAuto(0.8 - 0.08)
        this.canvas.requestRenderAll()
    }

    // 获取画布自适应下的比例
    getAutoScale() {
        return this._getScale()
    }
}

export default EditorWorkspace
