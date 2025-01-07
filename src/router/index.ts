import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '@/views/HomePage.vue';
import FileDetails from '@/components/FileDetails.vue';
import FileEdit from '@/components/FileEdit.vue';
import FilePagination from '@/components/FilePagination.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage,
  },
  {
    path: '/files/details/:id',
    name: 'FileDetails',
    component: FileDetails,
  },
  {
    path: '/files/edit/:id',
    name: 'FileEdit',
    component: FileEdit, // 引用此组件
    props: true, // 允许将路由参数作为 props 传递
  },
  {
    path: '/filepagination',
    name: 'filepagination',
    component: FilePagination,
  },
  
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
