import { z } from 'zod';

export const dashboardSchema = z.object({
  workspaces: z.array(
    z.object({
      id: z.uuid(),
      name: z.string(),
      role: z.enum(['owner', 'admin', 'member']),
    })
  ),
  favorites: z.array(z.uuid()),
  boards: z.array(
    z.object({
      isFavorited: z.boolean(),
      id: z.uuid(),
      title: z.string(),
      workspaceId: z.uuid(),
    })
  ),
});

export type DashboardDto = z.infer<typeof dashboardSchema>;
