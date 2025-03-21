<script setup lang="ts">
import TotoroApiWrapper from '~/src/wrappers/TotoroApiWrapper';

const router = useRouter();
const { data } = await useFetch<{ uuid: string; imgUrl: string }>('/api/scanQr');
const message = ref('');
const session = useSession();
const isPolling = ref(false);

const checkScanStatus = async () => {
  if (!data.value?.uuid) return;

  try {
    const scanRes = await $fetch(`/api/scanQr/${data.value.uuid}`);
    const code = (scanRes as { code: string; message: null } | { code: null; message: string })
      .code as string;

    if (code) {
      isPolling.value = false;
      message.value = '扫码成功，正在登录...';

      const loginResult = (
        await Promise.all([TotoroApiWrapper.getLesseeServer(code), TotoroApiWrapper.getAppAd(code)])
      )[0];

      if (!loginResult.token) {
        message.value = loginResult.message as string;
        return;
      }

      // 获取额外信息
      const personalInfo = await TotoroApiWrapper.login({ token: loginResult.token });
      session.value = { ...personalInfo, token: loginResult.token, code, data: null };
      const breq = {
        token: loginResult.token,
        campusId: personalInfo.campusId,
        schoolId: personalInfo.schoolId,
        stuNumber: personalInfo.stuNumber,
      };

      await TotoroApiWrapper.getAppFrontPage(breq);
      await TotoroApiWrapper.getAppSlogan(breq);
      await TotoroApiWrapper.updateAppVersion(breq);
      await TotoroApiWrapper.getAppNotice(breq);

      router.push('/scanned');
    } else if (isPolling.value) {
      setTimeout(checkScanStatus, 1000); // 每秒检查一次
    }
  } catch (e) {
    console.error(e);
    if (isPolling.value) {
      setTimeout(checkScanStatus, 1000);
    }
  }
};

// 开始轮询检测
watch(data, (newData) => {
  if (newData?.uuid && !isPolling.value) {
    isPolling.value = true;
    checkScanStatus();
  }
});

// 组件卸载时停止轮询
onUnmounted(() => {
  isPolling.value = false;
});

// 保留原有的handleScanned作为备选方案
const handleScanned = async () => {
  if (!isPolling.value) {
    isPolling.value = true;
    checkScanStatus();
  }
};
</script>
<template>
  <VCard class="pa-4">
    <VCardText>
      <div class="text-center mb-6">
        <p class="text-body-1 text-medium-emphasis">
          古典时代的人发现人体是权力的对象和目标。……这种人体是被操纵、被塑造、被规训的。它服从，配合，变得灵巧、强壮。"人是机器"这部大书是在两个领域被同时撰写的。
        </p>
        <p class="text-caption text-medium-emphasis mt-2">
          —— 米歇尔·福柯《规训与惩罚》
        </p>
      </div>

      <VDivider class="my-6" />

      <div class="text-center mb-6">
        <p class="text-body-1 mb-4">请用微信扫码，扫码后点击"下一步"按钮</p>
        <VCard :height="200" :width="200" class="mx-auto mb-4" variant="outlined">
          <VCardItem class="h-100 pa-0">
            <img v-if="!message" :src="data!.imgUrl" class="w-100 h-100 object-contain" referrerpolicy="no-referrer" />
            <div v-else class="h-100 w-100 d-flex align-center justify-center text-medium-emphasis">
              {{ message }}
            </div>
          </VCardItem>
        </VCard>

        <VBtn color="primary" size="large" class="mb-6" @click="handleScanned">
          <VIcon class="mr-2">mdi-arrow-right</VIcon>
          下一步
        </VBtn>

        <div class="text-body-2 pre-wrap text-medium-emphasis">
          {{ poem[Math.floor(Math.random() * poem.length)].join('\n') }}
        </div>
      </div>
    </VCardText>
  </VCard>
</template>
