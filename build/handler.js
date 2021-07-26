"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runProxy = exports.runServices = exports.readConfigFile = void 0;
var fs_1 = require("fs");
var path_1 = __importDefault(require("path"));
var yaml_1 = __importDefault(require("yaml"));
var express_1 = __importDefault(require("express"));
var http_proxy_middleware_1 = require("http-proxy-middleware");
// reads and parses config file
var readConfigFile = function () {
    var file = fs_1.readFileSync(path_1.default.join(process.cwd(), 'sls-multi-gateways.yml'), 'utf8');
    return yaml_1.default.parse(file);
};
exports.readConfigFile = readConfigFile;
// runs each services
var runServices = function (services, httpPort, stage, prefixColors) {
    var commands = services.map(function (service, i) {
        var _a, _b, _c, _d;
        var preCommand = ((_a = service.additionalCommands) === null || _a === void 0 ? void 0 : _a.pre) ? ((_b = service.additionalCommands) === null || _b === void 0 ? void 0 : _b.pre) + ";" : '';
        var postCommand = ((_c = service.additionalCommands) === null || _c === void 0 ? void 0 : _c.post) ? ";" + ((_d = service.additionalCommands) === null || _d === void 0 ? void 0 : _d.post) + ";" : '';
        var servicePort = httpPort + i + 1;
        var execCommand = "\n            cd  " + process.cwd() + "/" + service.srvSource + ";\n            " + preCommand + "\n            sls offline --stage " + stage + " --httpPort " + servicePort + " --lambdaPort " + (servicePort + 1000) + "\n            " + postCommand + "\n        ";
        return {
            command: execCommand,
            name: services[i].srvName,
            prefixColor: i < prefixColors.length ? prefixColors[i] : 'gray'
        };
    });
    return commands;
};
exports.runServices = runServices;
// proxy each service
var runProxy = function (services, httpPort, stage) {
    var app = express_1.default();
    for (var i = 0; i < services.length; i++) {
        var servicePort = httpPort + i + 1;
        app.use("/" + services[i].srvPath + "/", http_proxy_middleware_1.createProxyMiddleware({
            target: "http://localhost:" + servicePort + "/" + stage + "/",
            changeOrigin: true,
        }));
    }
    app.listen(httpPort);
};
exports.runProxy = runProxy;
