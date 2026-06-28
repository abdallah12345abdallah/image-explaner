/* Lets TypeScript (vue-tsc) understand `*.vue` single-file component imports. */
declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, any>;
  export default component;
}
