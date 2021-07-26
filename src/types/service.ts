import { AdditionalCommands } from './additional-commands';

export interface Service {
    srvName: string;
    srvSource: string;
    srvPath: string;
    additionalCommands?: AdditionalCommands;
}
