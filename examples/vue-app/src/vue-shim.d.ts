declare module "*.vue" {
  import { DefineComponent } from "vue";
  /**
   * TypeScript cannot handle type information for `.vue` imports, they are shimmed to be a generic Vue component type by default.
   * In VSCode, Volar is configured to get actual prop types in `.vue` imports and provides Intellisense.
   */
  const Component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>;
  export default Component;
}

declare module "*.svg" {
  const url: string;
  export default url;
}

declare module "*.png" {
  const content: string;
  export default content;
}
