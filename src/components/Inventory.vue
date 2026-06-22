<template>
  <div class="inventory-panel">
    <div class="inv-header">
      <span class="gold-display">💰 {{ characterStore.gold }}</span>
    </div>
    <div class="inv-grid">
      <div v-for="item in characterStore.inventory" :key="item.uid"
        class="inv-item" :class="[item.type]"
        @click="onItemClick(item)"
        :title="item.description">
        <div class="item-icon">{{ item.icon }}</div>
        <div class="item-name">{{ item.name }}</div>
        <div class="item-qty" v-if="item.quantity > 1">x{{ item.quantity }}</div>
      </div>
      <div v-if="characterStore.inventory.length === 0" class="inv-empty">背包空空如也</div>
    </div>
  </div>
</template>

<script setup>
import { useCharacterStore } from '../stores/character'

const characterStore = useCharacterStore()

function onItemClick(item) {
  if (item.type === 'consumable') {
    characterStore.useItem(item.uid)
  } else if (item.type === 'equipment') {
    characterStore.equipItem(item.uid)
  }
}
</script>

<style scoped>
.inv-header {
  margin-bottom: 8px;
}
.gold-display {
  color: #d4a017;
  font-size: 14px;
  font-weight: 600;
}
.inv-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  max-height: 200px;
  overflow-y: auto;
}
.inv-item {
  background: #1a1510;
  border: 1px solid #3a3530;
  border-radius: 6px;
  padding: 6px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}
.inv-item:hover { border-color: #b8860b; background: #2a2520; }
.inv-item.consumable { border-color: #27ae60; }
.inv-item.equipment { border-color: #2980b9; }
.inv-item.material { border-color: #8a7a6a; }
.item-icon { font-size: 20px; }
.item-name { font-size: 10px; color: #b8a080; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.item-qty {
  position: absolute;
  top: 2px;
  right: 4px;
  font-size: 10px;
  color: #d4a017;
  font-weight: 600;
}
.inv-empty {
  grid-column: 3;
  text-align: center;
  color: #5a4a3a;
  font-size: 12px;
  padding: 20px;
}
</style>
