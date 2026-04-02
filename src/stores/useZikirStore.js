import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import dayjs from 'dayjs'

const COUNTER_KEY = 'musafir:zikir'
const LOG_KEY = 'musafir:zikir-log'

export const useZikirStore = defineStore('zikir', () => {
  const counters = ref({})      // { [entryId]: currentCount }
  const completed = ref({})     // { [categoryId]: boolean }
  const lastDate = ref('')

  function load() {
    const today = dayjs().format('YYYY-MM-DD')
    try {
      const savedCounters = localStorage.getItem(COUNTER_KEY)
      const savedLog = localStorage.getItem(LOG_KEY)
      if (savedCounters) counters.value = JSON.parse(savedCounters)
      if (savedLog) {
        const log = JSON.parse(savedLog)
        lastDate.value = log.date || ''
        completed.value = log.completed || {}
      }
    } catch (_) {}

    // Daily reset — reset completion flags at midnight, keep counter values
    if (lastDate.value !== today) {
      completed.value = {}
      lastDate.value = today
      persist()
    }
  }

  function increment(entryId) {
    counters.value[entryId] = (counters.value[entryId] || 0) + 1
    persist()
  }

  function reset(entryId) {
    counters.value[entryId] = 0
    persist()
  }

  function markCategoryComplete(categoryId) {
    completed.value[categoryId] = true
    persist()
  }

  function getCount(entryId) {
    return counters.value[entryId] || 0
  }

  function isCategoryComplete(categoryId) {
    return !!completed.value[categoryId]
  }

  // Dua of the Day — same dua all day, rotates daily
  function getDuaOfDay(duas) {
    if (!duas || duas.length === 0) return null
    const index = dayjs().dayOfYear() % duas.length
    return duas[index]
  }

  function persist() {
    try {
      localStorage.setItem(COUNTER_KEY, JSON.stringify(counters.value))
      localStorage.setItem(LOG_KEY, JSON.stringify({
        date: lastDate.value,
        completed: completed.value,
      }))
    } catch (_) {}
  }

  load()

  return { counters, completed, increment, reset, markCategoryComplete, getCount, isCategoryComplete, getDuaOfDay }
})
