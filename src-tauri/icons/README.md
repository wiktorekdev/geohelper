# Icons

Drop the following files here before running `npm run build`:

- `32x32.png`
- `128x128.png`
- `128x128@2x.png`
- `icon.icns`
- `icon.ico`

Easiest way is to start from one high-res PNG and run:

```
npx @tauri-apps/cli icon path/to/app-icon.png
```

That command regenerates all sizes in this folder automatically.

During `npm run dev` the default Tauri icons are used, so you don't need to
worry about this while developing.
