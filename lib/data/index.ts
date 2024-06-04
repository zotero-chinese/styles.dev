import { dirname, join } from "node:path";
import fs from "fs-extra";

// CSL-JSON Items
import apsItems from "./items/acta-psychologica-sinica-data.json";
import apaItems from "./items/apa-data.json";
import gbItems from "./items/gbt7714-data.json";
import mlcItems from "./items/manual-of-legal-citation-data.json";
import sscItems from "./items/social-sciences-in-china-data.json";

// CSL-JSON Citations
import defaultCite from "./default-cite.json";

export const allDefaultItems: Item[] = [
  ...apsItems,
  ...apaItems,
  ...gbItems,
  ...mlcItems,
  ...sscItems,
];

export function getCustomItems(cslPath: string): Item[] {
  const dirName = dirname(cslPath);
  const dataFilePath = join(dirName, "items.json");
  if (fs.existsSync(dataFilePath)) {
    return fs.readJsonSync(dataFilePath);
  } else {
    return [];
  }
}

export const allDefaultCitationItems = {
  //
};

const collator = Intl.Collator("en", { numeric: true });

function getCitationItems(items: Item[], citation_format: string) {
  let ids = getIds(items);

  if (citation_format === "numeric") {
    return [
      ...ids.map((id) => {
        return { id };
      }),
    ];
  }

  return ids.map((id) => {
    return { id };
  });
}

function getIds(items: Item[]): string[] {
  return items.map((item) => item.id).sort(collator.compare);
}
