import { defineUserConfig } from "@vuepress/cli";
import { searchPlugin } from "@vuepress/plugin-search";
import theme from "./theme";

export default defineUserConfig({
  title: "Zotero Chinese Styles",
  dest: "dist",
  lang: "zh-CN",
  base: '/styles/',
  theme,
  shouldPrefetch: false,
  plugins: [
    searchPlugin({
      maxSuggestions: 10
    }),
  ],
});
