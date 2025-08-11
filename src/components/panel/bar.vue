<template>
  <div class="bar">
    <div class="func-content" v-show="isTip">
      <el-tooltip
        class="item"
        effect="dark"
        content="图层顺序"
        placement="top"
        :disabled="islocked"
      >
        <i class="iconfont icon-cengji" @click.stop="onLayerShow"></i>
      </el-tooltip>
    </div>
    <div class="func-content" v-show="isTip">
      <el-tooltip
        class="item"
        effect="dark"
        content="翻转"
        placement="top"
        :disabled="islocked"
      >
        <i class="iconfont icon-zuoyoufanzhuan" @click.stop="handleFlip"></i>
      </el-tooltip>
    </div>
    <div class="func-content" v-show="isTip">
      <Checkbox
        :className="'iconfont icon-unlock'"
        :activeName="'icon-suoding_huaban'"
        content="锁定图层"
        :initValue="locked"
        typeKey="locked"
        effect="dark"
        placement="top"
        @change="myCheck"
      />
    </div>
    <div class="func-content" v-show="isTip">
      <el-tooltip
        class="item"
        effect="dark"
        content="创建副本"
        placement="top"
        :disabled="islocked"
      >
        <i class="iconfont icon-fuzhi" @click="copy"></i>
      </el-tooltip>
    </div>
    <div class="func-content" v-show="isTip">
      <el-tooltip
        class="item"
        effect="dark"
        content="删除"
        placement="top"
        :disabled="islocked"
      >
        <i
          class="iconfont icon-delete"
          @click="handleDelete"
          :class="islocked ? 'icon_noactive' : ''"
        ></i>
      </el-tooltip>
    </div>
  </div>
</template>
<script>
import Checkbox from "./checkbox.vue";
import { mapState } from "vuex";

export default {
  components: {
    Checkbox,
  },
  props: {
    onChange: {
      type: Function,
    },
    canvasRef: {
      type: Object,
    },
    barShow: {
      type: Array,
      default: () => ["locked", "layer", "flip", "copy", "delete"],
    },
    poi: {
      type: String,
      default: "bottom",
    },
  },

  computed: {
    ...mapState(["currentItem"]),
    islocked() {
      return false;
    },
  },
  inject: {
    canvas: {
      from: "canvas",
      default: () => {},
    },
  },
  data() {
    return {
      locked: { locked: false },
      isTip:false
    };
  },

  methods: {
    handleFlip() {
       const canvas = this.canvas;

      if (this.currentItem) {
        // 获取当前图层的缩放比例
        const scaleX = this.currentItem.scaleX || 1;
        const scaleY = this.currentItem.scaleY || 1;
        
        // 计算缩放后的实际尺寸
        const scaledWidth = this.currentItem.width * scaleX;
        const scaledHeight = this.currentItem.height * scaleY;
        
        console.log('图层缩放信息:', {
          scaleX: scaleX,
          scaleY: scaleY,
          originalSize: { width: this.currentItem.width, height: this.currentItem.height },
          scaledSize: { width: scaledWidth, height: scaledHeight }
        });

        // 计算居中位置（考虑缩放后的尺寸）
        const centerLeft = (1000 - scaledWidth) / 2;
        const centerTop = (2000 - scaledHeight) / 2;

        this.currentItem.set({
          left: centerLeft, // 水平居中
          top: centerTop, // 垂直居中
        });
        
        // 更新对象坐标
        this.currentItem.setCoords();
        canvas.renderAll();
      }
    },
    myCheck() {
      if (this.currentItem) {
        this.currentItem.set({
          lockMovementX: !this.currentItem.lockMovementX,
          lockMovementY: !this.currentItem.lockMovementY,
          // this.locked = this.currentItem.lockMovementX
        });
      }
    },
    getBarShow(type) {
      return this.barShow.includes(type);
    },
    copy() {
      const canvas = this.canvas;
      if (this.currentItem) {
        this.currentItem.clone(function (clonedObj) {
          // 调整新对象的位置（向右下方偏移 20px）
          clonedObj.set({
            left: clonedObj.left + 20,
            top: clonedObj.top + 20,
          });

          // 添加到画布
          canvas.add(clonedObj);
          canvas.renderAll();
          console.log("对象已复制:", clonedObj);
        });
      }
    },
    handleDelete() {
      const canvas = this.canvas;
      console.log(this.currentItem);
      if (this.currentItem) {
        canvas.remove(this.currentItem); // 删除对象
        canvas.renderAll(); // 渲染画布
      }
    },
  },
  watch: {
    currentItem: {
      handler(newValue, oldValue) {
        // 在这里处理 currentItem 变化的逻辑
        if (newValue) {
          if(newValue.id == "workarea"){
            this.isTip = false
          }else{
            this.isTip = true
          }
          // 判断当前选中的元素是否为工作区
          newValue.id == "workarea"
            ? (this.locked.locked = false)
            : (this.locked.locked = newValue.lockMovementX);
        } else {
          console.log("没有选中的元素");
          this.locked.locked = false;
        }
      },
      immediate: true, // 立即执行一次
      deep: true, // 深度监听对象变化
    },
  },
};
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
