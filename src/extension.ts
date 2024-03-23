// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { info } from 'console';
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

class Info{
    public file:string;
    public line:number;
    

    constructor(file:string,line:number){
        this.file = file;
        this.line = line;
    }

	/**
	 * equals
	 */
	public equals(object:Info):boolean {
		return object.file === this.file && object.line === this.line;
	}
} 

class Manager{
    private backwards:Info[];
	private forwards:Info[];

    constructor() {
        this.backwards = [];
		this.forwards = [];
    }

	/**
	 * Save
	 */
	public saveCurrent() {
		const info = this.getInfo();
		if (info === null){
			return;
		}
		const last:Info | undefined = this.backwards.pop();
		if (last !== undefined){
			this.backwards.push(last);
			if (info.equals(last)){
				return;
			}

		}
		vscode.window.showInformationMessage(`Stored File: ${info.file}, Line: ${info.line}`);
		this.backwards.push(info);
	}

	public goTo(info:Info){
		vscode.workspace.openTextDocument(info.file).then(doc => {
			vscode.window.showTextDocument(doc, { selection: new vscode.Range(info.line, 0, info.line, 0) });
		});
	}

	private getInfo():Info | null {
		const editor = vscode.window.activeTextEditor;
        if (editor) {
            const fileName = editor.document.fileName;
            const lineNumber = editor.selection.active.line; 
			return new Info(fileName,lineNumber);
        }
		return null;
	}

	public back(){
		const last:Info | undefined = this.backwards.pop();
		if (last === undefined){
			vscode.window.showInformationMessage(`Backward Stack is Empty`);
			return;
		}
		const current:Info | null= this.getInfo();
		if (current !== null ){
			this.forwards.push(current);
		}
		this.goTo(last);
	}

	public backWithoutClear(){
		const last:Info | undefined = this.backwards.pop();
		if (last === undefined){
			vscode.window.showInformationMessage(`Backward Stack is Empty`);
			return;
		}
		this.backwards.push(last);
		const current:Info | null= this.getInfo();
		if (current !== null ){
			this.forwards.push(current);
		}
		this.goTo(last);
	}

	public forward(){
		const last:Info | undefined = this.forwards.pop();
		if (last === undefined){
			vscode.window.showInformationMessage(`Forward Stack is Empty`);
			return;
		}

		this.goTo(last);
	}

	public removeLast(){
		const last:Info | undefined = this.backwards.pop();
		if (last === undefined){
			vscode.window.showInformationMessage(`Backward Stack is Empty`);
			return;
		}
		vscode.window.showInformationMessage(`Removed File ${last.file}, Line ${last.line}`);
	}

	public clearAll(){
		this.forwards = [];
		this.backwards = [];
		vscode.window.showInformationMessage(`Cleared!`);
	}
}

export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	//console.log('Congratulations, your extension "waypointer" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json

	const manager:Manager = new Manager();

	let Store = vscode.commands.registerCommand('waypointer.Save', () => {
		manager.saveCurrent();
	});

	let Back = vscode.commands.registerCommand('waypointer.Back', () => {
		manager.back();
	});

	let Back1 = vscode.commands.registerCommand('waypointer.BackWithoutClear', () => {
		manager.backWithoutClear();
	});

	let Forwards = vscode.commands.registerCommand('waypointer.Forward', () => {
		manager.forward();
	});

	let Clear = vscode.commands.registerCommand('waypointer.Clear', () => {
		manager.clearAll();
	});


	context.subscriptions.push(Store);
	context.subscriptions.push(Back);
	context.subscriptions.push(Back1);
	context.subscriptions.push(Forwards);
	context.subscriptions.push(Clear);
}

// This method is called when your extension is deactivated
export function deactivate() {}
