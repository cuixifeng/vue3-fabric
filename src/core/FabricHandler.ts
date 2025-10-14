import { fabric } from 'fabric'
import Handler from './handler'
import { WorkareaOption, WorkareaObject, FabricImage } from '@/types/utils'

class FabricHandler {
    private handler: Handler
    constructor(handler: Handler) {
        this.handler = handler
    }

    textbox({ text, ...option }: any) {
        option.fontSize = parseInt(option.fontSize)
        option.editable = false
        return new fabric.Textbox(text, option)
    }

    FontCustom(option: WorkareaObject) {
        return this.textbox(option)
    }

    gradient(selectedItem: WorkareaObject, options: any) {
        if (!selectedItem) {
            selectedItem = this.handler.canvas.getActiveObject()
        }
        let gradient
        if (options.type == 'radial-gradient') {
            const { width, height } = selectedItem
            const r = width > height ? width / 2 : height / 2
            const coords = {
                r1: r, // 该属性仅径向渐变可用，外圆半径
                r2: 0, // 该属性仅径向渐变可用，外圆半径
                x1: width / 2, // 焦点的x坐标
                y1: height / 2, // 焦点的y坐标
                x2: width / 2, // 中心点的x坐标
                y2: height / 2 // 中心点的y坐标
            }
            const colorStops = options.colorStops.map((item: any) => {
                const offset = Number(item.length.value) / 100
                const [red, green, blue, alpha] = item.value
                const color = `rgba(${red}, ${green}, ${blue}, ${alpha})`
                return { offset, color }
            })
            gradient = new fabric.Gradient({
                type: 'radial',
                coords,
                colorStops
            })
        } else {
            // 渐变
            const {
                x0: x1,
                y0: y1,
                x1: x2,
                y1: y2
            } = this.handler.utils.calculateGradientCoordinate(
                selectedItem.width,
                selectedItem.height,
                Number(options.orientation.value)
            )
            const colorStops = options.colorStops.map((item: any) => {
                const offset = Number(item.length.value) / 100
                const [red, green, blue, alpha] = item.value
                const color = `rgba(${red}, ${green}, ${blue}, ${alpha})`
                return { offset, color }
            })
            gradient = new fabric.Gradient({
                type: 'linear', // linear or radial
                gradientUnits: 'pixels', // pixels or pencentage 像素 或者 百分比
                coords: { x1, y1, x2, y2 }, // 至少2个坐标对(x1，y1和x2，y2)将定义渐变在对象上的扩展方式
                colorStops: colorStops
            })
        }

        selectedItem.set({
            fill: gradient,
            backgroundColor: options.gradientColor
        })
    }

    async Image(options: WorkareaObject) {
        const type =
            this.handler.utils.getFileType(options.src) ||
            this.handler.utils.getBase64ImageType(options.src)
        if (type == 'svg') {
            return this.addImage(options)
        } else if (type && ['jpg', 'png', 'jpeg'].includes(type)) {
            return this.addImage(options)
        }
    }

    addSvg(obj: WorkareaOption) {
        return new Promise((resolve) => {
            const { src, path, ...otherOption } = obj
            const { width } = this.handler.workareaHandler.option
            if (!src) {
                const res = new fabric.Path(path)
                resolve(res)
            } else if (src) {
                fabric.loadSVGFromURL(src, (objects, options) => {
                    const activeObject: any = fabric.util.groupSVGElements(objects, options)
                    if (activeObject.width > width) {
                        const scale = width / activeObject.width
                        activeObject.set({
                            scaleX: scale,
                            scaleY: scale
                        })
                    }
                    activeObject.set({
                        crossOrigin: 'Anonymous',
                        src,
                        ...otherOption
                    })
                    resolve(activeObject)
                })
            }
        })
    }
    initializeFilters(image: any) {
        image.filters.push(
            new fabric.Image.filters.Brightness(),
            new fabric.Image.filters.Contrast(),
            new fabric.Image.filters.Saturation(),
            new fabric.Image.filters.HueRotation(),
            // new fabric.Image.filters.Vibrance(),
            // new fabric.Image.filters.Gamma(),
            new fabric.Image.filters.Blur(),
            new fabric.Image.filters.Noise(),
            new fabric.Image.filters.Pixelate()
        )
    
    }

    async addImage(obj: FabricImage) {
        const { src, disableAutoScale, imageSmoothing, ...otherOption } = obj
        const { objectOption } = this.handler

        // 创建高质量图片元素
        const imageUrl = new Image()
        imageUrl.crossOrigin = 'Anonymous'

        // 获取设备像素比
        const devicePixelRatio = window.devicePixelRatio || 1

        // 只有在单个图片素材导入情况下才自适应，除非明确禁用自动缩放
        const { width } = this.handler.workareaHandler.workspace as any
        if (
            !disableAutoScale && // 检查是否禁用自动缩放
            otherOption.width &&
            this.handler.workareaHandler &&
            this.handler.workareaHandler.workspace &&
            otherOption.width > width &&
            !this.handler.isimporting
        ) {
            const scale = width / otherOption.width
            otherOption.scaleX = scale
            otherOption.scaleY = scale
        }

        // 创建高质量图片选项
        const imageOptions = {
            clipPath: null,
            ...JSON.parse(JSON.stringify(objectOption)),
            ...otherOption,
            // 高清渲染配置
            crossOrigin: 'anonymous',
            // 禁用对象缓存以确保高质量渲染
            objectCaching: false,
            // 启用状态缓存但禁用缩放缓存
            statefullCache: true,
            noScaleCache: true,
            // 确保描边统一
            strokeUniform: true,
            // 高质量图片渲染
            imageSmoothing: imageSmoothing !== false // 默认启用图片平滑
        }

        // 创建Fabric图片对象
        const canvasImage = new fabric.Image(imageUrl, imageOptions)
        

        canvasImage.crossOrigin = 'Anonymous'
        this.initializeFilters(canvasImage)

        // 等待图片加载并设置
        await this.handler.setImage(canvasImage, src)

        // 图片加载完成后，重新设置高质量渲染属性
        canvasImage.set({
            dirty: true,
            objectCaching: false
        })

        // 如果是高DPI设备，确保图片以原始分辨率渲染
        if (devicePixelRatio > 1) {
            // 强制重新渲染以应用高DPI设置
            this.handler.canvas.requestRenderAll()
        }

        return canvasImage
    }

    async background(options: WorkareaObject) {
        return this.addImage(options)
    }

    // 添加基本几何形状支持
    rect(options: WorkareaObject) {
        return new fabric.Rect(options)
    }

    circle(options: WorkareaObject) {
        return new fabric.Circle(options)
    }

    triangle(options: WorkareaObject) {
        return new fabric.Triangle(options)
    }

    polygon(options: WorkareaObject) {
        return new fabric.Polygon(options.points || [], options)
    }

    line(options: WorkareaObject) {
        const points = options.points || [0, 0, 100, 100]
        return new fabric.Line(points, options)
    }

    path(options: WorkareaObject) {
        return new fabric.Path(options.path || '', options)
    }

    ellipse(options: WorkareaObject) {
        return new fabric.Ellipse(options)
    }

    text(options: WorkareaObject) {
        return new fabric.Text(options.text || '', options)
    }

    itext(options: WorkareaObject) {
        return new fabric.IText(options.text || '', options)
    }

    // 添加通用对象创建方法，用于处理未知类型
    createObject(type: string, options: WorkareaObject) {
        // 尝试使用 fabric 的构造函数
        const fabricClass = (fabric as any)[type]
        if (fabricClass && typeof fabricClass === 'function') {
            return new fabricClass(options)
        }
        
        // 如果找不到对应的类型，返回一个基本的矩形作为占位符
        console.warn(`Unknown fabric object type: ${type}, creating rect as fallback`)
        return new fabric.Rect({
            ...options,
            fill: 'rgba(255, 0, 0, 0.3)', // 红色半透明，表示这是一个错误的对象
            stroke: 'red',
            strokeWidth: 2
        })
    }
}

export default FabricHandler
