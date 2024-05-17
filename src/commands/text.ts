import { Namespace, Socket } from "socket.io";
import { Command, CoordinateSet } from "../types";

export class Text {
  placement: CoordinateSet;
  content: string;
  constructor(placement: CoordinateSet, content: string) {
    this.placement = placement;
    this.content = content;
  }

  stringify() {
    return `<text>${this.content}</text>`;
  }
}

export class TextCommand implements Command {
  commandId: number;
  owner: string;
  text: Text;
  done: Boolean;
  constructor(commandId: number, text: Text, owner: string) {
    this.commandId = commandId;
    this.owner = owner;
    this.text = text;
    this.done = true;
  }
  execute(socket: Namespace | Socket, isVolatile: boolean) {
    const emitSocket = isVolatile ? socket.volatile : socket;
    emitSocket.emit("edit", {
      svgString: this.text.stringify(),
      placement: this.text.placement,
      commandId: this.commandId,
    });
  }
  undo(socket: Namespace | Socket, isVolatile: boolean) {
    // More sophisticated command behavior ?
    const emitSocket = isVolatile ? socket.volatile : socket;
    emitSocket.emit("remove", {
      commandId: this.commandId,
    });
  }
  redo(socket: Namespace | Socket, isVolatile: boolean) {
    this.execute(socket, isVolatile);
  }
}
