/**
 * Unified type exports
 * Import shared types from this single entry point.
 */

export type * from "../drizzle/schema";
export * from "./_core/errors";

// News types
export type NewsCategory =
  | "ia"
  | "engenharia"
  | "seguranca"
  | "cloud"
  | "dados"
  | "carreira";

export type NewsStatus = "draft" | "published" | "scheduled" | "archived";

// Category configuration with colors
export const CATEGORY_CONFIG: Record<
  NewsCategory,
  { label: string; color: string; bgColor: string }
> = {
  ia: {
    label: "Inteligência Artificial",
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
  engenharia: {
    label: "Engenharia",
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  seguranca: {
    label: "Segurança",
    color: "text-red-600",
    bgColor: "bg-red-100",
  },
  cloud: {
    label: "Cloud",
    color: "text-cyan-600",
    bgColor: "bg-cyan-100",
  },
  dados: {
    label: "Dados",
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  carreira: {
    label: "Carreira",
    color: "text-amber-600",
    bgColor: "bg-amber-100",
  },
};
