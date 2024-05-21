import { beforeAll, afterAll, describe, it, expect } from "vitest";
import { server, socketio } from "../server"; // Ensure correct path
import { io as ioc, type Socket as ClientSocket } from "socket.io-client";
import { type Socket as ServerSocket } from "socket.io";
import fetch from "node-fetch";
import { BoardId } from "../types";

const SERVER_PORT = 51234;

function waitFor(socket: ServerSocket | ClientSocket, event: string) {
  return new Promise((resolve) => {
    socket.once(event, resolve);
  });
}

describe("BoardSocket Testing", () => {
  let serverSocket: ServerSocket;
  let clientSocket: ClientSocket;

  beforeAll(async () => {
    if (!server.listening) {
      await new Promise<void>((resolve) => {
        server.listen(SERVER_PORT, resolve);
      });
    }

    const response = await fetch(
      `http://localhost:${SERVER_PORT}/v1/board/create`,
    );
    if (!response.ok) {
      console.error(`Failed to fetch /v1/board/create: ${response.statusText}`);
      throw new Error(
        `Failed to fetch /v1/board/create: ${response.statusText}`,
      );
    }

    let data;
    try {
      data = (await response.json()) as { boardId: BoardId };
    } catch (err) {
      console.error(`Failed to parse JSON response: ${err}`);
      throw new Error(`Failed to parse JSON response: ${err}`);
    }

    const boardId = data.boardId;

    clientSocket = ioc(`ws://localhost:${SERVER_PORT}/${boardId}`, {
      auth: {
        username: "tbdlarsen",
        color: "2",
      },
    });

    socketio.on("connection", (socket) => {
      serverSocket = socket;
    });

    await new Promise<void>((resolve) => {
      clientSocket.on("connect", resolve);
    });
  });

  afterAll(() => {
    if (clientSocket) {
      clientSocket.disconnect();
    }
    if (server.listening) {
      server.close();
    }
  });

  it("should work", () => {
    return new Promise<void>((resolve) => {
      clientSocket.on("hello", (arg) => {
        expect(arg).toEqual("world");
        resolve();
      });
      serverSocket.emit("hello", "world");
    });
  });

  it("should work with an acknowledgement", () => {
    return new Promise<void>((resolve) => {
      serverSocket.on("hi", (cb) => {
        cb("hola");
      });
      clientSocket.emit("hi", (arg) => {
        expect(arg).toEqual("hola");
        resolve();
      });
    });
  });

  it("should work with emitWithAck()", async () => {
    serverSocket.on("foo", (cb) => {
      cb("bar");
    });
    const result = await clientSocket.emitWithAck("foo");
    expect(result).toEqual("bar");
  });

  it("should work with waitFor()", () => {
    clientSocket.emit("baz");
    return waitFor(serverSocket, "baz");
  });
});
