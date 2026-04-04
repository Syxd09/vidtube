import { pgTable, text, timestamp, integer, boolean, jsonb, uuid } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  firebaseUid: text("firebase_uid").notNull().unique(),
  email: text("email").notNull().unique(),
  name: text("name"),
  tier: text("tier").default("Command"),
  joinedAt: timestamp("joined_at").defaultNow(),
  photoUrl: text("photo_url"),
});

export const goals = pgTable("goals", {
  id: text("id").primaryKey(), // Using text to support current frontend Date.now().toString() IDs
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  progress: integer("progress").default(0),
  completed: boolean("completed").default(false),
  milestones: jsonb("milestones").default([]),
  priority: text("priority").default("Medium"),
  category: text("category").default("designing"),
  time: text("time").default("TBD"),
  context: text("context"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const notes = pgTable("notes", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  date: text("date").notNull(),
  goalId: text("goal_id"), // Optional link to a goal
  createdAt: timestamp("created_at").defaultNow(),
});

export const habits = pgTable("habits", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  progress: integer("progress").default(0),
  frequency: text("frequency").default("daily"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const history = pgTable("history", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  data: jsonb("data").notNull(), // Stores completion heatmaps
  updatedAt: timestamp("updated_at").defaultNow(),
});
