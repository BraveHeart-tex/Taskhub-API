import { sql } from 'drizzle-orm';
import {
  index,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';
import { customTimestamp } from './timestamp';

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    avatarUrl: text('avatar_url'),
    fullName: text('full_name').notNull().default(''),
    email: text('email').notNull().unique(),
    passwordHash: text('password_hash').notNull(),
    createdAt: customTimestamp('created_at')
      .$defaultFn(() => sql`NOW()`)
      .notNull(),
    updatedAt: customTimestamp('updated_at')
      .$defaultFn(() => sql`NOW()`)
      .notNull()
      .$onUpdateFn(() => sql`NOW()`),
  },
  (table) => [uniqueIndex('users_email_idx').on(table.email)]
);

export const sessions = pgTable(
  'sessions',
  {
    id: text('id').primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    secretHash: text('secret_hash').notNull(),
    expiresAt: customTimestamp('expires_at').notNull(),
  },
  (table) => [
    index('sessions_user_id_idx').on(table.userId),
    index('sessions_expires_at_idx').on(table.expiresAt),
  ]
);

export const workspaces = pgTable(
  'workspaces',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    ownerId: uuid('owner_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: customTimestamp('created_at')
      .$defaultFn(() => sql`NOW()`)
      .notNull(),
    updatedAt: customTimestamp('updated_at')
      .$defaultFn(() => sql`NOW()`)
      .notNull()
      .$onUpdateFn(() => sql`NOW()`),
  },
  (table) => [
    index('workspaces_owner_id_idx').on(table.ownerId),
    index('workspaces_owner_id_name_idx').on(table.ownerId, table.name),
  ]
);

const workspaceMemberRoleEnum = pgEnum('workspace_member_role', [
  'owner',
  'admin',
  'member',
]);

export const workspaceMembers = pgTable(
  'workspace_members',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    role: workspaceMemberRoleEnum().notNull(),
    createdAt: customTimestamp('created_at')
      .$defaultFn(() => sql`NOW()`)
      .notNull(),
    updatedAt: customTimestamp('updated_at')
      .$defaultFn(() => sql`NOW()`)
      .notNull()
      .$onUpdateFn(() => sql`NOW()`),
  },
  (table) => [
    uniqueIndex('workspace_members_workspace_id_user_id_key').on(
      table.workspaceId,
      table.userId
    ),
    index('workspace_members_user_id_idx').on(table.userId),
  ]
);

export const boards = pgTable(
  'boards',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    createdBy: uuid('created_by')
      .notNull()
      .references(() => users.id, { onDelete: 'set null' }),
    createdAt: customTimestamp('created_at')
      .$defaultFn(() => sql`NOW()`)
      .notNull(),
    updatedAt: customTimestamp('updated_at')
      .$defaultFn(() => sql`NOW()`)
      .notNull()
      .$onUpdateFn(() => sql`NOW()`),
  },
  (table) => [index('boards_workspace_id').on(table.workspaceId)]
);

const boardMemberRoleEnum = pgEnum('board_member_role', ['owner', 'member']);

export const boardMembers = pgTable(
  'board_members',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    boardId: uuid('board_id')
      .notNull()
      .references(() => boards.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    role: boardMemberRoleEnum().notNull().default('member'),
    createdAt: customTimestamp('created_at')
      .$defaultFn(() => sql`NOW()`)
      .notNull(),
    updatedAt: customTimestamp('updated_at')
      .$defaultFn(() => sql`NOW()`)
      .notNull()
      .$onUpdateFn(() => sql`NOW()`),
  },
  (table) => [
    uniqueIndex('board_members_board_id_user_id_key').on(
      table.boardId,
      table.userId
    ),
  ]
);

export const lists = pgTable(
  'lists',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    boardId: uuid('board_id')
      .notNull()
      .references(() => boards.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    position: numeric('position', {
      precision: 20,
      scale: 10,
      mode: 'string',
    }).notNull(),
    createdAt: customTimestamp('created_at')
      .$defaultFn(() => sql`NOW()`)
      .notNull(),
    updatedAt: customTimestamp('updated_at')
      .$defaultFn(() => sql`NOW()`)
      .notNull()
      .$onUpdateFn(() => sql`NOW()`),
  },
  (table) => [
    index('lists_board_id').on(table.boardId),
    uniqueIndex('lists_board_id_position_key').on(
      table.boardId,
      table.position
    ),
  ]
);

export const cards = pgTable(
  'cards',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    listId: uuid('list_id')
      .notNull()
      .references(() => lists.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    description: text('description'),
    position: numeric('position', {
      precision: 20,
      scale: 10,
      mode: 'string',
    }).notNull(),
    createdBy: uuid('created_by')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: customTimestamp('created_at')
      .$defaultFn(() => sql`NOW()`)
      .notNull(),
    updatedAt: customTimestamp('updated_at')
      .$defaultFn(() => sql`NOW()`)
      .notNull()
      .$onUpdateFn(() => sql`NOW()`),
  },
  (table) => [
    index('cards_list_id').on(table.listId),
    uniqueIndex('cards_list_id_position_key').on(table.listId, table.position),
    index('cards_created_by').on(table.createdBy),
  ]
);

export const boardFavorites = pgTable(
  'board_favorites',
  {
    boardId: uuid()
      .notNull()
      .references(() => boards.id, { onDelete: 'cascade' }),
    userId: uuid()
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: customTimestamp('created_at')
      .$defaultFn(() => sql`NOW()`)
      .notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.boardId, table.userId] }),
    index('board_favorites_user_id').on(table.userId),
  ]
);

export type UserRow = typeof users.$inferSelect;
export type SessionRow = typeof sessions.$inferSelect;
export type WorkspaceRow = typeof workspaces.$inferSelect;
export type BoardRow = typeof boards.$inferSelect;
export type BoardMemberRow = typeof boardMembers.$inferSelect;
export type ListRow = typeof lists.$inferSelect;
export type CardRow = typeof cards.$inferSelect;

export type UserInsert = typeof users.$inferInsert;
export type SessionInsert = typeof sessions.$inferInsert;

export type WorkspaceInsert = typeof workspaces.$inferInsert;
export type WorkspaceUpdate = Pick<WorkspaceRow, 'name'>;

export type WorkspaceMemberRow = typeof workspaceMembers.$inferSelect;
export type WorkspaceMemberInsert = typeof workspaceMembers.$inferInsert;
export type WorkspaceMemberUpdate = Pick<WorkspaceMemberRow, 'role'>;

export type BoardInsert = typeof boards.$inferInsert;
export type BoardUpdate = Pick<BoardRow, 'title'>;

export type BoardMemberInsert = typeof boardMembers.$inferInsert;
export type BoardMemberUpdate = Pick<BoardMemberRow, 'role'>;

export type ListCreate = typeof lists.$inferInsert;
export type ListUpdate = Partial<Pick<ListRow, 'title' | 'position'>>;

export type CardCreate = typeof cards.$inferInsert;
export type CardUpdate = Pick<CardRow, 'title' | 'description'>;
