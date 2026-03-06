declare module 'jsvectormap' {
  interface JsVectorMapInstance {
    destroy?: () => void;
  }

  interface JsVectorMapConstructor {
    new (opts: Record<string, unknown>): JsVectorMapInstance;
  }

  const jsVectorMap: JsVectorMapConstructor;
  export default jsVectorMap;
}
