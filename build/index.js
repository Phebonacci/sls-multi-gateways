#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var concurrently_1 = __importDefault(require("concurrently"));
var handler_1 = require("./handler");
var prefixColors = [
    'blue', 'green', 'magenta', 'cyan', 'white', 'gray', 'yellow', 'red'
];
var file = handler_1.readConfigFile();
var services = file.services;
var httpPort = file.port || 3000;
var stage = file.stage || 'dev';
var commands = handler_1.runServices(services, httpPort, stage, prefixColors);
concurrently_1.default(commands, {
    killOthers: ['failure', 'success']
}).then();
process.on('SIGINT', function () {
    console.log("");
    process.exit(1);
});
handler_1.runProxy(services, httpPort, stage);
