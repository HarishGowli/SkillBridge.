// src/socket.js
import { io } from "socket.io-client";
import { baseAddress } from "./pages/data/api";

export const socket = io(baseAddress, {
    withCredentials: true,
    transports: ['websocket', 'polling']
});

export default socket;
