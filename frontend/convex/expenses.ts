import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { auth } from "./auth";

// 1. QUERY: Fetch all expenses for the logged-in user
export const getExpenses = query({
  args: {},
  handler: async (ctx) => {
    // Get the ID of the person currently logged in
    const userId = await auth.getUserId(ctx);

    // If they aren't logged in, return an empty array
    if (!userId) {
      return [];
    }

    // Fetch only their expenses using the index we made in schema.ts
    const expenses = await ctx.db
      .query("expenses")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .collect();

    return expenses;
  },
});

// 2. MUTATION: Add a new expense
export const addExpense = mutation({
  // Define exactly what data the frontend must send [cite: 212-215]
  args: {
    amount: v.number(),
    category: v.string(),
    date: v.string(),
    paymentMethod: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);

    // Security check: Only logged-in users can add data [cite: 222]
    if (!userId) {
      throw new Error("You must be logged in to add an expense");
    }

    // Insert the data into the "expenses" table, attaching their userId [cite: 223]
    const newExpenseId = await ctx.db.insert("expenses", {
      userId,
      amount: args.amount,
      category: args.category,
      date: args.date,
      paymentMethod: args.paymentMethod,
      notes: args.notes,
    });

    return newExpenseId;
  },
});

export const deleteExpense = mutation({
  args: { id: v.id("expenses") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);

    if (!userId) {
      throw new Error("You must be logged in to delete an expense");
    }

    // Security check: Make sure they actually own the expense they are deleting
    const expense = await ctx.db.get(args.id);
    if (expense?.userId !== userId) {
      throw new Error("Unauthorized to delete this expense");
    }

    await ctx.db.delete(args.id);
  },
});