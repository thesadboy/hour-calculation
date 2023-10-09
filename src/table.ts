import {bitable, FieldId, FieldType, IRecord, ITable, NumberFormatter} from "@lark-base-open/js-sdk";
import * as dayjs from "dayjs";
import duration from 'dayjs/plugin/duration'
import {holidays} from "./hooks/use-holidays.ts";
import {Dayjs} from "dayjs";
import {ElMessage} from "element-plus";

dayjs.extend(duration)

export interface CFormData {
  month: string,
  table: string,
  start: string,
  end: string
}

export interface Holiday {
  date: string,
  workday: boolean
}

const getMonthField = async (monthStr: string, table: ITable): Promise<FieldId> => {
  const month = monthStr.replace(/^\d{4}/, '').trim()
  const fieldName = `${month}月实际时长（工作日）`
  try {
    return (await table.getFieldByName(fieldName)).id
  } catch (e) {
    return await table.addField({name: fieldName, type: FieldType.Number, property: {formatter: NumberFormatter.INTEGER}})
  }
}

const calcDuration = (start: Dayjs, end: Dayjs): number => {
  let duration = Math.ceil(dayjs.duration(end.diff(start)).asDays())
  // 去除节假日
  holidays.value.forEach(item => {
    if (item.isAfter(start) && item.isBefore(end) || item.isSame(start) || item.isSame(end)) {
      duration--
    }
  })
  return Math.max(duration, 0)
}

const calcDays = (start: any, end: any, current: any, status: any): any => {
  if (!start || (["已完成", "已发布", "测试中", "挂起"].includes(status) && !end)) return '0'
  const [mStart, mEnd] = current
  const dStart = dayjs(start)
  const dEnd = dayjs(end)
  if (end && dEnd.isBefore(mStart)) return '0'
  const realStart = dStart.isBefore(mStart) ? mStart : dStart
  let realEnd = (!end || dEnd.isAfter(mEnd)) ? mEnd : dEnd
  if (realEnd.isAfter(dayjs().endOf('day'))) {
    realEnd = dayjs().endOf('day')
  }
  return calcDuration(realStart.startOf("day"), realEnd.endOf("day")).toString()
}


export const generateData = async (formData: CFormData) => {
  const table: ITable = await bitable.base.getTableById(formData.table)
  const fieldId = await getMonthField(formData.month, table)
  const statusId = (await table.getFieldByName('状态')).id
  const current = [dayjs(formData.month).startOf('month'), dayjs(formData.month).endOf('month')]
  const {records} = await table.getRecords({pageSize: 5000})
  const data: IRecord[] = []
  records.forEach(({fields, recordId}) => {
    data.push({
      recordId,
      fields: {
        [fieldId]: calcDays(fields[formData.start], fields[formData.end], current, (fields[statusId] as any)?.text ?? '')
      }
    })
  })
  await table.setRecords(data)
  ElMessage.success('更新成功')
}
