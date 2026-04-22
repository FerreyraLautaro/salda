import { ref, watch } from 'vue'

const stored = localStorage.getItem('theme')
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
const isDark = ref(stored ? stored === 'dark' : prefersDark)

function apply() {
  document.documentElement.classList.toggle('dark', isDark.value)
}
apply()

watch(isDark, (v) => {
  localStorage.setItem('theme', v ? 'dark' : 'light')
  apply()
})

export function useDarkMode() {
  function toggle() { isDark.value = !isDark.value }
  return { isDark, toggle }
}
