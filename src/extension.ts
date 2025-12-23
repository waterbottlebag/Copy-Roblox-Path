import * as vscode from 'vscode';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "copyrobloxpath" is now active!');

	function formatRobloxName(name: string): string {
		if (name.includes(' ')) {
			return `["${name}"]`;
		}
		return name;
	}

	function convertToRobloxPath(filePath: string): string {
		let normalizedPath = filePath.replace(/\\/g, '/');
		
		if (normalizedPath.startsWith('src/')) {
			normalizedPath = normalizedPath.substring(4);
		}
		
		const dir = path.dirname(normalizedPath);
		const filename = path.basename(normalizedPath);
		
		let moduleName = filename;
		const lastDotIndex = moduleName.lastIndexOf('.');
		if (lastDotIndex !== -1) {
			const ext = moduleName.substring(lastDotIndex + 1).toLowerCase();
			if (ext === 'lua' || ext === 'luau') {
				moduleName = moduleName.substring(0, lastDotIndex);
				const secondLastDotIndex = moduleName.lastIndexOf('.');
				if (secondLastDotIndex !== -1) {
					const suffix = moduleName.substring(secondLastDotIndex + 1).toLowerCase();
					if (suffix === 'server' || suffix === 'client' || suffix === 'shared') {
						moduleName = moduleName.substring(0, secondLastDotIndex);
					}
				}
			}
		}
		
		const dirParts = dir.split('/').filter(part => part && part !== '.');
		
		let result = 'game';
		
		for (let i = 0; i < dirParts.length; i++) {
			const part = dirParts[i];
			const formatted = formatRobloxName(part);
			
			if (i === 0) {
				result += `:GetService("${part}")`;
			} else {
				if (formatted.startsWith('[')) {
					result += formatted;
				} else {
					result += `.${formatted}`;
				}
			}
		}
		
		if (moduleName.toLowerCase().startsWith('init')) {
			return result;
		}
		
		const formattedModuleName = formatRobloxName(moduleName);
		if (formattedModuleName.startsWith('[')) {
			result += formattedModuleName;
		} else {
			result += `.${formattedModuleName}`;
		}
		
		return result;
	}

	const disposable = vscode.commands.registerCommand('copyrobloxpath.copypath', (uri: vscode.Uri) => {
		try {
			const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
			if (!workspaceFolder) {
				vscode.window.showErrorMessage('File is not in a workspace folder');
				return;
			}
			
			const relativePath = path.relative(workspaceFolder.uri.fsPath, uri.fsPath);
			const normalizedRelativePath = relativePath.replace(/\\/g, '/');
			
			const robloxPath = convertToRobloxPath(normalizedRelativePath);
			
			vscode.env.clipboard.writeText(robloxPath);
			vscode.window.showInformationMessage(`Copied Roblox path: ${robloxPath}`);
		} catch (error) {
			vscode.window.showErrorMessage(`Error converting path: ${error}`);
		}
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}