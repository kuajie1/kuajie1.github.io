<template>
  <div class="audio-player">
    <audio v-if="src" :src="src" controls preload="metadata"></audio>
    <div v-else class="player-note">
      ⚠️ 音频待补充：将文件放入 <code>public/audio/</code> 后传入 <code>src</code>。
    </div>
  </div>
</template>

<script>
export default {
  name: 'AudioPlayer',
  props: {
    src: { type: String, default: '' },
  },
}
</script>

<style scoped>
.audio-player { margin: 12px 0; }
.player-note {
  font-size: 13px;
  color: #b8860b;
  background: rgba(201, 168, 108, 0.12);
  border: 1px dashed rgba(201, 168, 108, 0.5);
  border-radius: 8px;
  padding: 10px 14px;
}
</style>
