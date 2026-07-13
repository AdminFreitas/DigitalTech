import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// News table for the blog module
export const news = mysqlTable("news", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  summary: text("summary"),
  content: text("content").notNull(), // Markdown content
  coverImage: varchar("coverImage", { length: 512 }),
  coverImageAlt: varchar("coverImageAlt", { length: 255 }),
  category: mysqlEnum("category", [
    "ia",
    "engenharia",
    "seguranca",
    "cloud",
    "dados",
    "carreira",
  ]).notNull(),
  categorySlug: varchar("categorySlug", { length: 64 }).notNull(),
  tags: text("tags"), // JSON array as string
  author: varchar("author", { length: 255 }).notNull(),
  status: mysqlEnum("status", [
    "draft",
    "published",
    "scheduled",
    "archived",
  ]).default("draft"),
  featured: int("featured").default(0), // boolean as int
  breaking: int("breaking").default(0), // boolean as int
  pinned: int("pinned").default(0), // boolean as int
  priority: int("priority").default(0),
  views: int("views").default(0),
  viewsLast7Days: int("viewsLast7Days").default(0),
  readingTime: int("readingTime"), // in minutes
  seoTitle: varchar("seoTitle", { length: 255 }),
  seoDescription: varchar("seoDescription", { length: 512 }),
  publishedAt: timestamp("publishedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type News = typeof news.$inferSelect;
export type InsertNews = typeof news.$inferInsert;

/**
 * User bookmarks (favoritos persistentes em banco de dados)
 * Relaciona usuários com artigos que salvaram para ler depois
 */
export const userBookmarks = mysqlTable(
  "user_bookmarks",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    newsId: int("newsId").notNull(),
    savedAt: timestamp("savedAt").defaultNow().notNull(),
  },
  (table) => ({
    uniqueUserNews: unique("unique_user_news").on(table.userId, table.newsId),
  })
);

export type UserBookmark = typeof userBookmarks.$inferSelect;
export type InsertUserBookmark = typeof userBookmarks.$inferInsert;

/**
 * User notification preferences
 * Armazena preferências de notificação por usuário
 */
export const userNotificationPreferences = mysqlTable("user_notification_preferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  emailNotifications: mysqlEnum("emailNotifications", ["all", "weekly", "never"])
    .default("all")
    .notNull(),
  whatsappNotifications: mysqlEnum("whatsappNotifications", ["all", "weekly", "never"])
    .default("never")
    .notNull(),
  telegramNotifications: mysqlEnum("telegramNotifications", ["all", "weekly", "never"])
    .default("never")
    .notNull(),
  preferredCategories: text("preferredCategories").default("").notNull(), // JSON array as string
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserNotificationPreference = typeof userNotificationPreferences.$inferSelect;
export type InsertUserNotificationPreference = typeof userNotificationPreferences.$inferInsert;

/**
 * Notification channels (WhatsApp, Telegram, etc)
 * Armazena os canais de notificação verificados do usuário
 */
export const notificationChannels = mysqlTable(
  "notification_channels",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    channelType: mysqlEnum("channelType", ["email", "whatsapp", "telegram"])
      .notNull(),
    identifier: varchar("identifier", { length: 255 }).notNull(), // email, phone, or telegram_id
    isActive: int("isActive").default(1).notNull(), // boolean as int
    verifiedAt: timestamp("verifiedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    uniqueUserChannel: unique("unique_user_channel").on(table.userId, table.channelType),
  })
);

export type NotificationChannel = typeof notificationChannels.$inferSelect;
export type InsertNotificationChannel = typeof notificationChannels.$inferInsert;

/**
 * Contact form submissions (sem autenticação)
 * Armazena sugestões, reportes de erro e contatos públicos
 */
export const contacts = mysqlTable("contacts", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  subject: varchar("subject", { length: 255 }).notNull(),
  message: text("message").notNull(),
  status: mysqlEnum("status", ["new", "read", "responded"]).default("new").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Contact = typeof contacts.$inferSelect;
export type InsertContact = typeof contacts.$inferInsert;
import { unique } from "drizzle-orm/mysql-core";
