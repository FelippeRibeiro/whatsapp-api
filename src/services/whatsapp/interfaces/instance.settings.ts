export interface IInstanceSettings {
  syncHistory: boolean;
  enableCommands: boolean;
  ignoreGroupsMessage: boolean;
  ignoreStatusMessage: boolean;
  commandPrefix: string;
  ignoreCommands: string[];
  ignoreGroups: string[];
  ignoreJid: string[];
}
