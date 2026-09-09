/**
 * Example 02 — Cite check one or many citations
 * Language: TypeScript (Node.js)
 * Docs: https://lawdiver.com/docs/api
 */
import { LawDiverClient } from "../src/client.js";

const client = new LawDiverClient();

const payload = await client.citeCheck({
  citations: ["570 U.S. 744", "999 F.3d 1"],
});

console.log(`requestId: ${payload.requestId}`);
console.log(`units: ${payload.usage.quantity}`);
console.log("");

for (const item of payload.results) {
  console.log(`${item.citationAsWritten} → ${item.verdict}`);
  if (item.correctedCitation) console.log(`  Bluebook: ${item.correctedCitation}`);
  if (item.explanation) console.log(`  ${item.explanation}`);
  if (item.corpusCaveat) console.log(`  caveat: ${item.corpusCaveat}`);

  if (item.verdict === "likely_valid" || item.verdict === "name_mismatch") {
    for (const c of item.candidates ?? []) {
      console.log(
        `  candidate: ${(c as { bluebookCitation?: string }).bluebookCitation ?? JSON.stringify(c)}`,
      );
    }
  }
  console.log("");
}
