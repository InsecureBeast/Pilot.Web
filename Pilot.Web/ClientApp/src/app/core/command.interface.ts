import { SafeUrl } from "@angular/platform-browser";

/**
 * The Command interface declares a method for executing a command.
 */
export interface ICommand {
  title: string;
  icon: SafeUrl;
  execute(): void;
  canExecute(): boolean;
  hint: string;
}

/**
 * Some commands can implement simple operations on their own.
 */
export class SimpleCommand implements ICommand {
    
  private readonly func: Function;
  private readonly can: () => boolean;

  constructor(func: Function, can: () => boolean) {
    this.can = can;
    this.func = func;
  }

  title: string;
  icon: string;
  hint: string;

  execute(): boolean {
    this.func();
    return false;
  }

  canExecute(): boolean {
    return this.can();
  }
}
