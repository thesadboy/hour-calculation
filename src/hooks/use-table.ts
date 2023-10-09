import {Ref, ref, watch} from "vue";
import {bitable, IFieldMeta, ITable, ITableMeta} from "@lark-base-open/js-sdk";
import dayjs from "dayjs";

export const useTableMetaData = () => {
  const tables = ref<ITableMeta[]>([])
  const selected = ref('')
  Promise.all([bitable.base.getSelection(), bitable.base.getTableMetaList()]).then(([selection, meta]) => {
    selected.value = selection.tableId as any
    tables.value = meta
  })
  return {tables, selected}
}

export const useTableMonth = () => {
  const options: { value: any, label: string }[] = []
  for (let i = 0; i < 12; i++) {
    options.push({
      label: (i + 1).toString().padStart(2, '0') + ' 月',
      value: dayjs().set('month', i).format('YYYYMM')
    })
  }
  return {options, current: dayjs().format('YYYYMM')}
}

export const useTableColumns = (tableId: Ref<string>) => {
  const columns = ref<IFieldMeta[]>([])
  const maybeStartColumn = ref<IFieldMeta>()
  const maybeEndColumn = ref<IFieldMeta>()
  watch(tableId, async (value) => {
    if (!value) return
    columns.value = []
    maybeEndColumn.value = undefined
    maybeStartColumn.value = undefined
    const table: ITable = await bitable.base.getTableById(value)
    const [{id: viewId}] = await table.getViewList()
    const view = await table.getViewById(viewId)
    const data = await view.getFieldMetaList()
    maybeStartColumn.value = data.find(item => item.name.startsWith('开始'))
    maybeEndColumn.value = data.find(item => item.name.startsWith('实际'))
    columns.value = data
  }, {immediate: true})
  return {columns, maybeEndColumn, maybeStartColumn}
}
