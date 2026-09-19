/// <reference types="vite/client" />

// CSS Modules: each stylesheet exports a class-name map.
declare module '*.module.css' {
  const classes: Record<string, string>;
  export default classes;
}
