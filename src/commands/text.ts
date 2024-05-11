import { Namespace } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { CommandInterface } from "../commandController";
import { Coordinate } from "./move";

export class Text {
  placement: Coordinate;
  content: string;
  constructor(placement: Coordinate, content: string){
    this.placement = placement;
    this.content = content;
  }

  stringify() {
    return `<text>${this.content}</text>`;
  }
}

export class TextCommand implements CommandInterface {
  commandId: number;
  owner: string;
  text: Text;
  constructor(commandId: number, text: Text, owner: string){
    this.commandId = commandId;
    this.owner = owner;
    this.text = text;
  }
  execute(socket: Namespace) {
    socket.emit('edit', {
      svg: this.text.stringify(),
      x: this.text.placement.x,
      y: this.text.placement.y,
      commandId: this.commandId,
    })
  };
  undo(socket: Namespace) {
    // More sophisticated command behavior ?
    socket.emit("remove", {
      commandId: this.commandId,
    });
  };
  redo(socket: Namespace) {
    this.execute(socket);
  };
}