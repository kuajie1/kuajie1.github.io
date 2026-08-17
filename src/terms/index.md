---
title: 术语索引
---

# ❄ 术语索引

收录《冰雪奇缘》核心设定词条，支持**实时搜索**——在下方输入框键入关键词（中/英皆可），卡片会自动过滤。点击卡片可跳转到对应卷的详细页面。

<script setup>
import { ref } from 'vue'
import terms from './terms-data.js'
const q = ref('')
</script>

<TermCard :terms="terms" :filter="q" />
<input v-model="q" class="term-search" placeholder="🔍 搜索角色 / 地点 / 魔法 / 歌曲 / 事件…" />
