import { beforeAll, afterAll, describe, it, expect } from "vitest";
import { createServer } from "node:http";
import { type AddressInfo } from "node:net";
import { io as ioc, type Socket as ClientSocket } from "socket.io-client";
import { Server, type Socket as ServerSocket } from "socket.io";
import fetch from "node-fetch";
import { BoardId } from "../types";

function waitFor(socket: ServerSocket | ClientSocket, event: string) {
  return new Promise((resolve) => {
    socket.once(event, resolve);
  });
}

describe("my awesome project", () => {
  let io: Server, serverSocket: ServerSocket, clientSocket: ClientSocket;

  beforeAll(() => {
    return new Promise((resolve) => {
      const httpServer = createServer();
      io = new Server(httpServer);
      httpServer.listen(async () => {
        const port = (httpServer.address() as AddressInfo).port;

        const response = await fetch(
          `http://localhost:${port}/v1/board/create`,
        );
        const data = (await response.json()) as { boardId: BoardId };
        const boardId = data.boardId;

        // connect to boardSocket
        const clientSocket = ioc(`ws://localhost:${port}/${boardId}`, {
          auth: {
            username: "tbdlarsen",
            color: "2",
          },
        });

        io.on("connection", (socket) => {
          serverSocket = socket;
        });
        clientSocket.on("connect", resolve);
      });
    });
  });

  afterAll(() => {
    io.close();
    clientSocket.disconnect();
  });

  // it("should work", () => {
  //   return new Promise((resolve) => {
  //     clientSocket.on("hello", (arg) => {
  //       expect(arg).toEqual("world");
  //       resolve();
  //     });
  //     serverSocket.emit("hello", "world");
  //   });
  // });
  //
  // it("should work with an acknowledgement", () => {
  //   return new Promise((resolve) => {
  //     serverSocket.on("hi", (cb) => {
  //       cb("hola");
  //     });
  //     clientSocket.emit("hi", (arg) => {
  //       expect(arg).toEqual("hola");
  //       resolve();
  //     });
  //   });
  // });
  //
  // it("should work with emitWithAck()", async () => {
  //   serverSocket.on("foo", (cb) => {
  //     cb("bar");
  //   });
  //   const result = await clientSocket.emitWithAck("foo");
  //   expect(result).toEqual("bar");
  // });
  //
  // it("should work with waitFor()", () => {
  //   clientSocket.emit("baz");
  //
  //   return waitFor(serverSocket, "baz");
  // });
});
