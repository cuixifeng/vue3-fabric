<template>
  <div class="option-box">
    <button @click="undo">撤销</button>
    <button @click="redo">重做</button>
    <button @click="addTestElements">测试渲染清晰度</button>
  </div>
  <div
    :style="{ width: '100%', height: '100%' }"
    ref="parentCanvas"
    class="parentCanvas"
    :id="id"
  >
    <canvas :id="`canvas_${id}`"></canvas>
  </div>
</template>
<script>
import { fabric } from "fabric";
import { ref, onMounted } from "vue";
import { v4 as uuidv4 } from "uuid";
import Handler from "@/core/handler";
// import "@/core/FabricObjects";
const scrollWidth = 12;
export default {
  props: {
    workareaOption: {
      type: Object,
      default: () => ({}),
    },
    /**
     * 是否可编辑
     */
    editable: {
      type: Boolean,
      default: true,
    },
    objectOption: {
      type: Object,
      default: () => ({}),
    },
    /**
     * 新增素材
     */
    onAdd: {
      type: Function,
    },
    /**
     * 选择元素
     */
    onSelect: {
      type: Function,
    },
    /**
     * 画布加载完成后初始化回调
     */
    init: {
      type: Function,
    },
  },
  setup(props) {
    const id = ref(uuidv4());
    // 禁止把画布设置成响应式,否则缩放和旋转功能失效
    let canvas;
    const parentCanvas = ref();
    const handler = ref();

    onMounted(() => {
      // 获取容器尺寸
      const { offsetWidth, offsetHeight } = parentCanvas.value.parentElement.parentElement;
      
      // 获取设备像素比，用于高清渲染
      const devicePixelRatio = window.devicePixelRatio || 1;
      const parentWidth = offsetWidth - scrollWidth;
      const parentHeight = offsetHeight - scrollWidth;
      
      // 获取canvas元素并预先设置高DPI属性
      const canvasElement = document.getElementById(`canvas_${id.value}`);
      
      // 设置canvas元素的高DPI属性
      canvasElement.style.width = parentWidth + 'px';
      canvasElement.style.height = parentHeight + 'px';
      canvasElement.width = parentWidth * devicePixelRatio;
      canvasElement.height = parentHeight * devicePixelRatio;
      
      // 初始化高清画布配置
      const canvasOptions = {
        width: parentWidth,
        height: parentHeight,
        backgroundColor: '#f5f5f5', // 浅灰色背景，便于区分工作区
        selection: true, // 允许选择
        preserveObjectStacking: true,
        // 高清渲染配置
        enableRetinaScaling: true, // 启用Retina缩放
        devicePixelRatio: devicePixelRatio, // 设备像素比
        imageSmoothingEnabled: true, // 启用图像平滑
        renderOnAddRemove: false, // 优化性能
        skipTargetFind: false, // 不跳过目标查找，保证交互准确性
        // 高质量渲染设置
        allowTouchScrolling: false,
        centeredScaling: false,
        centeredRotation: true,
      };

      // 全局优化Fabric对象渲染 - 在创建画布前设置
      fabric.Object.prototype.transparentCorners = false;
      fabric.Object.prototype.cornerColor = "blue";
      fabric.Object.prototype.cornerStyle = "circle";
      fabric.Object.prototype.cornerSize = 8; // 控制点大小
      fabric.Object.prototype.borderScaleFactor = 1; // 边框缩放因子
      fabric.Object.prototype.borderOpacityWhenMoving = 0.4; // 移动时边框透明度
      fabric.Object.prototype.objectCaching = false;
      fabric.Object.prototype.statefullCache = true;
      fabric.Object.prototype.noScaleCache = true;
      fabric.Object.prototype.strokeUniform = true;
      fabric.Object.prototype.dirty = true;
      
      // 优化图片对象渲染
      fabric.Image.prototype.crossOrigin = 'anonymous';
      fabric.Image.prototype.objectCaching = false;
      fabric.Image.prototype.perPixelTargetFind = true;
      
      // 文本渲染优化
      fabric.Text.prototype.fontFamily = 'Arial, sans-serif';
      fabric.Text.prototype.fontSize = 16;
      fabric.Text.prototype.fontWeight = 'normal';
      fabric.Text.prototype.charSpacing = 0;
      fabric.Text.prototype.objectCaching = false;
      
      // 创建画布
      canvas = new fabric.Canvas(canvasElement, canvasOptions);
      
      // 设置高质量渲染上下文
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // 缩放上下文以匹配设备像素比
        ctx.scale(devicePixelRatio, devicePixelRatio);
        
        // 设置高质量渲染属性
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high'; // 高质量图像平滑
        ctx.textRenderingOptimization = 'optimizeQuality'; // 文本渲染优化
        ctx.antialias = 'subpixel'; // 子像素抗锯齿
        
        // 设置字体渲染优化
        if ('textRendering' in ctx) {
          ctx.textRendering = 'optimizeLegibility';
        }
      }
      
      // 设置上层canvas的高质量渲染
      const upperCtx = canvas.upperCanvasEl.getContext('2d');
      if (upperCtx) {
        upperCtx.scale(devicePixelRatio, devicePixelRatio);
        upperCtx.imageSmoothingEnabled = true;
        upperCtx.imageSmoothingQuality = 'high';
      }
      
      // 初始化Handler
      handler.value = new Handler({
        id: id.value,
        canvas,
        container: parentCanvas.value,
        ...props,
      });
      
      // 设置选择样式 - 高清优化
      canvas.selectionColor = "rgba(196,235,255,0.3)";
      canvas.selectionBorderColor = "#6ccfff";
      canvas.selectionLineWidth = 1;
      canvas.selectionDashArray = []; // 实线选择框
      
      // 优化渲染性能
      canvas.renderOnAddRemove = true;
      canvas.skipTargetFind = false;
      canvas.perPixelTargetFind = true; // 像素级目标查找，提高精确度
      
      // 确保画布居中显示
      setTimeout(() => {
        if (handler.value && handler.value.workareaHandler) {
          handler.value.workareaHandler.auto(); // 自动缩放并居中
          console.log('画布已居中显示，工作区尺寸：1000x2000');
          console.log('高清渲染已启用，设备像素比：', devicePixelRatio);
        }
      }, 100);
      
      // 渲染画布
      canvas.renderAll();
      
      console.log('高清画布初始化完成，容器尺寸：', offsetWidth - scrollWidth, 'x', offsetHeight - scrollWidth);
      console.log('渲染清晰度优化已应用');
    });

    // 添加 undo 和 redo 方法
    function undo() {
      if (canvas) {
        canvas.undo();
      }
    }

    function redo() {
      if (canvas) {
        canvas.redo();
      }
    }

    return {
      id,
      parentCanvas,
      handler,
      undo,
      redo,
    };
  },
};
</script>

<style>
.parentCanvas {
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  /* background-image: linear-gradient(
      45deg,
      #eee 25%,
      transparent 0,
      transparent 75%,
      #eee 0,
      #eee
    ),
    linear-gradient(45deg, #eee 25%, #fff 0, #fff 75%, #eee 0, #eee);
  box-shadow: 0 5px 30px 0 rgb(0 0 0 / 10%); */
  background-position: 0 0, 10px 10px;
  background-size: 20px 20px;
}
.option-box {
  position: fixed;
  top: 10px;
  right: 60px;
}
.option-box button {
  margin: 5px;
  padding: 5px 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
