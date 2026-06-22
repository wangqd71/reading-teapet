<template>
  <div class="file-loader" @click="triggerInput" @drop.prevent="onDrop" @dragover.prevent>
    <input ref="fileInput" type="file" accept=".txt,.text,.log,.md,.csv" @change="onFileChange" hidden />
    <div class="loader-content">
      <div class="loader-icon">📖</div>
      <div class="loader-text">
        <p class="loader-title">打开TXT文件开始冒险</p>
        <p class="loader-hint">点击选择文件 或 拖拽文件到此处</p>
        <p class="loader-formats">支持 .txt .text .log .md .csv 格式</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useReaderStore } from '../stores/reader'

const reader = useReaderStore()
const fileInput = ref(null)

function triggerInput() {
  fileInput.value.click()
}

function onFileChange(e) {
  const file = e.target.files[0]
  if (file) reader.loadFile(file)
}

function onDrop(e) {
  const file = e.dataTransfer.files[0]
  if (file) reader.loadFile(file)
}
</script>

<style scoped>
.file-loader {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  border: 2px dashed #5a4a3a;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s;
  background: rgba(90, 74, 58, 0.05);
}
.file-loader:hover {
  border-color: #8b6914;
  background: rgba(139, 105, 20, 0.08);
  transform: scale(1.01);
}
.loader-content {
  text-align: center;
  padding: 40px;
}
.loader-icon {
  font-size: 64px;
  margin-bottom: 16px;
  animation: float 3s ease-in-out infinite;
}
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
.loader-title {
  font-size: 20px;
  font-weight: 600;
  color: #3a2e1f;
  margin: 0 0 8px;
}
.loader-hint {
  font-size: 14px;
  color: #6b5b4a;
  margin: 0 0 4px;
}
.loader-formats {
  font-size: 12px;
  color: #9a8a7a;
  margin: 0;
}
</style>
