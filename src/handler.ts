import {readFileSync} from "fs";
import path from "path";
import YAML from "yaml";
import express from "express";
import {createProxyMiddleware} from "http-proxy-middleware";

import {Service} from "./types/service";

// reads and parses config file
const readConfigFile = () => {
    const file = readFileSync(path.join(process.cwd(), 'sls-multi-gateways.yml'),  'utf8');
    return YAML.parse(file)
};

// runs each services
const runServices = (services: Service[], httpPort: number, stage: string, prefixColors: string[]) => {
    const commands = services.map((service, i) => {
        const preCommand = service.additionalCommands?.pre ? `${service.additionalCommands?.pre};` : '';
        const postCommand = service.additionalCommands?.post ? `;${service.additionalCommands?.post};` : '';
        const servicePort = httpPort + i + 1;
        const execCommand = `
            cd  ${process.cwd()}/${service.srvSource};
            ${preCommand}
            sls offline start --stage ${stage} --httpPort ${servicePort} --lambdaPort ${servicePort + 1000}
            ${postCommand}
        `;
        return {
            command: execCommand,
            name: services[i].srvName,
            prefixColor: i < prefixColors.length ? prefixColors[i]: 'gray'
        };
    });

    return commands
}

// proxy each service
const runProxy = (services: Service[], httpPort: number, stage: string, noPrependStageInUrl: boolean) => {
    const app = express();

    for (let i = 0; i < services.length; i++) {
        const servicePort = httpPort + i + 1;
        const target = noPrependStageInUrl ? `http://localhost:${servicePort}/` : `http://localhost:${servicePort}/${stage}/`;
        app.use(`/${services[i].srvPath}/`, createProxyMiddleware({
            target,
            changeOrigin: true,
        }));
    }

    app.listen(httpPort);
}

export { readConfigFile, runServices, runProxy };