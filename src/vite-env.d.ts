/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MOCK_COURSE_LEARNING?: string
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<object, object, object>
  export default component
}
