<template>
  <div class="option-box">
    <button @click="undo">撤销</button>
    <button @click="redo">重做</button>
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
      const { offsetWidth, offsetHeight } =
        parentCanvas.value.parentElement.parentElement;
      // 要减去滚动条的高度
      const canvasOptions = Object.assign({
        height: offsetHeight - scrollWidth,
        width: offsetWidth - scrollWidth,
        fireRightClick: true, // 启用右键，button的数字为3
        stopContextMenu: true, // 禁止默认右键菜单
        enableRetinaScaling: true, // 启用高分辨率显示支持
        controlsAboveOverlay: true,
        preserveObjectStacking: true,
        selection: false, // 允许选择
        // 添加高质量图片渲染设置
        imageSmoothingEnabled: false, // 禁用图片平滑处理以保持清晰度
        renderOnAddRemove: true, // 添加/删除对象时自动渲染
        skipTargetFind: false, // 不跳过目标查找，确保精确渲染
      });

      fabric.Object.prototype.transparentCorners = false;
      fabric.Object.prototype.cornerColor = "blue";
      fabric.Object.prototype.cornerStyle = "circle";
      canvas = new fabric.Canvas(`canvas_${id.value}`, canvasOptions);
      
      // 设置高质量图片渲染
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.imageSmoothingEnabled = false; // 禁用图片平滑处理
        ctx.imageSmoothingQuality = 'high'; // 设置高质量渲染
        // 设置不同浏览器的兼容性属性
        ctx.webkitImageSmoothingEnabled = false;
        ctx.mozImageSmoothingEnabled = false;
        ctx.msImageSmoothingEnabled = false;
      }
      
      canvas.renderAll();
      handler.value = new Handler({
        id: id.value,
        canvas,
        container: parentCanvas.value,
        ...props,
      });
      canvas.selectionColor = "rgba(196,235,255,0.3)";
      canvas.selectionBorderColor = "#6ccfff";
      canvas.selectionLineWidth = 1;
      fabric.Image.fromURL(
        "https://saas-1302732800.cos.accelerate.myqcloud.com/uploads/images/20250626/2025062615354765e611996.png",
        (img) => {
          img.scaleToWidth(900); // 调整大小以适应画布
          img.scaleToHeight(2690);
          canvas.setOverlayImage(img, canvas.renderAll.bind(canvas));
        },
        { crossOrigin: 'anonymous' }
      );
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
