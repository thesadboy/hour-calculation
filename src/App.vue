<script setup lang="ts">
import {useTableColumns, useTableMetaData, useTableMonth} from "./hooks/use-table.ts";
import {computed, ref, watch, unref} from "vue";
import {bitable} from "@lark-base-open/js-sdk";
import {CFormData, generateData} from "./table.ts";

const {tables, selected} = useTableMetaData()
const {options, current} = useTableMonth()
const formData = ref<CFormData>({
  month: current,
  table: '',
  start: '',
  end: ''
})
const currentTableId = computed(() => formData.value.table)
const canSubmit = computed(() => {
  let isCan = true
  Object.keys(formData.value).forEach((key) => {
    if (!formData.value[key as keyof CFormData]) {
      isCan = false
    }
  })
  return isCan
})
const {columns, maybeStartColumn, maybeEndColumn} = useTableColumns(currentTableId)
watch(selected, () => {
  formData.value.table = selected.value
}, {immediate: true})
watch(columns, () => {
  formData.value.start = maybeStartColumn.value?.id ?? ''
  formData.value.end = maybeEndColumn.value?.id ?? ''
})

bitable.base.onSelectionChange(({data}: Record<string, any>) => {
  formData.value.table = data.tableId
})

const generating = ref(false)

const handleGenerateData = async () => {
  generating.value = true
  await generateData(unref<CFormData>(formData))
  generating.value = false
}
</script>

<template>
  <div>
    <el-form label-position="top">
      <el-form-item label="选择月份">
        <el-select v-model="formData.month" placeholder="请选择月份">
          <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="选择数据表">
        <el-select v-model="formData.table" :loading="!options.length" placeholder="请选择数据表">
          <el-option :value="item.id" :label="item.name" v-for="item in tables" :key="item.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="选择需求开始时间字段">
        <el-select v-model="formData.start" :loading="!columns.length" placeholder="请选择">
          <el-option v-for="item in columns" :key="item.id" :value="item.id" :label="item.name"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="选择需求实际结束时间字段">
        <el-select v-model="formData.end" :loading="!columns.length" placeholder="请选择">
          <el-option v-for="item in columns" :key="item.id" :value="item.id" :label="item.name"></el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <el-button type="primary" @click="handleGenerateData" :disabled="!canSubmit" :loading="generating">更新工作时长数据</el-button>
  </div>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}

.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}

.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
