import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { birStorageDigest, decodeBir, encodeCausalProgramBir, reencodeBir } from "../../src/bubbles/bir";
import { isBirDocument, readCausalProgram } from "./causal-cli";

async function main(): Promise<void> {
    const [inputPath, outputPath] = process.argv.slice(2);
    if (!inputPath || !outputPath) {
        throw new Error("Usage: tsx apps/hatchery/encode-bir.ts <program.json|causal.bubble|program.bir> <output.bir>");
    }
    const input = new Uint8Array(await readFile(inputPath));
    // An existing BIR document is re-encoded canonically with every section preserved, never reduced to its program.
    const encoded = isBirDocument(input)
        ? (() => {
            const document = decodeBir(input);
            const bytes = reencodeBir(document);
            return { bytes, semanticDigest: document.semanticDigest, storageDigest: birStorageDigest(bytes) };
        })()
        : encodeCausalProgramBir(await readCausalProgram(inputPath));
    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(outputPath, encoded.bytes);
    process.stdout.write(
        `Encoded ${inputPath} -> ${outputPath} (${encoded.bytes.length} bytes)\n`
        + `  semantic ${encoded.semanticDigest}\n  storage  ${encoded.storageDigest}\n`,
    );
}

main().catch((error: unknown) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
});
