import type {
    BubbleGrammarArtifactIR,
    BubbleProfileExtensionGrammarIR,
} from "../ir";
import { throwDiagnostic } from "./diagnostics";

interface ParseBubbleGrammarArtifactOptions {
    lineNumber: number;
    sourcePath: string | null;
}

const PROFILE_EXTENSION_PATTERN = /^profile\s+([A-Za-z_][\w.-]*)\s+extends\s+([A-Za-z_][\w.-]*)$/;

export function parseBubbleGrammarArtifact(
    rawSource: string,
    options: ParseBubbleGrammarArtifactOptions,
): BubbleGrammarArtifactIR {
    const trimmed = rawSource.trim();
    const profileExtensionMatch = trimmed.match(PROFILE_EXTENSION_PATTERN);
    if (profileExtensionMatch) {
        return {
            kind: "profile-extension",
            profileName: profileExtensionMatch[1],
            extendsProfile: profileExtensionMatch[2],
        } satisfies BubbleProfileExtensionGrammarIR;
    }

    throwDiagnostic({
        code: "BBL009",
        severity: "error",
        message: `Could not parse grammar artifact on line ${options.lineNumber}. Expected 'profile <Name> extends <BaseProfile>'.`,
        sourcePath: options.sourcePath,
        line: options.lineNumber,
    });
}

export function formatBubbleGrammarArtifact(artifact: BubbleGrammarArtifactIR): string {
    return `profile ${artifact.profileName} extends ${artifact.extendsProfile}`;
}