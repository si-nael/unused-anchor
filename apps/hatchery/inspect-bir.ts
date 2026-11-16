import { readFile } from "node:fs/promises";
import { decodeBir, liftCausalProgramFromBir } from "../../src/bubbles/bir";
import { emitCausalJson } from "./causal-cli";

async function main(): Promise<void> {
    const [inputPath, outputPath] = process.argv.slice(2);
    if (!inputPath) throw new Error("Usage: tsx apps/hatchery/inspect-bir.ts <program.bir> [output.json]");
    const bytes = new Uint8Array(await readFile(inputPath));
    const document = decodeBir(bytes);
    const lifted = liftCausalProgramFromBir(document);
    const program = lifted.program;
    await emitCausalJson({
        mode: "bubble-bir-inspection.v1",
        source: inputPath.replaceAll("\\", "/"),
        byteLength: bytes.length,
        formatVersion: document.envelope.formatVersion,
        identity: {
            semanticDigest: document.semanticDigest,
            storageDigest: document.storageDigest,
            backendProgramDigest: lifted.backendProgramDigest ?? null,
        },
        sections: document.envelope.sections.map((section) => ({
            name: section.name,
            critical: section.critical,
            byteLength: section.payload.length,
        })),
        executable: document.executable,
        unknownCriticalSections: document.unknownCriticalSections,
        preservedExtensionSections: document.preservedExtensionSections,
        lift: { status: lifted.status, diagnostics: lifted.diagnostics },
        ...(program ? {
            program: {
                worldCount: program.world.worlds.length,
                fieldCount: program.world.worlds.reduce((total, world) => total + world.fields.length, 0),
                familyCount: program.world.formal.families.length,
                anchorCount: program.world.anchors.length,
                anchorTransferCount: program.world.anchorTransfers?.length ?? 0,
                internalLawCount: program.world.internalLaws.length,
                emergenceCriterionCount: program.world.emergenceCriteria.length,
                interventionCount: program.world.worldWill.interventions.length,
                universalClock: program.world.order.universalClock,
            },
        } : {}),
    }, outputPath ?? null);
    if (outputPath) process.stdout.write(`Inspected BIR ${inputPath} -> ${outputPath}\n`);
}

main().catch((error: unknown) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
});
