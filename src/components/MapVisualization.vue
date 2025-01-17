<template>
  <div class="map-container">
    <!-- 左上角功能控制组件 -->
    <div class="top-controls">
      <div class="control-buttons">
        <div class="control-btn" @click="toggleFileUpload">
          <span class="btn-icon">📤</span>
          <span class="btn-text">文件上传</span>
        </div>
        <div class="control-btn" @click="toggleFilePagination">
          <span class="btn-icon">📋</span>
          <span class="btn-text">文件列表</span>
        </div>
        <div class="control-btn" @click="toggleMap">
          <span class="btn-icon">🗺️</span>
          <span class="btn-text">地图显示</span>
        </div>
      </div>
      
      <!-- 显示的组件 -->
      <div class="panel-content" v-if="showAnyComponent">
        <FileUpload v-if="showFileUpload" />
        <FilePagination v-if="showFilePagination" />
      </div>
    </div>

    <!-- 添加分屏容器 -->
    <div class="split-container" :class="{ 'split-active': showBookViewer }">
      <!-- 左侧地图区域 -->
      <div class="map-section" :class="{ 'map-shrink': showBookViewer }">
        <div id="map" ref="mapContainer">
          <!-- 测量工具栏 -->
          <div class="measure-toolbar">
            <button 
              class="measure-btn"
              @click="toggleMeasurement('distance')"
              :class="{ active: currentTool === 'distance' }"
            >
              <span class="icon">📏</span>
              <span>测距</span>
            </button>
            <button 
              class="measure-btn"
              @click="toggleMeasurement('area')"
              :class="{ active: currentTool === 'area' }"
            >
              <span class="icon">⬡</span>
              <span>测面</span>
            </button>
            <button 
              class="measure-btn"
              @click="clearMeasurements"
            >
              <span class="icon">🗑️</span>
              <span>清除</span>
            </button>
          </div>

          <!-- 重置视图图标 -->
          <div class="reset-view-icon" @click="resetView" title="重置视图">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g class="globe-paths">
                <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/>
                <path d="M12 3C12 3 8 7 8 12C8 17 12 21 12 21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <path d="M12 3C12 3 16 7 16 12C16 17 12 21 12 21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <path d="M3 12H21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </g>
            </svg>
          </div>

          <!-- 图层控制面板 -->
          <div id="controls">
            <h3>专题底图数据</h3>
            <!-- 添加清除按钮 -->
            <div class="clear-button-container">
              <button class="clear-button" @click="clearAllLayers" :disabled="!activeLayers.length">
                <span class="clear-icon">🗑️</span>
                <span>清除所有图层</span>
              </button>
            </div>
            <!-- 底图选择下拉框 -->
            <div class="basemap-selector">
              <div class="selector-header" @click="toggleBasemapList">
                <span>底图选择</span>
                <span class="arrow">{{ showBasemapList ? '▼' : '▶' }}</span>
              </div>
              <div class="basemap-list" v-show="showBasemapList">
                <div 
                  v-for="map in basemaps" 
                  :key="map.id"
                  class="basemap-item"
                  :class="{ active: currentBasemap === map.id }"
                  @click="changeBasemap(map.id)"
                >
                  {{ map.name }}
                </div>
              </div>
            </div>
            <!-- 专题图层列表 -->
            <ul>
              <li v-for="(group, index) in layerGroups" :key="index">
                <div @click="toggleGroup(index)" class="group-title">
                  <strong>{{ group.title }}</strong>
                  <span>{{ group.expanded ? "-" : "+" }}</span>
                </div>
                <ul v-show="group.expanded" class="layer-list">
                  <li v-for="layer in group.layers" :key="layer.name">
                    <input
                      type="checkbox"
                      :value="layer.name"
                      v-model="activeLayers"
                      @change="toggleLayer(layer)"
                    />
                    <label>{{ layer.name }}</label>
                  </li>
                </ul>
              </li>
            </ul>
          </div>
          
          <!-- 添加 AI 对话框 -->
          <AIChatBox 
            v-if="map"
            :map="map"
            @toggleLayers="handleToggleLayers"
          />
        </div>
      </div>

      <!-- 右侧书籍查看器 -->
  <div class="book-viewer" :class="{ 'viewer-show': showBookViewer }">
    <div class="viewer-header">
      <h3>{{ currentBook.title || '板块信息' }}</h3>
      <button class="close-viewer" @click="closeBookViewer">
        <span class="close-icon">×</span>
      </button>
    </div>
    
    <div class="viewer-content">
      <!-- 切换按钮组 -->
      <div class="content-tabs">
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'info' }"
          @click="switchTab('info')"
        >
          书籍信息
        </button>
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'text' }"
          @click="switchTab('text')"
        >
          文字内容
        </button>
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'image' }"
          @click="switchTab('image')"
        >
          图片展示
        </button>
      </div>
      
      <!-- 内容显示区域 -->
      <div class="content-display">
        <iframe 
          v-if="activeTab === 'info' && pdfUrl"
          :src="pdfUrl"
          frameborder="0"
          class="content-iframe"
        ></iframe>
        <iframe 
          v-if="activeTab === 'text' && mdUrl"
          :src="mdUrl"
          frameborder="0"
          class="content-iframe"
        ></iframe>
        <iframe 
          v-if="activeTab === 'image' && imageUrl"
          :src="imageUrl"
          frameborder="0"
          class="content-iframe"
        ></iframe>
      </div>
    </div>
  </div>
    </div>
  </div>
</template>

<script setup>
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { ref, onMounted, nextTick, computed } from "vue";
import AIChatBox from './AIChatBox.vue';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import * as turf from '@turf/turf';
import FileUpload from './FileUpload.vue';
import FilePagination from './FilePagination.vue';
import axios from 'axios';
import { ElMessage } from 'element-plus';
import * as pdfjsLib from 'pdfjs-dist';
import { marked } from 'marked'; // 引入marked.js用于渲染Markdown

// 设置 Worker 的路径，确保路径正确指向你的 pdf.worker.min.mjs 文件
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';


// Mapbox 相关初始化
mapboxgl.accessToken =
  "pk.eyJ1IjoiY3VkODUiLCJhIjoiY2xrYnFncXZhMGc1cTNlbmFrNHN1N2cxeCJ9.69E3f8nMJkvqQDRhLSojVw";

const mapContainer = ref(null);
const map = ref(null);
const draw = ref(null);
const currentTool = ref(null);
const activeLayers = ref([]); // 当前激活的图层数组

// 图层分组配置
const layerGroups = ref([
  {
    title: "专题地图数据",
    expanded: false,
    layers: [
      {
        name: "亚洲陆地",
        url: "http://172.21.252.158:8181/geoserver/geoData/ows",
        type: "WFS",
        layerName: "geoData:Asian land",
      },
      {
        name: "亚洲海洋",
        url: "http://172.21.252.158:8181/geoserver/geoData/ows",
        type: "WFS",
        layerName: "geoData:AsianOceanpolygon",
      },
      {
        name: "三角洲",
        url: "http://172.21.252.158:8181/geoserver/geoData/ows",
        type: "WFS",
        layerName: "geoData:Asiandelta",
      },
      {
        name: "亚洲气候与地貌",
        url: "http://172.21.252.158:8181/geoserver/geoData/ows",
        type: "WFS",
        layerName: "geoData:AsianClimateAndLandforms",
      },
      {
        name: "亚洲气候水文",
        url: "http://172.21.252.158:8181/geoserver/geoData/ows",
        type: "WFS",
        layerName: "geoData:AsianClimateWater",
      },
      {
        name: "亚洲气候线",
        url: "http://172.21.252.158:8181/geoserver/geoData/ows",
        type: "WFS",
        layerName: "geoData:AsianClimateLine",
      },
      {
        name: "亚洲气候多边形",
        url: "http://172.21.252.158:8181/geoserver/geoData/ows",
        type: "WFS",
        layerName: "geoData:AsianClimatePolygon",
      },
      {
        name: "主板块",
        url: "http://172.21.252.158:8181/geoserver/geoData/ows",
        type: "WFS",
        layerName: "geoData:MainPlates",
      },
      {
        name: "亚板块",
        url: "http://172.21.252.158:8181/geoserver/geoData/ows",
        type: "WFS",
        layerName: "geoData:SubPlates",
      },
      {
        name: "全球活动构造板块及其边界带数据集(2022年)",
        url: "http://172.21.252.158:8181/geoserver/geoData/wms?service=WMS&version=1.1.0&request=GetMap&layers=geoData%3Aplates&bbox=-181.8000030517578%2C-90.89899444580078%2C181.8000030517578%2C90.89999389648438&width=768&height=383&srs=EPSG%3A4326&styles=&format=image%2Fpng",
        type: "WMS",
      },
      {
        name: "全球板块边界及其类型数据集(2022年)",
        url: "http://172.21.252.158:8181/geoserver/geoData/wms?service=WMS&version=1.1.0&request=GetMap&layers=geoData%3Aboundaries&bbox=-179.99900817871094%2C-65.93688201904297%2C180.0%2C87.02627563476562&width=768&height=330&srs=EPSG%3A4326&styles=&format=image%2Fpng",
        type: "WMS",
      },
      {
        name: "全球海洋大陆地壳边界数据集(2022年)",
        url: "http://172.21.252.158:8181/geoserver/geoData/wms?service=WMS&version=1.1.0&request=GetMap&layers=geoData%3Aoc_boundaries&bbox=-181.8000030517578%2C-77.21341705322266%2C181.8000030517578%2C90.40480041503906&width=768&height=354&srs=EPSG%3A4326&styles=&format=image%2Fpng",
        type: "WMS",
      },
      {
        name: "全球地质区域及其类型和最后一次造山事件数据集(2022年)",
        url: "http://172.21.252.158:8181/geoserver/geoData/wms?service=WMS&version=1.1.0&request=GetMap&layers=geoData%3Aglobal_gprv&bbox=-181.8000030517578%2C-90.89899444580078%2C181.8000030517578%2C90.89999389648438&width=768&height=383&srs=EPSG%3A4326&styles=&format=image%2Fpng",
        type: "WMS",
      },
    ],
  },
]);

// 添加底图相关状态
const showBasemapList = ref(false);
const currentBasemap = ref('streets');

// 底图配置
const basemaps = [
  { id: 'streets', name: '街道地图', style: 'mapbox://styles/mapbox/streets-v12' },
  { id: 'satellite', name: '卫星影像', style: 'mapbox://styles/mapbox/satellite-v9' },
  { id: 'light', name: '浅色底图', style: 'mapbox://styles/mapbox/light-v11' },
  { id: 'dark', name: '深色底图', style: 'mapbox://styles/mapbox/dark-v11' },
  { id: 'outdoors', name: '地形图', style: 'mapbox://styles/mapbox/outdoors-v12' }
];

// 切换底图列表显示
const toggleBasemapList = () => {
  showBasemapList.value = !showBasemapList.value;
};

// 切换底图
const changeBasemap = (mapId) => {
  const selectedMap = basemaps.find(m => m.id === mapId);
  if (selectedMap) {
    map.value.setStyle(selectedMap.style);
    currentBasemap.value = mapId;
  }
  showBasemapList.value = false;
};

// 切换分组展开/折叠
const toggleGroup = (index) => {
  layerGroups.value[index].expanded = !layerGroups.value[index].expanded;
};

// 切换图层的显示/隐藏
const toggleLayer = (layer) => {
  if (activeLayers.value.includes(layer.name)) {
    // 如果激活图层中包含该图层，则添加
    addLayer(layer);
  } else {
    // 否则移除
    removeLayer(layer.name);
  }
};

// 添加图层到地图
const addLayer = (layer) => {
  if (layer.type === "WFS") {
    // WFS 图层
    const wfsUrl = `${layer.url}?service=WFS&version=1.0.0&request=GetFeature&typeName=${layer.layerName}&maxFeatures=50&outputFormat=application/json`;

    fetch(wfsUrl)
      .then((response) => response.json())
      .then((data) => {
        // 如果图层已经存在，则不重复添加
        if (map.value.getSource(layer.name)) return;

        // 添加 GeoJSON 数据源
        map.value.addSource(layer.name, {
          type: "geojson",
          data: data,
        });

        // 添加图层
        map.value.addLayer({
          id: layer.name,
          type: "fill", // 根据数据类型可以选择 'fill'、'line'、'circle' 等
          source: layer.name,
          paint: {
            "fill-color": getRandomColor(), // 动态生成颜色
            "fill-opacity": 0.5,
          },
        });
      })
      .catch((error) => {
        console.error("Error loading WFS layer:", error);
        alert("加载图层失败：" + layer.name);
      });
  } else if (layer.type === "WMS") {
    // WMS 图层
    map.value.addLayer({
      id: layer.name,
      type: "raster",
      source: {
        type: "raster",
        tiles: [layer.url],
        tileSize: 256,
      },
      paint: {
        "raster-opacity": 0.7,
      },
    });
  }
};

// 移除图层
const removeLayer = (layerName) => {
  if (map.value.getLayer(layerName)) {
    map.value.removeLayer(layerName);
  }
  if (map.value.getSource(layerName)) {
    map.value.removeSource(layerName);
  }
};

// 随机生成图层颜色
const getRandomColor = () => {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

// 添加清除所有图层的方法
const clearAllLayers = () => {
  // 遍历所有激活的图层并移除
  activeLayers.value.forEach(layerName => {
    removeLayer(layerName);
  });
  // 清空激活图层数组
  activeLayers.value = [];
};

// 处理图层切换
const handleToggleLayers = (layerNames) => {
  layerNames.forEach(name => {
    const layer = layerGroups.value[0].layers.find(l => l.name === name);
    if (layer) {
      if (!activeLayers.value.includes(name)) {
        activeLayers.value.push(name);
        addLayer(layer);
      }
    }
  });
};

// 添加重置视图函数
const resetView = () => {
  map.value.flyTo({
    center: [108.9398, 34.3409], // 中国中心位置
    zoom: 4,  // 适合查看整个中国的缩放级别
    bearing: 0, // 恢复默认方向
    pitch: 0    // 恢复默认俯仰角
  });
};

// 初始化地图
onMounted(async () => {
  if (mapContainer.value) {
    try {
      // 创建地图实例
      map.value = new mapboxgl.Map({
        container: mapContainer.value,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [118.7915619, 32.0615513],
        zoom: 3,
        preserveDrawingBuffer: true
      });

      // 等待地图加载完成
      await new Promise((resolve) => {
        map.value.on('load', () => {
          console.log('Map loaded successfully');
          resolve();
        });
      });

      // 初始化绘图工具
      draw.value = new MapboxDraw({
        displayControlsDefault: false,
        controls: {
          line_string: true,
          polygon: true,
          trash: true
        }
      });

      // 添加绘图控件
      map.value.addControl(draw.value);

      // 添加事件监听
      map.value.on('draw.create', updateMeasurement);
      map.value.on('draw.update', updateMeasurement);
      map.value.on('draw.delete', clearMeasurements);

    } catch (error) {
      console.error('Map initialization error:', error);
    }
  }
});

// 测量相关方法
const toggleMeasurement = (type) => {
  if (currentTool.value === type) {
    currentTool.value = null;
    draw.value?.deleteAll();
    draw.value?.changeMode('simple_select');
  } else {
    currentTool.value = type;
    draw.value?.deleteAll();
    if (type === 'area') {
      draw.value?.changeMode('draw_polygon');
    } else if (type === 'distance') {
      draw.value?.changeMode('draw_line_string');
    }
  }
};

// 更新测量结果显示方法
const updateMeasurement = (e) => {
  if (!e.features.length) return;
  
  const data = e.features[0];
  if (data.geometry.type === 'Polygon' && currentTool.value === 'area') {
    const area = turf.area(data);
    const areaKm = (area / 1000000).toFixed(2);
    
    // 创建一个固定的弹窗
    const popup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false,
      className: 'measurement-result'
    })
      .setLngLat(data.geometry.coordinates[0][0])
      .setHTML(`<div class="measurement-value">面积: ${areaKm} 平方公里</div>`)
      .addTo(map.value);

  } else if (data.geometry.type === 'LineString' && currentTool.value === 'distance') {
    const length = turf.length(data, { units: 'kilometers' }).toFixed(2);
    const coordinates = data.geometry.coordinates;
    
    // 创建一个固定的弹窗
    const popup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false,
      className: 'measurement-result'
    })
      .setLngLat(coordinates[coordinates.length - 1])
      .setHTML(`<div class="measurement-value">距离: ${length} 公里</div>`)
      .addTo(map.value);
  }
};

// 修改清除测量方法
const clearMeasurements = () => {
  draw.value?.deleteAll();
  currentTool.value = null;
  
  // 移除所有测量结果弹窗
  const popups = document.getElementsByClassName('mapboxgl-popup');
  while(popups[0]) {
    popups[0].remove();
  }
};

// 添加地图移动事件监听，更新测量结果位置
onMounted(() => {
  // ... 现有的初始化代码 ...

  // 添加地图移动事件监听
  map.value.on('move', () => {
    const measurementDiv = document.getElementById('measurement-result');
    if (measurementDiv && draw.value.getAll().features.length > 0) {
      const feature = draw.value.getAll().features[0];
      if (feature.geometry.type === 'Polygon') {
        const center = turf.center(feature);
        const point = map.value.project(center.geometry.coordinates);
        measurementDiv.style.left = `${point.x + 10}px`;
        measurementDiv.style.top = `${point.y - 30}px`;
      } else if (feature.geometry.type === 'LineString') {
        const coordinates = feature.geometry.coordinates;
        const endPoint = coordinates[coordinates.length - 1];
        const point = map.value.project(endPoint);
        measurementDiv.style.left = `${point.x + 10}px`;
        measurementDiv.style.top = `${point.y - 30}px`;
      }
    }
  });
});

// 添加分屏相关状态
const showBookViewer = ref(false);
const currentBook = ref({
      title: '',
      infoUrl: '',    // 用于显示书籍信息
      textUrl: '',    // 用于显示文字内容（MD）
      imageUrl: ''  ,  // 用于显示图片
      markdownContent:''
    });
    const activeTab = ref('info');  // 当前选中的 tab

    // 各种文件的 URL
    const pdfUrl = ref('');
    const mdUrl = ref('');
    const imageUrl = ref('');
    const markdownContent = ref('');

    // 当前页数
    const currentPage = ref(1);
    let totalPages = ref(0);
    // 切换 tab
    const switchTab = (tab) => {
      activeTab.value = tab;
      loadContent(tab);
    };
    
     // 加载内容
     const loadContent = () => {
      if (activeTab.value === 'info') {
        loadPdf(pdfUrl.value);
      } else if (activeTab.value === 'text') {
        loadMarkdown(mdUrl.value);
      } else if (activeTab.value === 'image') {
        loadImage(imageUrl.value);
      }
    };
// 加载 PDF 文件
const loadPdf = (url) => {
      const loadingTask = pdfjsLib.getDocument(url);
      loadingTask.promise.then((pdf) => {
        totalPages.value = pdf.numPages;
        renderPage(currentPage.value, pdf); // 渲染当前页

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
    const renderPage = (pageNum, pdf) => {
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
          canvasContext: context,
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

    // 加载 Markdown 文件
    const loadMarkdown = async (url) => {
      try {
        const response = await fetch(url);
        if (response.ok) {
          const mdContent = await response.text();
          markdownContent.value = marked(mdContent); // 通过marked解析Markdown内容
        } else {
          ElMessage.error('加载 Markdown 文件失败');
        }
      } catch (error) {
        console.error('加载 Markdown 失败', error);
        ElMessage.error('加载 Markdown 文件失败');
      }
    };

// 在地图初始化时添加点击事件监听
onMounted(async () => {
  // ... 现有的初始化代码 ...

  // 添加主板块图层点击事件
map.value.on('click', '主板块', (e) => {
  if (e.features.length > 0) {
    const feature = e.features[0];
    const property = feature.properties.属性;  // 获取点击区域的属性

    console.log(`点击区域属性: ${property}`);  // 打印点击的区域属性

    // 设置 currentBook
    currentBook.value = {
      title: property || '板块信息',
      infoUrl: '',  // 初始为空，稍后根据文件内容动态设置
      textUrl: '',
      imageUrl: ''
    };

    // 显示书籍（或文件）详情面板
    showBookViewer.value = true;

    // 触发地图重新渲染以适应新的容器大小
    setTimeout(() => {
      map.value.resize();
    }, 300);

    // 调用你的文件展示功能，可能是通过 `fileDetailPanel.showPanel()` 等
    getFilesByProperty(property);
  }
});

// 获取文件数据并展示
const getFilesByProperty = async (property) => {
  try {
    // 获取文件列表
    const response = await axios.get(`http://localhost:8080/api/files/${property}`);
    console.log(`从后端获取的文件数据:`, response.data);

    if (response.data && response.data.content && response.data.content.length > 0) {
      const files = response.data.content; // 获取文件基本信息
      console.log(`获取到的文件列表:`, files);

      // 按文件类型分类
      const categorizedFiles = {
        pdfFiles: [],
        mdFiles: [],
        imageFiles: []
      };

      files.forEach(file => {
        if (file.file_path.endsWith('.pdf')) {
          categorizedFiles.pdfFiles.push(file);
        } else if (file.file_path.endsWith('.md')) {
          categorizedFiles.mdFiles.push(file);
        } else if (['.jpg', '.jpeg', '.png', '.gif'].some(ext => file.file_path.endsWith(ext))) {
          categorizedFiles.imageFiles.push(file);
        }
      });

      console.log(`分类后的文件:`, categorizedFiles);

      // 获取每种类型的文件详细信息
      const [pdfDetails, mdDetails, imageDetails] = await Promise.all([ 
        getFilesDetailsByType(categorizedFiles.pdfFiles),
        getFilesDetailsByType(categorizedFiles.mdFiles),
        getFilesDetailsByType(categorizedFiles.imageFiles)
      ]);

       // 更新 URL
       if (pdfDetails && pdfDetails.length > 0) {
          pdfUrl.value = `http://localhost:8080${pdfDetails[0].file_path}`;
          console.log(`PDF 文件路径:`, pdfUrl.value);
        }
        if (mdDetails && mdDetails.length > 0) {
          mdUrl.value = `http://localhost:8080${mdDetails[0].file_path}`;
        }
        if (imageDetails && imageDetails.length > 0) {
          imageUrl.value = `http://localhost:8080${imageDetails[0].file_path}`;
        }

      loadContent();  // 根据新的文件路径加载文件
    } else {
      console.log('未找到相关文件');
    }
  } catch (error) {
    console.error('获取文件失败:', error);
  }
};



// 获取每种类型文件的详细信息
const getFilesDetailsByType = async (files) => {
  if (files.length === 0) return null;

  console.log(`正在获取文件详细信息:`, files);

  // 并行请求每个文件的详细信息
  const details = await Promise.all(files.map(file => getFileDetailsById(file.id)));
  console.log(`获取到的文件详细信息:`, details);
  return details;
};

// 请求文件详细信息（例如 PDF 内容、MD 内容、图片路径等）
const getFileDetailsById = async (fileId) => {
  try {
    const response = await axios.get(`http://localhost:8080/api/files/details/${fileId}`); // 根据 ID 请求文件详细信息
    console.log(`获取文件 ${fileId} 详细信息:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`获取文件 ${fileId} 详细信息失败:`, error);
    return null;
  }
};

});

// 关闭书籍查看器
const closeBookViewer = () => {
  showBookViewer.value = false;
  setTimeout(() => {
    map.value.resize();
  }, 300);
};


// 添加状态控制
const showFileUpload = ref(false);
const showFilePagination = ref(false);
const showMap = ref(true);

// 计算是否显示任何组件
const showAnyComponent = computed(() => 
  showFileUpload.value || showFilePagination.value
);

// 切换文件上传组件
const toggleFileUpload = () => {
  showFileUpload.value = !showFileUpload.value;
  showFilePagination.value = false;
};

// 切换文件分页展示组件
const toggleFilePagination = () => {
  showFilePagination.value = !showFilePagination.value;
  showFileUpload.value = false;
};

// 切换地图显示
const toggleMap = () => {
  showMap.value = !showMap.value;
};
</script>

<style scoped>
#map {
  position: relative;
  width: 100%;
  height: 100vh;
}

#controls {
  position: absolute;
  top: 50%;
  right: 20px;
  transform: translateY(-50%);
  z-index: 10;
  background: rgba(250, 251, 252, 0.95);
  padding: 18px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  max-height: 80vh;
  overflow-y: auto;
  min-width: 300px;
  max-width: 400px;
  transition: all 0.3s ease;
}

#controls h3 {
  margin: 0 0 15px 0;
  color: #2f363d;
  font-size: 15px;
  font-weight: 600;
  border-bottom: 2px solid #eaecef;
  padding-bottom: 8px;
  text-align: center;
  position: relative;
}

#controls h3::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 50%;
  transform: translateX(-50%);
  width: 100px;
  height: 2px;
  background: #409eff;
}

#controls ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

#controls li {
  margin-bottom: 8px;
}

#controls .group-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  padding: 8px 12px;
  background: #f6f8fa;
  border: 1px solid #eaecef;
  border-radius: 6px;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f1f3f5;
    border-color: #e1e4e8;
  }
}

#controls .group-title strong {
  font-size: 14px;
  color: #444d56;
}

#controls .group-title span {
  color: #6a737d;
  font-size: 16px;
  font-weight: bold;
}

#controls .layer-list {
  padding: 8px 12px 8px 24px;
  background: #ffffff;
  border-radius: 4px;
  margin: 4px 0;
  
  li {
    display: flex;
    align-items: center;
    padding: 4px 0;
    transition: background-color 0.2s ease;
    border-radius: 4px;
    
    &:hover {
      background: #f6f8fa;
    }
  }
}

#controls input[type="checkbox"] {
  margin-right: 8px;
  cursor: pointer;
  width: 16px;
  height: 16px;
  accent-color: #6c8eef;
}

#controls label {
  cursor: pointer;
  font-size: 13px;
  color: #4a5568;
  
  &:hover {
    color: #2d3748;
  }
}

/* 添加清除按钮容器样式 */
.clear-button-container {
  margin-bottom: 16px;
  padding: 0 4px;
}

.clear-button {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 12px;
  background: #f5f6f7;
  border: 1px solid #e1e4e8;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #666;
  font-size: 13px;
}

.clear-button:hover:not(:disabled) {
  background: #fee2e2;
  border-color: #ef4444;
  color: #dc2626;
}

.clear-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.clear-icon {
  margin-right: 6px;
  font-size: 16px;
}

/* 添加底图选择器样式 */
.basemap-selector {
  margin-bottom: 16px;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  overflow: hidden;
}

.selector-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background: #f6f8fa;
  cursor: pointer;
  transition: all 0.2s ease;
}

.selector-header:hover {
  background: #ecf5ff;
}

.arrow {
  font-size: 12px;
  color: #909399;
}

.basemap-list {
  background: #fff;
}

.basemap-item {
  padding: 8px 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.basemap-item:hover {
  background: #f5f7fa;
}

.basemap-item.active {
  background: #ecf5ff;
  color: #409eff;
}

/* 重置视图按钮样式 */
.reset-view-icon {
  position: absolute;
  top: 20px;
  left: 20px;
  width: 32px;
  height: 32px;
  cursor: pointer;
  z-index: 1000;
  opacity: 0.9;
  transition: all 0.3s ease;
  color: #3B82F6;
  filter: drop-shadow(0 2px 4px rgba(59, 130, 246, 0.2));
}

.reset-view-icon svg {
  width: 100%;
  height: 100%;
}

.reset-view-icon:hover {
  transform: scale(1.1) rotate(180deg);
  filter: drop-shadow(0 4px 8px rgba(59, 130, 246, 0.4));
}

.reset-view-icon:active {
  transform: scale(0.95) rotate(180deg);
}

/* 添加笔画动画效果 */
.globe-paths {
  stroke-dasharray: 100;
  animation: drawGlobe 2s ease-out forwards;
}

@keyframes drawGlobe {
  from {
    stroke-dashoffset: 100;
  }
  to {
    stroke-dashoffset: 0;
  }
}

/* 添加毛玻璃效果 */
@supports (backdrop-filter: blur(4px)) {
  .reset-view-btn {
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(4px);
  }
}

/* 适配深色模式 */
@media (prefers-color-scheme: dark) {
  .reset-view-btn {
    background: rgba(31, 41, 55, 0.9);
  }
  
  .btn-text {
    color: #e5e7eb;
  }
  
  .reset-icon {
    color: #60a5fa;
  }
  
  .btn-backdrop {
    background: linear-gradient(
      135deg,
      rgba(96, 165, 250, 0.1),
      rgba(59, 130, 246, 0.1)
    );
  }
  
  .reset-view-btn:hover .reset-icon,
  .reset-view-btn:hover .btn-text {
    color: #93c5fd;
  }
}

/* 修改测量工具栏位置 */
.measure-toolbar {
  position: absolute;
  top: 20px;
  left: 70px;  /* 修改左边距，为重置视图按钮留出空间 */
  display: flex;
  gap: 8px;
  z-index: 1;
}

/* 优化测量按钮样式，使其与重置视图按钮更协调 */
.measure-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;  /* 稍微调整padding */
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;  /* 稍微调小字号 */
  color: #374151;
  transition: all 0.2s;
  height: 32px;  /* 设置固定高度，与重置视图按钮对齐 */
}

.measure-btn:hover {
  background: #f9fafb;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.measure-btn.active {
  background: #ede9fe;
  border-color: #6366f1;
  color: #4f46e5;
}

/* 测量结果弹窗样式 */
.mapboxgl-popup {
  z-index: 2;
}

.mapboxgl-popup-content {
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 确保地图容器有正确的尺寸 */
#map {
  width: 100%;
  height: 100vh;
  position: relative;
}

/* 确保地图控件在正确的层级 */
.mapboxgl-control-container {
  z-index: 1;
}

.measurement-result-box {
  position: absolute;
  background: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  pointer-events: none;
  z-index: 1000;
  transition: all 0.2s ease;
  border: 1px solid #e5e7eb;
  white-space: nowrap;
}

/* 添加一个小箭头 */
.measurement-result-box::before {
  content: '';
  position: absolute;
  left: -6px;
  top: 50%;
  transform: translateY(-50%);
  border-style: solid;
  border-width: 6px 6px 6px 0;
  border-color: transparent white transparent transparent;
}

/* 测量结果样式 */
.measurement-result {
  z-index: 1000;
}

.measurement-result .mapboxgl-popup-content {
  background: white;
  padding: 8px 12px;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  border: 1px solid #e5e7eb;
}

.measurement-value {
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
  white-space: nowrap;
}

/* 隐藏弹窗尖角 */
.measurement-result .mapboxgl-popup-tip {
  display: none;
}

/* 分屏布局样式 */
.split-container {
  width: 100%;
  height: 100vh;
  display: flex;
  position: relative;
  overflow: hidden;
}

/* 左侧地图区域样式 */
.map-section {
  position: relative;
  flex: 1;
  transition: all 0.3s ease;
  transform-origin: left top;
}

/* 分屏时的缩放效果 */
.map-section.map-shrink {
  flex: 0 0 60%;
  transform: scale(0.8);
  
  /* 调整控件位置和缩放 */
  #controls {
    position: absolute;
    top: 50%;
    right: 20px;
    transform: translateY(-50%) scale(0.9);
    transform-origin: right center;
  }
  
  /* 增大测量工具栏的缩放比例 */
  .measure-toolbar {
    transform: scale(1.1);  /* 从 0.9 改为 1.1 */
    transform-origin: left top;
    left: 70px;
  }
  
  .reset-view-icon {
    transform: scale(0.9);
    transform-origin: left top;
    left: 20px;
  }
  
  .ai-chat-box {
    transform: scale(0.9);
    transform-origin: right bottom;
    right: 20px;
  }

  /* 补偿地图容器尺寸 */
  #map {
    width: 125%;
    height: 125%;
    transform-origin: left top;
  }
}

/* 右侧书籍查看器样式 */
.book-viewer {
  position: absolute;
  right: -40%;
  top: 0;
  width: 40%;
  height: 100%;
  background: white;
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  z-index: 1000;
  display: flex;
  flex-direction: column;
}

.book-viewer.viewer-show {
  right: 0;
}

.viewer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.close-viewer {
  background: none;
  border: none;
  font-size: 24px;
  color: #6b7280;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.2s;
}

.close-viewer:hover {
  background: #fee2e2;
  color: #ef4444;
}

.viewer-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.content-tabs {
  padding: 16px 16px 0;
  display: flex;
  gap: 8px;
  border-bottom: 1px solid #e5e7eb;
  background: #fff;
}

.tab-btn {
  padding: 8px 16px;
  border: 1px solid #e5e7eb;
  border-bottom: none;
  border-radius: 8px 8px 0 0;
  background: #f9fafb;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  
  &:hover {
    background: #f3f4f6;
    color: #374151;
  }
  
  &.active {
    background: #fff;
    color: #3b82f6;
    border-color: #e5e7eb;
    margin-bottom: -1px;
    border-bottom: 1px solid #fff;
  }
}

.content-display {
  flex: 1;
  padding: 16px;
  overflow: hidden;
  background: #fff;
}

.content-iframe {
  width: 100%;
  height: 100%;
  border: none;
  border-radius: 8px;
  background: #fff;
}

/* 自定义滚动条 */
.viewer-content::-webkit-scrollbar {
  width: 6px;
}

.viewer-content::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.viewer-content::-webkit-scrollbar-thumb {
  background: #c0c4cc;
  border-radius: 3px;
}

.viewer-content::-webkit-scrollbar-thumb:hover {
  background: #909399;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .map-section.map-shrink {
    display: none;
  }
  
  .book-viewer {
    width: 100%;
    right: -100%;
  }
  
  .book-viewer.viewer-show {
    right: 0;
    width: 100%;
  }
}

/* 添加左上角功能控制组件样式 */
.top-controls {
  position: absolute;
  top: 120px;  /* 保持向下偏移 */
  left: 70px;  /* 与测量工具栏左对齐 */
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 284px;  /* 设置固定宽度，与测量工具栏宽度一致 */
}

.control-buttons {
  display: flex;
  flex-direction: row;
  justify-content: space-between;  /* 改为两端对齐 */
  gap: 8px;
  background: rgba(255, 255, 255, 0.95);
  padding: 8px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  width: 100%;  /* 占满容器宽度 */
}

.control-btn {
  flex: 1;  /* 平均分配空间 */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px;
  background: #f5f7fa;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 64px;
  height: 40px;
}

.control-btn:hover {
  background: #ecf5ff;
  border-color: #409eff;
  transform: translateY(-2px);
}

.btn-icon {
  font-size: 20px;
  margin-bottom: 4px;
}

.btn-text {
  font-size: 12px;
  color: #606266;
}

.panel-content {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 16px;
  max-width: 320px;
}

/* 调整专题底图数据面板的基础尺寸 */
#controls {
  min-width: 300px;
  max-width: 400px;
  padding: 20px;
}

/* 调整测量工具栏按钮的大小 */
.measure-btn {
  padding: 8px 16px;
  height: 40px;       /* 增加高度 */
  font-size: 15px;    /* 增加字体大小 */
  min-width: 90px;    /* 添加最小宽度 */
  
  .icon {
    font-size: 18px;  /* 增加图标大小 */
  }
}
</style>