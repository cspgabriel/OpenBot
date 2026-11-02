import { readdirSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { transformSync } from "@babel/core";
import localization from "../app/plugins/localization.mjs";

const root = path.resolve(import.meta.dirname, "..");
const messages = new Map();
function walk(directory) {
  for (const item of readdirSync(directory, { withFileTypes: true })) {
    const filename = path.join(directory, item.name);
    if (item.isDirectory()) walk(filename);
    else if (
      /\.[tj]sx?$/.test(item.name) &&
      !item.name.startsWith("i18n") &&
      !/\.test\.|\.gen\./.test(item.name) &&
      !filename.includes(`${path.sep}generated${path.sep}`)
    ) {
      transformSync(readFileSync(filename, "utf8"), {
        filename,
        configFile: false,
        babelrc: false,
        parserOpts: { plugins: ["typescript", "jsx"] },
        plugins: [[localization, { extract: messages }]],
      });
    }
  }
}
walk(path.join(root, "app/src"));
mkdirSync(path.join(root, "app/src/locales"), { recursive: true });
writeFileSync(
  path.join(root, "app/src/locales/en-US.json"),
  JSON.stringify(
    Object.fromEntries([...messages.keys()].sort().map((key) => [key, key])),
    null,
    2,
  ) + "\n",
);
console.log(JSON.stringify({ messages: messages.size }));
