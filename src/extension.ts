import * as vscode from "vscode";
import { CypressRunnerCodeLensProvider } from "./CypressRunnerCodeLensProvider";

export function activate(context: vscode.ExtensionContext) {
  const codeLensProvider = new CypressRunnerCodeLensProvider(["run"]);
  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand(
    "cypress-runner.helloWorld",
    () => {
      // The code you place here will be executed every time your command is executed
      // Display a message box to the user
      console.log("Hello");
      vscode.window.showInformationMessage("Hello World from Cypress runner!");
    }
  );

  const runCypressSingleTest = vscode.commands.registerCommand(
    "cypress-runner.runCypressSingleTest",
    async (argument: Record<string, unknown> | string) => {
      if (typeof argument === "string") {
        console.log("Yes", argument);
        vscode.window.showInformationMessage("Code Lens works");
      } else {
        console.log("Yes", argument);
        vscode.window.showInformationMessage("Code Lens works");
        // jestRunner.runCurrentTest();
      }
    }
  );

  const docSelectors: vscode.DocumentFilter[] = [
    {
      pattern: vscode.workspace
        .getConfiguration()
        .get("jestrunner.codeLensSelector"),
    },
  ];
  const codeLensProviderDisposable = vscode.languages.registerCodeLensProvider(
    [{ pattern: "**/*.{test,spec}.{js,jsx,ts,tsx}" }],
    codeLensProvider
  );
  context.subscriptions.push(codeLensProviderDisposable);

  context.subscriptions.push(disposable);
  context.subscriptions.push(runCypressSingleTest);
}

// this method is called when your extension is deactivated
export function deactivate(): void {
  // Deactivate
}
