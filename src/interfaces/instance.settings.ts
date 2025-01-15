export interface IInstanceSettings {
    syncHistory: boolean;
    enableCommands: boolean;
    ignoreGroupsMessage: boolean;
    ignoreStatusMessage: boolean;
    commandPrefixies: string[];
    ignoreCommands: string[];
    ignoreGroups: string[];
    ignoreJid: string[];
    admins: string[];
}
