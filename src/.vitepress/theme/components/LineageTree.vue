<template>
  <div class="lineage">
    <div class="ln-row ln-gen1">
      <div class="ln-node founder">国王 Runeard<div class="ln-sub">建坝者 · Arendelle</div></div>
      <div class="ln-node north">Northuldra 母亲<div class="ln-sub">北地后裔</div></div>
    </div>
    <div class="ln-connectors">
      <span class="ln-line ln-line-a"></span>
      <span class="ln-line ln-line-b"></span>
    </div>
    <div class="ln-row ln-gen2">
      <div class="ln-node father">阿格纳 Agnarr<div class="ln-sub">阿伦黛尔王子</div></div>
      <div class="ln-node mother">伊杜娜 Iduna<div class="ln-sub">北地后裔 · 救赎者</div></div>
      <div class="ln-marry">相恋 · 拯救</div>
    </div>
    <div class="ln-down"></div>
    <div class="ln-row ln-gen3">
      <div class="ln-node elsa">艾莎 Elsa<div class="ln-sub">第五灵 · 女王</div></div>
      <div class="ln-node anna">安娜 Anna<div class="ln-sub">阿伦黛尔女王</div></div>
    </div>
    <div class="ln-elsa-link"></div>
    <div class="ln-row ln-gen4">
      <div class="ln-node spirit">风 / 火 / 水 / 土 四灵<div class="ln-sub">自然之灵</div></div>
    </div>
    <p class="ln-note">血脉交汇：父系源自建坝的国王 Runeard，母系 Iduna 为北地（Northuldra）后裔。正是「人类与自然的联姻」使艾莎成为沟通二者的「第五灵」。</p>
  </div>
</template>

<script>
export default { name: 'LineageTree' }
</script>

<style scoped>
.lineage { margin: 22px 0; padding: 20px; border: 1px solid rgba(26, 42, 74, 0.12); border-radius: 16px; background: rgba(255, 255, 255, 0.72); text-align: center; }
.ln-row { display: flex; justify-content: center; gap: 40px; flex-wrap: wrap; position: relative; }
.ln-node { min-width: 150px; padding: 10px 14px; border-radius: 12px; border: 1px solid rgba(26, 42, 74, 0.18); background: #fff; font-weight: 600; color: var(--deep-ice, #1a2a4a); line-height: 1.3; }
.ln-sub { font-weight: 400; font-size: 12px; color: #8a93a6; margin-top: 3px; }
.ln-node.founder { border-color: var(--aurora-purple, #9b6dff); }
.ln-node.north { border-color: var(--aurora-green, #36c98a); }
.ln-node.father { border-color: var(--aurora-blue, #4aa8ff); }
.ln-node.mother { border-color: var(--aurora-green, #36c98a); }
.ln-node.elsa { background: linear-gradient(135deg, rgba(74,168,255,0.12), rgba(155,109,255,0.12)); border-color: var(--aurora-purple, #9b6dff); }
.ln-node.anna { border-color: var(--aurora-blue, #4aa8ff); }
.ln-node.spirit { border-color: var(--aurora-green, #36c98a); background: rgba(54,201,138,0.08); }
.ln-marry { align-self: center; font-size: 12px; color: #b06bd6; }
.ln-connectors { height: 22px; position: relative; }
.ln-line { position: absolute; top: 0; width: 1px; height: 22px; background: rgba(26,42,74,0.3); }
.ln-line-a { left: 28%; }
.ln-line-b { right: 28%; }
.ln-down { height: 22px; width: 1px; background: rgba(26,42,74,0.3); margin: 0 auto; }
.ln-elsa-link { height: 22px; width: 1px; background: rgba(26,42,74,0.3); margin: 0 auto; }
.ln-note { margin: 14px 0 0; font-size: 13px; color: #6a7286; line-height: 1.6; max-width: 640px; margin-left: auto; margin-right: auto; }
</style>
