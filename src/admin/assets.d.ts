// Vite resolves image imports to their public URL; tell TypeScript about it.
declare module '*.jpg' {
  const src: string;
  export default src;
}
