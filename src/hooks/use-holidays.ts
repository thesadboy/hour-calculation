import {ref} from "vue";
import {Dayjs} from "dayjs";
import * as dayjs from "dayjs";

const holidays = ref<Dayjs[]>([])
const useHolidays = (year: number) => {
  const queryYear = `${year - 1},${year}`
  fetch(`https://api.apihubs.cn/holiday/get?api_key=f98ead160263504a461b34a1f06a0544f748&year=${queryYear}&workday=2&size=300`).then(async (res) => {
    const {data: {list}} = await res.json()
    holidays.value = (list as Record<string, any>[]).map(({date}) => dayjs(date.toString()))
  })
}
export {useHolidays, holidays}
