import { parse, ParsedNode } from "jest-editor-support";
import { CodeLens, CodeLensProvider, Range, TextDocument } from "vscode";
import { CodeLensOption, escapeRegExp, findFullTestName } from "./utils";

function getCodeLensForOption(
  range: Range,
  codeLensOption: CodeLensOption,
  fullTestName: string
): CodeLens {
  const titleMap: Record<CodeLensOption, string> = {
    run: "RunCypress",
  };
  const commandMap: Record<CodeLensOption, string> = {
    run: "cypress-runner.runCypressSingleTest",
  };
  return new CodeLens(range, {
    arguments: [fullTestName],
    title: titleMap[codeLensOption],
    command: commandMap[codeLensOption],
  });
}

function getTestsBlocks(
  parsedNode: ParsedNode,
  parseResults: ParsedNode[],
  codeLensOptions: CodeLensOption[]
): CodeLens[] {
  const codeLens: CodeLens[] = [];
  console.log("Identifying blocks");

  parsedNode.children?.forEach((subNode) => {
    codeLens.push(...getTestsBlocks(subNode, parseResults, codeLensOptions));
  });

  const range = new Range(
    parsedNode.start.line - 1,
    parsedNode.start.column,
    parsedNode.end.line - 1,
    parsedNode.end.column
  );

  if (parsedNode.type === "expect") {
    return [];
  }

  const fullTestNameV1 = findFullTestName(parsedNode.start.line, parseResults);
  if (!fullTestNameV1) {
    console.log("Test name is undefined");
    return [];
  }

  const fullTestName = escapeRegExp(fullTestNameV1);

  codeLens.push(
    ...codeLensOptions.map((option) =>
      getCodeLensForOption(range, option, fullTestName)
    )
  );

  return codeLens;
}

export class CypressRunnerCodeLensProvider implements CodeLensProvider {
  // Define options that user want to use on Code Lens provider
  constructor(private readonly codeLensOptions: CodeLensOption[]) {}

  public async provideCodeLenses(document: TextDocument): Promise<CodeLens[]> {
    try {
      const text = document.getText();
      const parseResults = parse(document.fileName, text).root.children;
      const codeLens: CodeLens[] = [];
      parseResults?.forEach((parseResult) => {
        console.log(parseResults);
        codeLens.push(
          ...getTestsBlocks(parseResult, parseResults, this.codeLensOptions)
        );
      });
      console.log("Code Lens provider");
      console.log(parseResults);
      return codeLens;
    } catch (e) {
      // Ignore error and keep showing Run/Debug buttons at same position
      console.error("jest-editor-support parser returned error", e);
      return [];
    }
  }
}
