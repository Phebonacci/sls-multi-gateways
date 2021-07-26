import { Service } from "./types/service";
declare const readConfigFile: () => any;
declare const runServices: (services: Service[], httpPort: number, stage: string, prefixColors: string[]) => {
    command: string;
    name: string;
    prefixColor: string;
}[];
declare const runProxy: (services: Service[], httpPort: number, stage: string) => void;
export { readConfigFile, runServices, runProxy };
