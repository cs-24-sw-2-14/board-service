import { Namespace, Socket } from "socket.io";
import { Command, CommandId, CoordinateSet, TextString, Username } from "../types";

export class Text {
  // Made a class called Text which is to consist of position, content and constructor. A class is a template of an object. 
  position: CoordinateSet;
  // position is of the type CoordinateSet (number: x, y). 
  content: TextString;
  // content is of the type TextString. 
  constructor(position: CoordinateSet, content: TextString) {
    // The constructor is used to create and initialize an object instance of the Text class. 
    // It takes in the parameters position and content, as in the class. 
    this.position = position;
    // position is set to be equal to the position from the text class. 
    this.content = content;
    // content is set to be equal to the content from the text class. 
  }

  stringify() {
    return `<text>${this.content}</text>`;
    // Makes the content from Text into a string. 
  }
}

export class TextCommand implements Command {
  // The class TextCommand will have the intetface of Command and text. 
  commandId: CommandId;
  owner: Username;
  text: Text;
  done: Boolean;
  constructor(commandId: CommandId, text: Text, owner: Username) {
    this.commandId = commandId;
    this.owner = owner;
    this.text = text;
    this.done = true;
  }
  execute(socket: Namespace | Socket) {
    // The function execute takes in the parameter socket, which is either of the type Namespace or Socket. 
    socket.emit("edit", {
      // There is a listener on webapp service for "edit". "edit": The function it calls is handleEdit on webapp. 
      // The info regarding the parameters svgString, position and commandId will be emitted to the socket. 
      svgString: this.text.stringify(),
      // svgString will be the value of stringify from the Text class. 
      position: this.text.position,
      // position will be the value of position from the Text class. 
      commandId: this.commandId,
      // commandId will be the value of commandId from the TextCommand class.  

  });

  }
  undo(socket: Namespace | Socket) {
    // The function undo takes in the parameter socket, which is either of the type Namespace or Socket. 
    socket.emit("remove", {
      // "remove" will be emitted to the socket with the parameters commandId. 
      commandId: this.commandId,
      // commandId ill be the value of commandId from the TextCommand class. 
    });
  }
  redo(socket: Namespace | Socket) {
     // The function redo takes in the parameter socket, which is either of the type Namespace or Socket. 
    this.execute(socket);
    // Then runs the execute of TextCommand (this TextCommand). 
  }
}
