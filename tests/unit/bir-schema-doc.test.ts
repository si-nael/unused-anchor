import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import { BIR_SCHEMA_APPENDIX_PATH, renderBirSchemaAppendix } from "../../apps/hatchery/print-bir-schemas";
import { causalOptionsSchema } from "../../src/bubbles/bir/causal-outcome";
import { CONFORMANCE_OUTCOME_SECTION } from "../../src/bubbles/bir/conformance";
import type { BirSchema } from "../../src/bubbles/bir/schema";

const repo = resolve(__dirname, "..", "..");

function readRepositoryText(path: string): string {
    // A Windows checkout may convert line endings; the appendix content is compared, not its line terminators.
    return readFileSync(resolve(repo, path), "utf8").replace(/\r\n/g, "\n");
}

function tableRow(appendix: string, path: string): string {
    const row = appendix.split("\n").find((line) => line.startsWith(`| \`${path}\` |`));
    assert.ok(row, `appendix has no row for ${path}`);
    return row;
}

test("the committed BIR schema appendix equals the generator output", () => {
    assert.equal(
        readRepositoryText(BIR_SCHEMA_APPENDIX_PATH),
        renderBirSchemaAppendix(),
        `${BIR_SCHEMA_APPENDIX_PATH} is stale; regenerate it with npx tsx apps/hatchery/print-bir-schemas.ts`,
    );
});

test("the appendix states sequence positions and the empty-collection rule from the schemas", () => {
    const appendix = renderBirSchemaAppendix();
    assert.equal(appendix, renderBirSchemaAppendix());
    assert.match(tableRow(appendix, "$.autonomousContinuations[].branchLineage"), /\| optional, omitted if empty \| seq /);
    assert.match(tableRow(appendix, "$.autonomousContinuations[].order.evaluationFrontiers"), /\| required, even if empty \| seq /);
    assert.match(tableRow(appendix, "$.autonomousContinuations[].order.evaluationFrontiers[]"), /\| item \| set \|/);
    assert.match(tableRow(appendix, "$.diagnosticCodes"), /\| required, even if empty \| set \|/);
    assert.match(tableRow(appendix, "$.candidateAssessments"), /\| required, even if empty \| set \|/);
    assert.match(tableRow(appendix, "$.autonomousContinuations[].ledger[].key"), /\| required \| text \|/);
    assert.match(tableRow(appendix, "$.world.anchorTransfers"), /\| optional, kept if empty \| set \|/);
    assert.match(tableRow(appendix, "$.world.formal.families[].domain.axes"), /\| seq /);
    assert.match(tableRow(appendix, "$.worldWillEnabled"), /\| optional \| bool \| `01` \/ `02` \|/);
    assert.match(tableRow(appendix, "$.birBytesRead"), /\| required \| safe-integer \|/);
    assert.match(tableRow(appendix, "$.continuations[]"), /same schema as `\$\.autonomousContinuations\[\]`/);
    assert.match(tableRow(appendix, "$.world.formal.families[].body<unary>.operand"), /recursive: same schema as `\$\.world\.formal\.families\[\]\.body`/);
});

function sectionRows(appendix: string, section: string): string[] {
    const lines = appendix.split("\n");
    const start = lines.indexOf(`## ${section}`);
    assert.ok(start >= 0, `appendix has no section ${section}`);
    const end = lines.findIndex((line, index) => index > start && line.startsWith("## "));
    return lines.slice(start, end < 0 ? undefined : end).filter((line) => line.startsWith("| `$"));
}

test("the prose claims of the references agree with the schemas", () => {
    const appendix = renderBirSchemaAppendix();
    const conformance = readRepositoryText("docs/reference/causal-conformance.md");
    // causal-conformance.md section 3: exactly two outcome positions are sequences.
    const sequencePaths = sectionRows(appendix, CONFORMANCE_OUTCOME_SECTION)
        .filter((row) => row.includes("| seq "))
        .map((row) => row.split("`")[1]);
    assert.deepEqual(sequencePaths, [
        "$.autonomousContinuations[].branchLineage",
        "$.autonomousContinuations[].order.evaluationFrontiers",
    ]);
    // causal-conformance.md section 1 names every execution option.
    const options = causalOptionsSchema as Extract<BirSchema, { kind: "record" }>;
    for (const field of Object.keys(options.fields)) {
        assert.ok(conformance.includes(`- \`${field}\``) || conformance.includes(`\`${field}\`, `) || conformance.includes(`\`${field}\`:`),
            `causal-conformance.md section 1 does not describe execution option ${field}`);
    }
});

test("both normative references link the generated appendix", () => {
    for (const reference of ["docs/reference/bubble-ir.md", "docs/reference/causal-conformance.md"]) {
        assert.ok(readRepositoryText(reference).includes("(bir-schemas.md"), `${reference} does not link bir-schemas.md`);
    }
});
