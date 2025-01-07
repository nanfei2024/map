<template>
    <div>
      <h2>文章内容</h2>
      <div v-if="articleContent">
        <h3>{{ articleContent.title }}</h3>
        <div v-html="articleContent.content"></div>
      </div>
      <p v-if="contentMessage">{{ contentMessage }}</p>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    data() {
      return {
        articleContent: null,  // 文章内容
        contentMessage: ''     // 返回信息
      };
    },
    methods: {
      async loadArticleContent() {
        const { pageNumber } = this.$route.params;
        try {
          const response = await axios.get(`/api/article/content/${pageNumber}`);
          this.articleContent = response.data;
        } catch (error) {
          this.contentMessage = '加载文章内容失败: ' + error.message;
        }
      }
    },
    mounted() {
      this.loadArticleContent();
    }
  };
  </script>
  