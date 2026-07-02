// `stylis` and `stylis-plugin-rtl` ship no bundled TypeScript declarations, so
// their imports resolve to an implicit `any` (TS7016). These ambient shims give
// the emotion RTL cache setup in index.tsx the minimal types it needs. They are
// typed as `any` to stay compatible with emotion's `StylisPlugin` middleware type.
declare module 'stylis-plugin-rtl' {
  const rtlPlugin: any;
  export default rtlPlugin;
}
