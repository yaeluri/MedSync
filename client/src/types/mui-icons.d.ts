// @mui/icons-material@9.1.0 ships incomplete type declarations: its package.json
// "types" entry points at a non-existent index.d.ts and most per-icon .d.mts
// files are missing, so every `@mui/icons-material/<Icon>` import resolves to an
// untyped .mjs (TS7016). This ambient shim types the deep-import path used across
// the app as a standard MUI SvgIcon component.
declare module '@mui/icons-material/*' {
  import type { ComponentType } from 'react';
  import type { SvgIconProps } from '@mui/material/SvgIcon';
  const Icon: ComponentType<SvgIconProps>;
  export default Icon;
}
