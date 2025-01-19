import { z } from 'zod';

// export interface IInstanceSettings {
//   syncHistory: boolean;
//   enableCommands: boolean;
//   ignoreGroupsMessage: boolean;
//   ignoreStatusMessage: boolean;
//   commandPrefixies: string[];
//   ignoreGroups: string[];
//   ignoreJid: string[];
//   admins: string[];
//   qrCode: boolean;
//   number: string;
//   blockOnCall?: boolean;
//   ownController: boolean;
//   baseCommands: boolean;
//   ownCommands: boolean;
//   excludeBaseCommands: string[];
// }

export const InstanceSettingSchema = z.object({
  syncHistory: z.boolean().default(true),
  enableCommands: z.boolean().default(true),
  ignoreGroupsMessage: z.boolean().default(false),
  ignoreStatusMessage: z.boolean().default(true),
  commandPrefixies: z.string().array().default(['/']),
  ignoreGroups: z.string().array().default([]),
  ignoreJid: z.string().array().default([]),
  admins: z.string().array().default([]),
  qrCode: z.boolean().default(true),
  number: z.string().default(''),
  blockOnCall: z.boolean().default(false),
  ownController: z.boolean().default(false),
  baseCommands: z.boolean().default(true),
  ownCommands: z.boolean().default(false),
  excludeBaseCommands: z.string().array().default([]),
});

export type IInstanceSettings = z.infer<typeof InstanceSettingSchema>;
