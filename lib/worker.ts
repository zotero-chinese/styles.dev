import { generateAndWrite } from './generate.js';

export default async function ({ filePath }: { filePath: string }) {
  return generateAndWrite(filePath);
}
