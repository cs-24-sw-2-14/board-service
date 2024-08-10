import { Namespace, Socket } from "socket.io";
import { Command, CoordinateSet } from "../types";

export class Text {
  position: CoordinateSet;
  content: string;
  constructor(position: CoordinateSet, content: string) {
    this.position = position;
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
  execute(socket: Namespace | Socket) {
    let obj = {
      svgString: this.text.stringify(),
      position: this.text.position,
      commandId: this.commandId,
    };

    socket.emit("edit", obj);
    console.log("Text execute", obj);
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
