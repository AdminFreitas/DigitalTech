import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// News queries
import { and, desc, ilike, inArray, like, or } from "drizzle-orm";
import { news } from "../drizzle/schema";
import type { NewsCategory } from "../shared/types";
import { userBookmarks, userNotificationPreferences, notificationChannels, contacts } from "../drizzle/schema";
import type { InsertContact, InsertUserNotificationPreference } from "../drizzle/schema";

export async function getPublishedNews(limit?: number) {
  const db = await getDb();
  if (!db) return [];

  const query = db
    .select()
    .from(news)
    .where(eq(news.status, "published"))
    .orderBy(desc(news.pinned), desc(news.priority), desc(news.publishedAt));

  if (limit) {
    query.limit(limit);
  }

  return query;
}

export async function getNewsByCategory(category: NewsCategory, limit?: number) {
  const db = await getDb();
  if (!db) return [];

  const query = db
    .select()
    .from(news)
    .where(
      and(eq(news.status, "published"), eq(news.category, category))
    )
    .orderBy(desc(news.pinned), desc(news.priority), desc(news.publishedAt));

  if (limit) {
    query.limit(limit);
  }

  return query;
}

export async function getNewsBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(news)
    .where(and(eq(news.status, "published"), eq(news.slug, slug)))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function searchNews(query: string, limit = 20) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(news)
    .where(
      and(
        eq(news.status, "published"),
        or(
          ilike(news.title, `%${query}%`),
          ilike(news.summary, `%${query}%`),
          ilike(news.content, `%${query}%`)
        )
      )
    )
    .orderBy(desc(news.publishedAt))
    .limit(limit);
}

export async function getHeroNews() {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(news)
    .where(eq(news.status, "published"))
    .orderBy(desc(news.pinned), desc(news.priority), desc(news.publishedAt))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getFeaturedNews(limit = 4) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(news)
    .where(and(eq(news.status, "published"), eq(news.featured, 1)))
    .orderBy(desc(news.pinned), desc(news.priority), desc(news.publishedAt))
    .limit(limit);
}

export async function getRelatedNews(
  currentSlug: string,
  category: NewsCategory,
  limit = 4
) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(news)
    .where(
      and(
        eq(news.status, "published"),
        eq(news.category, category),
      )
    )
    .orderBy(desc(news.publishedAt))
    .limit(limit);
}

export async function getMostReadNews(limit = 5) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(news)
    .where(eq(news.status, "published"))
    .orderBy(desc(news.viewsLast7Days))
    .limit(limit);
}

// ===== BOOKMARKS (Favoritos) =====
export async function addBookmark(userId: number, newsId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    await db.insert(userBookmarks).values({ userId, newsId }).onDuplicateKeyUpdate({
      set: { savedAt: new Date() },
    });
  } catch (error) {
    console.error("[Database] Failed to add bookmark:", error);
    throw error;
  }
}

export async function removeBookmark(userId: number, newsId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    await db.delete(userBookmarks).where(
      and(eq(userBookmarks.userId, userId), eq(userBookmarks.newsId, newsId))
    );
  } catch (error) {
    console.error("[Database] Failed to remove bookmark:", error);
    throw error;
  }
}

export async function getUserBookmarks(userId: number) {
  const db = await getDb();
  if (!db) return [];

  try {
    const bookmarks = await db
      .select()
      .from(userBookmarks)
      .where(eq(userBookmarks.userId, userId))
      .orderBy(desc(userBookmarks.savedAt));
    return bookmarks;
  } catch (error) {
    console.error("[Database] Failed to get bookmarks:", error);
    return [];
  }
}

// ===== NOTIFICATION PREFERENCES =====
export async function getOrCreateNotificationPreferences(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const existing = await db
      .select()
      .from(userNotificationPreferences)
      .where(eq(userNotificationPreferences.userId, userId))
      .limit(1);

    if (existing.length > 0) return existing[0];

    await db.insert(userNotificationPreferences).values({ userId });
    const created = await db
      .select()
      .from(userNotificationPreferences)
      .where(eq(userNotificationPreferences.userId, userId))
      .limit(1);

    return created[0];
  } catch (error) {
    console.error("[Database] Failed to get/create notification preferences:", error);
    throw error;
  }
}

export async function updateNotificationPreferences(
  userId: number,
  updates: Partial<InsertUserNotificationPreference>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    await db
      .update(userNotificationPreferences)
      .set(updates)
      .where(eq(userNotificationPreferences.userId, userId));
  } catch (error) {
    console.error("[Database] Failed to update notification preferences:", error);
    throw error;
  }
}

// ===== NOTIFICATION CHANNELS =====
export async function addNotificationChannel(
  userId: number,
  channelType: "email" | "whatsapp" | "telegram",
  identifier: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    await db.insert(notificationChannels).values({
      userId,
      channelType,
      identifier,
      isActive: 1,
      verifiedAt: new Date(),
    });
  } catch (error) {
    console.error("[Database] Failed to add notification channel:", error);
    throw error;
  }
}

export async function getUserNotificationChannels(userId: number) {
  const db = await getDb();
  if (!db) return [];

  try {
    const channels = await db
      .select()
      .from(notificationChannels)
      .where(eq(notificationChannels.userId, userId));
    return channels;
  } catch (error) {
    console.error("[Database] Failed to get notification channels:", error);
    return [];
  }
}

// ===== CONTACTS (Formulário de contato) =====
export async function createContact(contact: InsertContact) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const result = await db.insert(contacts).values(contact);
    return result;
  } catch (error) {
    console.error("[Database] Failed to create contact:", error);
    throw error;
  }
}

export async function getContacts(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];

  try {
    const contactsList = await db
      .select()
      .from(contacts)
      .orderBy(desc(contacts.createdAt))
      .limit(limit)
      .offset(offset);
    return contactsList;
  } catch (error) {
    console.error("[Database] Failed to get contacts:", error);
    return [];
  }
}
