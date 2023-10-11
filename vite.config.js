import { defineConfig } from "vite";
export default defineConfig({
    test: {
        environment: 'happy-dom'
    },
    esbuild: {
        // vite's esbuild option extends esbuild's own transform options, here we can set jsxFactory to customize our jsx transformation
        jsxFactory: 'MiniReact.createElement',
    }
});