Building for STAGING

> site@1.0.0 build:staging
> vite build --mode staging

NODE_ENV=staging is not supported in the .env file. Only NODE_ENV=development is supported to create a development build of your project. If you need to set process.env.NODE_ENV, you can set it in the Vite config instead.
vite v4.5.14 building for staging...
transforming...
✓ 143 modules transformed.
✓ built in 1.79s
Could not resolve "../data/json/designSystem.json" from "src/utils/dataLoader.ts"
file: /home/runner/work/GamingDronzz.com/GamingDronzz.com/site/src/utils/dataLoader.ts
error during build:
RollupError: Could not resolve "../data/json/designSystem.json" from "src/utils/dataLoader.ts"
    at error (file:///home/runner/work/GamingDronzz.com/GamingDronzz.com/site/node_modules/rollup/dist/es/shared/node-entry.js:2287:30)
    at ModuleLoader.handleInvalidResolvedId (file:///home/runner/work/GamingDronzz.com/GamingDronzz.com/site/node_modules/rollup/dist/es/shared/node-entry.js:24860:24)
    at file:///home/runner/work/GamingDronzz.com/GamingDronzz.com/site/node_modules/rollup/dist/es/shared/node-entry.js:24822:26
Error: Process completed with exit code 1.