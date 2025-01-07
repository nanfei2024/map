<template>
  <div class="file-details">
    <h2>文件详情</h2>
    <el-row gutter={20}>
      <!-- 左侧：PDF 和概述 -->
      <el-col :span="12">
        <div class="left-panel">
          <h3>文章 PDF</h3>
          <div v-if="file?.file_type === 'article'">
            <div id="pdf-container"></div> <!-- PDF 渲染区域 -->
          </div>
          <div v-else>
            <p>暂无 PDF 文件</p>
          </div>

          <h3>文章概述</h3>
          <div v-if="file?.details">
            <p>{{ file.details }}</p>
          </div>
          <div v-else>
            <p>暂无概述</p>
          </div>
        </div>
      </el-col>

      <!-- 右侧：图片 -->
      <el-col :span="12">
        <div class="right-panel">
          <h3>文件图片</h3>
          <div v-if="file?.file_type === 'image'">
            <img :src="file?.file_path" alt="图片展示" width="100%" />
          </div>
          <div v-else>
            <p>暂无图片</p>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-button type="primary" @click="goBack" style="margin-top: 20px;">返回</el-button>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import * as pdfjsLib from 'pdfjs-dist';

// 设置 Worker 的路径，确保路径正确指向你的 pdf.worker.min.mjs 文件
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

interface FileDetail {
  id: number;
  property: string;
  file_type: string;
  file_path: string;
  details?: string;
}

export default defineComponent({
  setup() {
    const file = ref<FileDetail | null>(null);
    const route = useRoute();
    const router = useRouter();
    const currentPage = ref(1); // 当前页码
    const totalPages = ref(0);  // 总页数

    // 根据文件ID获取文件详情
    const fetchFileDetails = async () => {
      const fileId = route.params.id;
      try {
        const response = await fetch(`http://localhost:8080/api/files/details/${fileId}`);
        if (response.ok) {
          file.value = await response.json();
          if (file.value?.file_type === 'article') {
            // 获取相对路径后拼接完整的 URL
            const pdfUrl = `http://localhost:8080${file.value.file_path}`;
            loadPdf(pdfUrl); // 加载 PDF
          }
        } else {
          console.error('获取文件详情失败', await response.text());
          ElMessage.error('获取文件详情失败');
        }
      } catch (error) {
        console.error('获取文件详情失败', error);
        ElMessage.error('网络错误，请稍后再试');
      }
    };

    // 加载PDF文件
    const loadPdf = (url: string) => {
      const loadingTask = pdfjsLib.getDocument(url);
      loadingTask.promise.then((pdf) => {
        totalPages.value = pdf.numPages;
        renderPage(currentPage.value, pdf);  // 渲染当前页

        // 监听滚轮事件进行翻页
        const pdfContainer = document.getElementById('pdf-container');
        if (pdfContainer) {
          pdfContainer.addEventListener('wheel', (event) => {
            if (event.deltaY > 0) {
              // 向下滚动，翻到下一页
              if (currentPage.value < totalPages.value) {
                currentPage.value++;
                renderPage(currentPage.value, pdf);
              }
            } else {
              // 向上滚动，翻到上一页
              if (currentPage.value > 1) {
                currentPage.value--;
                renderPage(currentPage.value, pdf);
              }
            }
          });
        }
      }).catch((error) => {
        console.error('Error loading PDF:', error);
        ElMessage.error('加载 PDF 失败');
      });
    };

    // 渲染页面
    const renderPage = (pageNum: number, pdf: any) => {
      pdf.getPage(pageNum).then((page) => {
        const scale = 1.5; // 缩放比例
        const viewport = page.getViewport({ scale });

        // 创建 canvas 元素
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // 渲染当前页到 canvas
        page.render({
          canvasContext: context!,
          viewport: viewport,
        }).promise.then(() => {
          // 将 canvas 元素插入到容器中
          const pdfContainer = document.getElementById('pdf-container');
          if (pdfContainer) {
            pdfContainer.innerHTML = ''; // 清空之前的内容
            pdfContainer.appendChild(canvas);
          }
        });
      });
    };

    const goBack = () => {
      router.go(-1);
    };

    onMounted(fetchFileDetails);

    return {
      file,
      goBack,
    };
  },
});
</script>

<style scoped>
.file-details {
  padding: 20px;
}

.left-panel, .right-panel {
  padding: 10px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background-color: #fff;
}

.left-panel {
  margin-right: 20px;
}

h3 {
  font-size: 18px;
  margin-bottom: 10px;
}

img {
  border-radius: 8px;
}

.el-row {
  margin-top: 20px;
}

.el-col {
  padding: 10px;
}
</style>
