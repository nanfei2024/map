<template>
  <div class="pagination-container">
    <h2 class="pagination-title">文章章节</h2>

    <!-- 当数据加载成功并且有分页数据时，渲染分页按钮 -->
    <div class="pagination-buttons" v-if="pages.length > 0">
      <button v-for="page in pages" :key="page.pageNumber" @click="goToPage(page.pageNumber)" class="pagination-button">
        第 {{ page.pageNumber }} 页
      </button>
    </div>

    <!-- 如果没有数据，显示暂无数据 -->
    <p v-if="pages.length === 0 && !loading" class="pagination-message">暂无数据</p>
    <p v-if="loading" class="pagination-message">加载中...</p>

    <!-- 错误消息 -->
    <p v-if="articleMessage" class="pagination-message">{{ articleMessage }}</p>

    <!-- 显示当前页的章节 -->
    <div v-if="currentPageSections.length > 0" class="sections-container">
      <ul>
        <li v-for="section in currentPageSections" :key="section.number">
          {{ section.number }} - {{ section.title }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      pages: [], // 存储分页数据
      currentPageSections: [], // 当前页的章节
      articleMessage: '', // 错误信息
      loading: true, // 加载状态
    };
  },
  methods: {
    // 获取文章章节数据并初始化分页
    async loadArticlePages() {
      try {
        const response = await axios.get('/api/article/sections'); // 获取分页数据
        if (response.data && Array.isArray(response.data)) {
          this.pages = response.data;
          this.currentPageSections = this.pages[0]?.sections || []; // 默认显示第一页的章节
        } else {
          this.articleMessage = '获取文章章节失败';
        }
      } catch (error) {
        this.articleMessage = '加载章节失败: ' + error.message;
      } finally {
        this.loading = false;
      }
    },

    // 跳转到指定页面并更新章节
    goToPage(pageNumber) {
      const page = this.pages.find(page => page.pageNumber === pageNumber);
      if (page) {
        this.currentPageSections = page.sections;
        this.$router.push(/article/page/$,{pageNumber});
      }
    },
  },
  mounted() {
    this.loadArticlePages(); // 页面加载时调用接口
  },
};
</script>

<style scoped>
.pagination-container {
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.pagination-title {
  font-size: 24px;
  text-align: center;
  margin-bottom: 20px;
  color: #333;
}

.pagination-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 10px;
  justify-content: center;
}

.pagination-button {
  padding: 10px;
  font-size: 18px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.pagination-button:hover {
  background-color: #218838;
}

.pagination-message {
  color: #f44336;
  text-align: center;
  margin-top: 20px;
}

.sections-container {
  margin-top: 20px;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  font-size: 16px;
  margin: 10px 0;
  color: #555;
}

@media (max-width: 768px) {
  .pagination-button {
    font-size: 16px;
    padding: 8px;
  }
}
</style>