<template>
  <div class="fz-snow" aria-hidden="true">
    <span
      v-for="(f, i) in flakes"
      :key="i"
      class="fz-flake"
      :style="f"
    >❄</span>
  </div>
</template>

<script setup>
// 精致飘动雪花：多层大小/速度/透明度，缓慢下落 + 水平飘移 + 旋转
const COUNT = 30
const flakes = []
for (let i = 0; i < COUNT; i++) {
  const size = 7 + Math.random() * 17            // 7–24px
  const left = Math.random() * 100                // 0–100vw
  const duration = 9 + Math.random() * 14         // 9–23s 下落一圈
  const delay = -Math.random() * duration         // 负延迟：初始即分布在不同高度
  const drift = Math.random() * 60 - 30           // 水平飘移 ±30px
  const sway = Math.random() * 0.6 + 0.7          // 飘移幅度系数
  const opacity = 0.4 + Math.random() * 0.5       // 0.4–0.9
  const hue = Math.random() > 0.45 ? '#cfeaff' : '#ffffff'
  flakes.push({
    left: left + '%',
    fontSize: size + 'px',
    color: hue,
    opacity: opacity.toFixed(2),
    animationDuration: duration.toFixed(1) + 's',
    animationDelay: delay.toFixed(1) + 's',
    '--drift': (drift * sway).toFixed(1) + 'px',
  })
}
</script>

<style scoped>
.fz-snow {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 3;
  overflow: hidden;
}
.fz-flake {
  position: absolute;
  top: -32px;
  text-shadow: 0 0 8px rgba(150, 210, 255, 0.7), 0 0 2px rgba(255, 255, 255, 0.9);
  animation-name: fz-fall;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
  will-change: transform;
}
@keyframes fz-fall {
  0%   { transform: translate(0, -32px) rotate(0deg); }
  25%  { transform: translate(var(--drift), 28vh) rotate(90deg); }
  50%  { transform: translate(calc(var(--drift) * -1), 55vh) rotate(180deg); }
  75%  { transform: translate(var(--drift), 82vh) rotate(270deg); }
  100% { transform: translate(calc(var(--drift) * -1), 108vh) rotate(360deg); }
}
@media (prefers-reduced-motion: reduce) {
  .fz-flake { animation: none; display: none; }
}
</style>
