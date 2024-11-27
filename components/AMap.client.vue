<script setup lang="ts">
import AMapLoader from '@amap/amap-jsapi-loader';
import generateRoute from '~/src/utils/generateRoute';
import { useAppConfig } from '#app';

const props = defineProps<{ target: string }>();
const emit = defineEmits<{ (e: 'update:target', target: string): void }>();
const containerRef = ref<HTMLDivElement | null>(null);
const sunrunPaper = useSunRunPaper();
const AMap = shallowRef();
const map = shallowRef();
const routes = computed(() => sunrunPaper.value.runPointList);
const genPolylineAry = () => {
  const target = routes.value.find((route) => route.pointId === props.target);
  if (!target) return [];
  return [
    new AMap.value.Polyline({
      path: [
        generateRoute(sunrunPaper.value.mileage, target).mockRoute.map(
          ({ longitude, latitude }) => new AMap.value.LngLat(Number(longitude), Number(latitude)),
        ),
      ],
      strokeColor: 'red',
      lineJoin: 'round',
      strokeWeight: 2,
      strokeOpacity: 0.5,
    }),
    new AMap.value.Polyline({
      path: [
        target.pointList.map(
          ({ longitude, latitude }) => new AMap.value.LngLat(Number(longitude), Number(latitude)),
        ),
      ],
      strokeColor: 'green',
      lineJoin: 'round',
      strokeWeight: 4,
      strokeOpacity: 0.5,
    }),
  ];
};

const updateLine = () => {
  if (!map.value && !routes.value) return;
  map.value.clearMap();
  map.value.add(genPolylineAry());
  routes.value.forEach((route) => {
    const { pointName, pointId } = route;
    const marker = new AMap.value.Text({
      text: pointName,
      value: pointId,
      anchor: 'center', // 设置文本标记锚点
      cursor: 'pointer',
      angle: 0,
      position: [route.longitude, route.latitude],
      style: {
        'font-family': '"Roboto", "Helvetica", "Arial", "sans-serif"',
      },
    });
    marker.on('click', (event: { target: { _originOpts: { value: string } } }) => {
      emit('update:target', event.target._originOpts.value);
    });
    map.value.add(marker);
  });
  const target = routes.value.find((route) => route.pointId === props.target);
  if (!target) return [];
  const lonlat = [target.longitude, target.latitude];
  map.value.setCenter(lonlat);
  map.value.setZoom(17);
  //updateLine();
};

watch(
  () => props.target,
  () => {
    if (!sunrunPaper.value) return;
    if (!map.value) return;
    updateLine();
  },
);

watch([sunrunPaper, map], () => {
  if (!sunrunPaper.value) return;
  const lonlat = getCenter(sunrunPaper.value.runPointList);
  if (!map.value) return;
  map.value.setCenter([lonlat.lon, lonlat.lat]);
  map.value.setZoom(14);
  updateLine();
});

const appConfig = useAppConfig();

watch(
  () => containerRef.value,
  async () => {
    if (!containerRef.value) return;
    const AMapLoaded = await AMapLoader.load({
      key: appConfig.amapApiKey, // 从配置文件中读取key
      version: '2.0', // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
    });
    AMap.value = AMapLoaded;
    map.value = new AMap.value.Map(containerRef.value);
  },
);
</script>
<template><div id="mapContainer" ref="containerRef" class="h-full w-full" /></template>
