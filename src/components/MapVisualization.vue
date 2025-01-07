<template>
  <div id="map" ref="mapContainer">
    <!-- 图层控制面板 -->
    <div id="controls">
      <h3>专题地质数据</h3>
      <ul>
        <li v-for="(group, index) in layerGroups" :key="index">
          <!-- 显示分组标题 -->
          <div @click="toggleGroup(index)" class="group-title">
            <strong>{{ group.title }}</strong>
            <span>{{ group.expanded ? "-" : "+" }}</span>
          </div>
          <!-- 显示组内的图层 -->
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

     <!-- 展示文章和图片 -->
     <div v-if="articles.length > 0" class="content-panel">
      <h2>相关文章</h2>
      <ul>
        <li v-for="article in articles" :key="article.id">
          <!-- 显示文章文件路径 -->
          <a :href="article.filePath" target="_blank">{{ article.filePath }}</a>
          <p>{{ article.file_type }}</p> <!-- 显示文件类型 -->
        </li>
      </ul>
    </div>

    <div v-if="images.length > 0" class="content-panel">
      <h2>相关图片</h2>
      <ul>
        <li v-for="image in images" :key="image.id">
          <img :src="image.filePath" alt="Image" />
        </li>
      </ul>
    </div>

    <!-- 错误信息显示 -->
    <div v-if="errorMessage" class="error-message">
      <p>{{ errorMessage }}</p>
    </div>
  </div>
</template>

<script setup>
import mapboxgl from "mapbox-gl";
import axios from "axios";
import { ref, onMounted, nextTick } from "vue";
import "mapbox-gl/dist/mapbox-gl.css";
import { useRouter } from 'vue-router';  // 引入 vue-router

// Mapbox 相关初始化
mapboxgl.accessToken =
  "pk.eyJ1IjoiY3VkODUiLCJhIjoiY2xrYnFncXZhMGc1cTNlbmFrNHN1N2cxeCJ9.69E3f8nMJkvqQDRhLSojVw";

const map = ref(null);
const activeLayers = ref([]); // 当前激活的图层数组

// 错误信息
const errorMessage = ref(null);

// 图层分组配置
const layerGroups = ref([
  {
    title: "WFS 图层",
    expanded: false, // 控制分组展开/折叠
    layers: [
      {
        name: "Asian Land",
        url: "http://172.21.252.158:8181/geoserver/geoData/ows",
        type: "WFS",
        layerName: "geoData:Asian land",
      },
      {
        name: "Asian Ocean Polygon",
        url: "http://172.21.252.158:8181/geoserver/geoData/ows",
        type: "WFS",
        layerName: "geoData:AsianOceanpolygon",
      },
      {
        name: "Asian Delta",
        url: "http://172.21.252.158:8181/geoserver/geoData/ows",
        type: "WFS",
        layerName: "geoData:Asiandelta",
      },
      {
        name: "Asian Climate and Landforms",
        url: "http://172.21.252.158:8181/geoserver/geoData/ows",
        type: "WFS",
        layerName: "geoData:AsianClimateAndLandforms",
      },
      {
        name: "Asian Climate Water",
        url: "http://172.21.252.158:8181/geoserver/geoData/ows",
        type: "WFS",
        layerName: "geoData:AsianClimateWater",
      },
      {
        name: "Asian Climate Line",
        url: "http://172.21.252.158:8181/geoserver/geoData/ows",
        type: "WFS",
        layerName: "geoData:AsianClimateLine",
      },
      {
        name: "Asian Climate Polygon",
        url: "http://172.21.252.158:8181/geoserver/geoData/ows",
        type: "WFS",
        layerName: "geoData:AsianClimatePolygon",
      },
      {
        name: "Main Plates",
        url: "http://172.21.252.158:8181/geoserver/geoData/ows",
        type: "WFS",
        layerName: "geoData:MainPlates",
      },
      {
        name: "Sub Plates",
        url: "http://172.21.252.158:8181/geoserver/geoData/ows",
        type: "WFS",
        layerName: "geoData:SubPlates",
      },
    ],
  },
  {
    title: "WMS 图层",
    expanded: false,
    layers: [
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

const router = useRouter();  // 获取 router 实例

// 存储文章和图片
const articles = ref([]);
const images = ref([]);

// 地图初始化
const initializeMap = () => {
  if (map.value) return;

  map.value = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/streets-v12",
    center: [118.7915619, 32.0615513],
    zoom: 3,
  });

  // 监听地图点击事件
  map.value.on("click", (e) => {
    console.log("地图点击位置:", e.point); // 打印点击的坐标
    const features = map.value.queryRenderedFeatures(e.point);
    console.log("点击的features:", features); // 打印返回的 features

    if (features.length > 0) {
      const feature = features[0];
      const property = feature.properties.属性; // 获取点击区域的 `property`
      console.log("点击区域的属性:", property); // 打印属性

      // 请求对应的文章和图片
      getFilesByProperty(property);
    }
  });
  // 请求后端获取文章和图片，并根据 id 跳转到详情页
const errorMessage = ref(null); // 错误提示

const getFilesByProperty = async (property) => {
  try {
    const response = await axios.get(`http://localhost:8080/api/files/${property}`);
    console.log("从后端获取的文件数据:", response.data); // 打印返回的数据

    if (response.data && response.data.content && response.data.content.length > 0) {
      // 假设获取到的文件数据中包含 id 和 file_type 等信息
      const file = response.data.content[0]; // 这里假设只返回一个文件，可以根据需要进行调整

      // 根据文件的 id 跳转到详情页
      if (file.id) {
        // 使用 Vue Router 跳转到文件详情页
        router.push({ name: "FileDetails", params: { id: file.id } });
        errorMessage.value = null; // 清除错误信息
      }
    } else {
      // 如果没有找到文件，显示错误信息
      errorMessage.value = "未找到相关的文件信息";
    }
  } catch (error) {
    console.error("获取文件失败:", error);
    // 显示错误信息
    errorMessage.value = "获取文件失败，请稍后再试";
  }
};
};

// 切换分组展开/折叠
const toggleGroup = (index) => {
  layerGroups.value[index].expanded = !layerGroups.value[index].expanded;
};

// 切换图层的显示/隐藏
const toggleLayer = (layer) => {
  if (activeLayers.value.includes(layer.name)) {
    addLayer(layer);
  } else {
    removeLayer(layer.name);
  }
};

// 添加图层
const addLayer = (layer) => {
  const wfsUrl = `${layer.url}?service=WFS&version=1.0.0&request=GetFeature&typeName=${layer.layerName}&outputFormat=application/json`;
  axios
    .get(wfsUrl)
    .then((response) => {
      const geojsonData = response.data;
      map.value.addSource(layer.name, {
        type: "geojson",
        data: geojsonData,
      });
      map.value.addLayer({
        id: layer.name,
        type: "fill",
        source: layer.name,
        paint: {
          "fill-color": "#888888",
          "fill-opacity": 0.5,
        },
      });
    })
    .catch((error) => {
      errorMessage.value = `加载图层失败: ${error.message}`;
      console.error("Error adding WFS layer:", error);
    });
};

// 移除图层
const removeLayer = (layerName) => {
  if (map.value.getLayer(layerName)) {
    map.value.removeLayer(layerName);
    map.value.removeSource(layerName);
  }
};

// 请求后端获取文章和图片
const getFilesByProperty = async (property) => {
  try {
    const response = await axios.get(`http://localhost:8080/api/files/${property}`);
    console.log("从后端获取的文件数据:", response.data); // 打印返回的数据

    if (response.data && response.data.content) {
      articles.value = response.data.content.filter((item) => item.fileType === "article");
      images.value = response.data.content.filter((item) => item.fileType === "image");
      errorMessage.value = null; // 清除错误信息
    }
  } catch (error) {
    errorMessage.value = `获取文件失败: ${error.message}`;
    console.error("Error fetching files:", error);
  }
};


onMounted(() => {
  nextTick(() => {
    initializeMap();
  });
});
</script>

<style scoped>
/* 样式保持不变，增加错误信息提示 */
#map {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
}

#controls {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 10;
  background: rgba(255, 255, 255, 0.8);
  padding: 10px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.group-title {
  cursor: pointer;
  font-weight: bold;
}

.layer-list {
  list-style: none;
  padding-left: 20px;
}

.content-panel {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 10;
  background: rgba(255, 255, 255, 0.8);
  padding: 10px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.error-message {
  position: fixed;
  bottom: 20px;
  left: 20px;
  z-index: 20;
  background-color: #f44336;
  color: white;
  padding: 10px;
  border-radius: 5px;
  font-size: 14px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}
</style>
