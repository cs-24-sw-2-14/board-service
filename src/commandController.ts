import { Namespace } from "socket.io";
import { Command, CommandId, Username } from "./types";
import { DrawCommand } from "./commands/draw";
import { EraseCommand } from "./commands/erase";
import { TextCommand } from "./commands/text";
import { MoveCommand } from "./commands/move";

/**
 * Controller which is responsible for executing, redoing and undoing commands
 * @param stack - Stores the comamnds, as a map, mapping commandids to commands
 * @param namespace - namespace instance of socketio, used to send events
 */
export class CommandController {
  stack: Map<CommandId, DrawCommand | EraseCommand | MoveCommand | TextCommand>;
  namespace: Namespace;
  constructor(namespace: Namespace) {
    this.stack = new Map();
    this.namespace = namespace;
  }

  /**
   * Executes a command, adding in to the stack. Removes all undone elements belonging to user
   * @param command - Command to be executed
   * @param username - user which executes the command
   */
  execute(
    command: DrawCommand | EraseCommand | MoveCommand | TextCommand,
    username: Username,
  ) {
    for (const command of this.stack) {
      if (command[1].owner !== username || command[1].display) continue;
      this.stack.delete(command[0]);
    }
    command.execute(this.namespace);
    this.stack.set(command.commandId, command);
  }

  /**
   * Undoes the latest command executed by the given user
   * @param username - user which undoes
   */
  undo(username: Username) {
    if (this.stack.size === 0) return;
    let latestCommand: Command | null = null;
    for (const command of this.stack) {
      if (command[1].owner !== username) continue;
      latestCommand = command[1];
    }
    if (latestCommand === null) return;
    latestCommand.display = false;
    latestCommand.undo(this.namespace);
  }

  /**
   * Redoes the oldest command undoed by the given user
   * @param username - user which redoes
   */
  redo(username: Username) {
    if (this.stack.size === 0) return;
    for (const command of this.stack) {
      if (command[1].owner !== username || !command[1].display) continue;
      command[1].display = true;
      command[1].redo(this.namespace);
      break;
    }
  }
}
