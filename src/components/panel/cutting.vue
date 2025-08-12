<template>
  <div class="dialog">
    <div class="dialog__trigger" @click="open">
      <!-- 触发弹窗 -->
      <slot name="trigger"></slot>
    </div>
    <el-dialog
      v-model="visible"
      :custom-class="customClass"
      :center="center"
      :append-to-body="true"
      :width="width"
      :close-on-click-modal="clickModalClose"
      @closed="close"
    >
      <canvas id="cutCanvas" width="600" height="600" />
      <!-- 底部弹窗页脚 -->
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleEvent('cancel')"> 取消 </el-button>
          <el-button type="primary" @click="handleEvent('confirm')">
            裁剪
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { useStore } from "vuex";
import { fabric } from "fabric";
import { ElDialog, ElButton } from "element-plus";
import {
  defineProps,
  withDefaults,
  ref,
  provide,
  nextTick,
  onMounted,
  inject
} from "vue";
const props = withDefaults(
  defineProps<{
    // 弹窗标题
    title?: string;
    // 弹窗内容
    content?: string;
    // 弹窗的宽度
    width?: string;
    // 是否禁用
    disabled?: boolean;
    // 是否开启异步关闭
    async?: boolean;
    // 点击遮罩层关闭对话窗口
    clickModalClose?: boolean;
    // 是否居中布局
    center?: boolean;
    customClass?: string;
  }>(),
  {
    title: "",
    content: "",
    width: "100px",
    disabled: false,
    async: false,
    clickModalClose: false,
    center: true,
    customClass: "",
  }
);
const store = useStore();
const emit = defineEmits<{
  confirm: [];
  cancel: [];
  close: [];
  open: [];
}>();
const canvas = inject("canvas") as any;
const visible = ref(false);
const cutCanvas = ref(null) as any;
const img = ref() as any; // 用于存储加载的图片对象
const cropZone = ref() as any;  

const handleEvent = () => {
  console.log(store.state.currentItem)
  cropImage()
  close();
};

const close = () => {
  visible.value = false;
  nextTick(() => {
    emit("close");
  });
};

const open = () => {
  if (props.disabled) {
    return;
  }
  emit("open");
  visible.value = true;
  
  // 等待弹窗渲染完成后初始化canvas
  nextTick(() => {
    initCanvas();
  });
};

provide("visible", visible);

defineExpose({
  visible,
  handleEvent,
  close,
  open,
});

// 初始化canvas
function initCanvas() {
  // 如果canvas已经初始化，先销毁
  if (cutCanvas.value) {
    cutCanvas.value.dispose();
  }
  
  // 初始化画布，尺寸与HTML canvas元素匹配
  cutCanvas.value = new fabric.Canvas("cutCanvas", {
    width: 950,
    height: 600,
    selection: true, // 允许选择
    renderOnAddRemove: false, // 禁用自动渲染，手动控制
    skipTargetFind: false, // 保持目标查找
    perPixelTargetFind: false, // 禁用像素级目标查找以提升性能
    enableRetinaScaling: false, // 禁用高DPI缩放以提升性能
  });
  
  // 检查是否有当前选中的图层
  if (store.state.currentItem) {
    console.log('渲染当前选中的图层:', store.state.currentItem);
    
    // 克隆当前选中的图层，避免影响原始对象
    store.state.currentItem.clone((clonedItem: any) => {
      img.value = clonedItem;
      
      // 计算等比例缩放，使图片适应画布
      const canvasWidth = 950;
      const canvasHeight = 600;
      const imgWidth = img.value.width * img.value.scaleX;
      const imgHeight = img.value.height * img.value.scaleY;
      
      // 计算缩放比例，保持宽高比
      const scaleX = (canvasWidth * 0.8) / imgWidth;
      const scaleY = (canvasHeight * 0.8) / imgHeight;
      const scale = Math.min(scaleX, scaleY);
      
      img.value.set({
        left: (canvasWidth - imgWidth * scale) / 2,
        top: (canvasHeight - imgHeight * scale) / 2,
        scaleX: scale,
        scaleY: scale,
        selectable: false,
      });
      
      // 添加克隆的图层到裁剪画布
      cutCanvas.value.add(img.value);
      
      // 初始化裁剪区域
      initCropZone();
      
      // 手动渲染（因为禁用了自动渲染）
      cutCanvas.value.renderAll();
    });
  } else {
    console.log('没有选中的图层，加载默认图片');
  }
}

// 初始化裁剪区域
function initCropZone() {
  // 根据图层的大小和位置设置裁剪区域
  const imgBounds = img.value.getBoundingRect();
  
  // 计算等比例的裁剪区域大小
  const aspectRatio = imgBounds.width / imgBounds.height;
  let cropWidth = Math.max(100, imgBounds.width - 40);
  let cropHeight = Math.max(100, imgBounds.height - 40);
  
  // 保持宽高比
  if (cropWidth / cropHeight > aspectRatio) {
    cropWidth = cropHeight * aspectRatio;
  } else {
    cropHeight = cropWidth / aspectRatio;
  }
  
  cropZone.value = new fabric.Rect({
    left: imgBounds.left + (imgBounds.width - cropWidth) / 2,
    top: imgBounds.top + (imgBounds.height - cropHeight) / 2,
    width: cropWidth,
    height: cropHeight,
    fill: "rgba(0,0,0,0.5)",
    strokeWidth: 2,
    selectable: true,
    hasControls: true,
    transparentCorners: false,
    cornerColor: "blue",
    cornerSize: 10,
    lockUniScaling: true, // 锁定等比例缩放
  });
  cutCanvas.value.add(cropZone.value);
  
  // 手动渲染（因为禁用了自动渲染）
  cutCanvas.value.renderAll();
  
  // 缩放结束事件
  cropZone.value.on("modified", function () {
    cutCanvas.value.renderAll(); // 确保最终状态正确渲染
  });
}

// 裁剪图片
function cropImage() {
  if (!img.value || !cropZone.value) {
    console.error('图片或裁剪区域未初始化');
    return;
  }

  // 创建一个临时画布
  const tempCanvas = document.createElement("canvas");
  const tempCtx = tempCanvas.getContext("2d") as any;

  // 获取裁剪区域的实际尺寸（考虑缩放）
  const cropWidth = cropZone.value.width * cropZone.value.scaleX;
  const cropHeight = cropZone.value.height * cropZone.value.scaleY;
  
  // 设置临时画布的大小为裁剪区域的大小，保持等比例
  tempCanvas.width = cropWidth;
  tempCanvas.height = cropHeight;

  // 计算裁剪区域相对于图片的位置
  const imgBounds = img.value.getBoundingRect();
  const cropBounds = cropZone.value.getBoundingRect();
  
  // 计算在原始图片坐标系中的裁剪位置
  const relativeLeft = (cropBounds.left - imgBounds.left) / imgBounds.width;
  const relativeTop = (cropBounds.top - imgBounds.top) / imgBounds.height;
  const relativeWidth = cropBounds.width / imgBounds.width;
  const relativeHeight = cropBounds.height / imgBounds.height;

  // 获取原始图片尺寸
  const originalWidth = img.value.width;
  const originalHeight = img.value.height;

  // 计算在原始图片上的裁剪区域
  const sourceX = relativeLeft * originalWidth;
  const sourceY = relativeTop * originalHeight;
  const sourceWidth = relativeWidth * originalWidth;
  const sourceHeight = relativeHeight * originalHeight;

  // 绘制裁剪后的图片
  tempCtx.drawImage(
    img.value._element,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    0,
    0,
    cropWidth,
    cropHeight
  );

  // 获取裁剪后的图片URL
  const croppedImageUrl = tempCanvas.toDataURL('image/png');
  
  console.log('裁剪后的图片URL:', croppedImageUrl);

  // 更新当前选中的图层
  if (store.state.currentItem && canvas.value) {
    // 使用裁剪后的图片URL更新当前图层
    store.state.currentItem.setSrc(croppedImageUrl, function() {
      // 更新图层尺寸为裁剪后的尺寸
      store.state.currentItem.set({
        width: cropWidth,
        height: cropHeight,
        scaleX: 1,
        scaleY: 1
      });

      // 重新渲染主画布
      canvas.value.renderAll();
      
      console.log('图片裁剪完成，已更新到主画布');
    });
  } else {
    // 如果没有当前选中的图层，创建新的图片对象
    const croppedImg = new fabric.Image(tempCanvas, {
      left: 100,
      top: 100,
      scaleX: 1,
      scaleY: 1,
    });

    if (canvas.value) {
      canvas.value.add(croppedImg);
      canvas.value.setActiveObject(croppedImg);
      canvas.value.renderAll();
    }
    
    console.log('创建新的裁剪图片对象');
  }

  // 返回裁剪后的图片URL，供外部使用
  return croppedImageUrl;
}
// 单独获取当前裁剪后图片URL的函数
function getCroppedImageUrl() {
  if (!img.value || !cropZone.value) {
    console.error('图片或裁剪区域未初始化');
    return null;
  }

  // 创建临时画布进行裁剪
  const tempCanvas = document.createElement("canvas");
  const tempCtx = tempCanvas.getContext("2d");

  // 获取裁剪区域的实际尺寸
  const cropWidth = cropZone.value.width * cropZone.value.scaleX;
  const cropHeight = cropZone.value.height * cropZone.value.scaleY;
  
  tempCanvas.width = cropWidth;
  tempCanvas.height = cropHeight;

  // 计算裁剪区域相对于图片的位置
  const imgBounds = img.value.getBoundingRect();
  const cropBounds = cropZone.value.getBoundingRect();
  
  const relativeLeft = (cropBounds.left - imgBounds.left) / imgBounds.width;
  const relativeTop = (cropBounds.top - imgBounds.top) / imgBounds.height;
  const relativeWidth = cropBounds.width / imgBounds.width;
  const relativeHeight = cropBounds.height / imgBounds.height;

  const originalWidth = img.value.width;
  const originalHeight = img.value.height;

  const sourceX = relativeLeft * originalWidth;
  const sourceY = relativeTop * originalHeight;
  const sourceWidth = relativeWidth * originalWidth;
  const sourceHeight = relativeHeight * originalHeight;

  // 绘制裁剪后的图片
  tempCtx.drawImage(
    img.value._element,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    0,
    0,
    cropWidth,
    cropHeight
  );

  // 返回base64格式的图片URL
  return tempCanvas.toDataURL('image/png');
}

// canvas初始化已移到弹窗打开时执行
</script>

<style scoped lang="scss">
.dialog-body {
  white-space: pre-line;
}

#cutCanvas {
  border: 1px solid #ddd;
  display: block;
  margin: 0 auto;
}

.dialog-footer {
  text-align: center;
  padding: 20px 0;
}
</style>
