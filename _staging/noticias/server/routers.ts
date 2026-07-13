import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import {
  addBookmark,
  removeBookmark,
  getUserBookmarks,
  getOrCreateNotificationPreferences,
  updateNotificationPreferences,
  getUserNotificationChannels,
  addNotificationChannel,
  createContact,
} from "./db";
import { getMockNews, getMockNewsBySlug, searchMockNews } from "./news.service";
import type { NewsCategory } from "@shared/types";
import { TRPCError } from "@trpc/server";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  news: router({
    list: publicProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return getMockNews();
      }),

    byCategory: publicProcedure
      .input(z.object({ category: z.string(), limit: z.number().optional() }))
      .query(async ({ input }) => {
        return getMockNews({ category: input.category as NewsCategory });
      }),

    bySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        return getMockNewsBySlug(input.slug);
      }),

    search: publicProcedure
      .input(z.object({ query: z.string(), limit: z.number().optional() }))
      .query(async ({ input }) => {
        return searchMockNews(input.query);
      }),

    hero: publicProcedure.query(async () => {
      const allNews = getMockNews();
      return allNews[0] || null;
    }),

    featured: publicProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(async ({ input }) => {
        const allNews = getMockNews();
        return allNews.slice(0, input?.limit || 4);
      }),

    related: publicProcedure
      .input(
        z.object({
          slug: z.string(),
          category: z.string(),
          limit: z.number().optional(),
        })
      )
      .query(async ({ input }) => {
        const allNews = getMockNews({
          category: input.category as NewsCategory,
        });
        return allNews.filter((n) => n.slug !== input.slug).slice(0, input.limit || 4);
      }),

    mostRead: publicProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(async ({ input }) => {
        const allNews = getMockNews();
        return allNews
          .sort((a, b) => (b.viewsLast7Days || 0) - (a.viewsLast7Days || 0))
          .slice(0, input?.limit || 5);
      }),
  }),

  // Bookmarks (Favoritos)
  bookmarks: router({
    add: protectedProcedure
      .input(z.object({ newsId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        try {
          await addBookmark(ctx.user.id, input.newsId);
          return { success: true };
        } catch (error) {
          console.error("Failed to add bookmark:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        }
      }),

    remove: protectedProcedure
      .input(z.object({ newsId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        try {
          await removeBookmark(ctx.user.id, input.newsId);
          return { success: true };
        } catch (error) {
          console.error("Failed to remove bookmark:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        }
      }),

    list: protectedProcedure.query(async ({ ctx }) => {
      try {
        return await getUserBookmarks(ctx.user.id);
      } catch (error) {
        console.error("Failed to list bookmarks:", error);
        return [];
      }
    }),
  }),

  // Notification Preferences
  notifications: router({
    getPreferences: protectedProcedure.query(async ({ ctx }) => {
      try {
        return await getOrCreateNotificationPreferences(ctx.user.id);
      } catch (error) {
        console.error("Failed to get notification preferences:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),

    updatePreferences: protectedProcedure
      .input(
        z.object({
          emailNotifications: z.enum(["all", "weekly", "never"]).optional(),
          whatsappNotifications: z.enum(["all", "weekly", "never"]).optional(),
          telegramNotifications: z.enum(["all", "weekly", "never"]).optional(),
          preferredCategories: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        try {
          await updateNotificationPreferences(ctx.user.id, input);
          return { success: true };
        } catch (error) {
          console.error("Failed to update notification preferences:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        }
      }),

    getChannels: protectedProcedure.query(async ({ ctx }) => {
      try {
        return await getUserNotificationChannels(ctx.user.id);
      } catch (error) {
        console.error("Failed to get notification channels:", error);
        return [];
      }
    }),

    addChannel: protectedProcedure
      .input(
        z.object({
          channelType: z.enum(["email", "whatsapp", "telegram"]),
          identifier: z.string().min(1),
        })
      )
      .mutation(async ({ ctx, input }) => {
        try {
          await addNotificationChannel(ctx.user.id, input.channelType, input.identifier);
          return { success: true };
        } catch (error) {
          console.error("Failed to add notification channel:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        }
      }),
  }),

  // Contact Form (Público, sem autenticação)
  contact: router({
    submit: publicProcedure
      .input(
        z.object({
          name: z.string().min(2),
          email: z.string().email(),
          phone: z.string().optional(),
          subject: z.string().min(5),
          message: z.string().min(10),
        })
      )
      .mutation(async ({ input }) => {
        try {
          await createContact({
            name: input.name,
            email: input.email,
            phone: input.phone || null,
            subject: input.subject,
            message: input.message,
            status: "new",
          });
          return { success: true, message: "Mensagem enviada com sucesso!" };
        } catch (error) {
          console.error("Failed to submit contact:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao enviar mensagem" });
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
