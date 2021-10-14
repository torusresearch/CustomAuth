import typescript from "@rollup/plugin-typescript";
import path from "path";
import sourceMaps from "rollup-plugin-sourcemaps";

import pkg from "./package.json";

const pkgName = "directWebSdk";

export default [
  {
    input: path.resolve(".", "src", "index.ts"),
    external: [...Object.keys(pkg.dependencies)],
    output: [{ file: `dist/${pkgName}.esm.js`, format: "es", sourcemap: true }],
    plugins: [typescript({ tsconfig: path.resolve(".", "tsconfig.build.json"), moduleResolution: "node" }), sourceMaps()],
  },
];
