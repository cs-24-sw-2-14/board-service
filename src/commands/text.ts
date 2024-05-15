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
  display: Boolean;
  constructor(commandId: number, text: Text, owner: string) {
    this.commandId = commandId;
    this.owner = owner;
    this.text = text;
    this.display = true;
  }
  execute(socket: Namespace | Socket) {
    socket.emit("edit", {
      svgString: this.text.stringify(),
      placement: this.text.placement,
      commandId: this.commandId,
    });
  }
  undo(socket: Namespace | Socket) {
    // More sophisticated command behavior ?
    socket.emit("remove", {
      commandId: this.commandId,
    });
  }
  redo(socket: Namespace | Socket) {
    this.execute(socket);
  }
}

