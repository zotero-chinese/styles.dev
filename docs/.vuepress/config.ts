import { defineUserConfig } from "@vuepress/cli";
import docsearchPlugin from "@vuepress/plugin-docsearch";
import theme from "./theme";

export default defineUserConfig({
  dest: "dist",
  lang: "zh-CN",
  theme,
  shouldPrefetch: false,
});
