"use client";

import { SpendingChart } from "@/components/SpendingChart";
import { getFinancialAdvice } from "@/lib/gemini";
import { useState } from "react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "next-themes";
import { Id } from "../../convex/_generated/dataModel";


export default function DashboardPage() {
    // 1. State Hooks (Must be at the top)
    const [aiAdvice, setAiAdvice] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const [prediction, setPrediction] = useState<string | null>(null);

    // Expense Form State
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState("");
    const [date, setDate] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("");
    const [isSubmittingExpense, setIsSubmittingExpense] = useState(false);

    // Budget Form State
    const [budgetMonth, setBudgetMonth] = useState(new Date().toISOString().slice(0, 7));
    const [budgetCategory, setBudgetCategory] = useState("");
    const [budgetLimit, setBudgetLimit] = useState("");
    const [isSettingBudget, setIsSettingBudget] = useState(false);

    // 2. Auth & Backend Connections
    const { isAuthenticated, isLoading } = useConvexAuth();
    const { signOut } = useAuthActions();
    const { theme, setTheme } = useTheme();

    const expenses = useQuery(api.expenses.getExpenses);
    const budgets = useQuery(api.budgets.getBudgets);
    const addExpense = useMutation(api.expenses.addExpense);
    const deleteExpense = useMutation(api.expenses.deleteExpense);
    const setBudgetMutation = useMutation(api.budgets.setBudget);
    const user = useQuery(api.user.currentUser);

    // 3. Handlers
    const handleGetAdvice = async () => {
        if (!expenses || expenses.length === 0) return;
        setIsAnalyzing(true);
        try {
            const advice = await getFinancialAdvice(expenses);
            setAiAdvice(advice);
        } catch (error) {
            console.error(error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleAddExpense = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmittingExpense(true);
        try {
            await addExpense({ amount: parseFloat(amount), category, date, paymentMethod });
            setAmount(""); setCategory(""); setDate(""); setPaymentMethod("");
        } catch (error) {
            console.error(error);
            alert("Failed to add expense.");
        } finally {
            setIsSubmittingExpense(false);
        }
    };

    const handleSetBudget = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSettingBudget(true);
        try {
            await setBudgetMutation({
                month: budgetMonth,
                category: budgetCategory,
                limitAmount: parseFloat(budgetLimit),
            });
            setBudgetCategory(""); setBudgetLimit("");
        } catch (error) {
            console.error(error);
            alert("Failed to set budget.");
        } finally {
            setIsSettingBudget(false);
        }
    };

    const handleDownloadReport = async () => {
        if (!expenses || expenses.length === 0) return;
        setIsGeneratingPdf(true);

        try {
            const response = await fetch("https://financetracker1-zelp.onrender.com", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_name: user?.name ||"Amrit Kumar",
                    month: new Date().toISOString().slice(0, 7),
                    expenses: expenses.map(e => ({
                        category: e.category,
                        amount: e.amount,
                        date: e.date
                    }))
                })
            });

            // Handle the File Download
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Report_${new Date().toISOString().slice(0, 7)}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

        } catch (error) {
            console.error("PDF Error:", error);
            alert("Make sure your Python server is running on port 8000!");
        } finally {
            setIsGeneratingPdf(false);
        }
    };

    const handleGetPrediction = async () => {
    if (!expenses?.length) return;

    // This dynamically uses the Render URL when live, or localhost when you're coding
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

    try {
        const response = await fetch(`${BACKEND_URL}/predict-spending`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(expenses)
        });

        if (!response.ok) {
            throw new Error(`Server responded with status: ${response.status}`);
        }

        const result = await response.json();
        setPrediction(result.message);
    } catch (error) {
        console.error("Connection to Python backend failed:", error);
        setPrediction("Unable to connect to AI service. Please try again later.");
    }
};

    // 4. Auth Checks (Must be after all Hooks)
    if (isLoading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
    if (!isAuthenticated) return (
        <div className="flex h-screen items-center justify-center text-center">
            <div className="space-y-4">
                <p className="text-red-500 font-bold">You are not logged in.</p>
                <Button onClick={() => window.location.href = '/login'}>Go to Login</Button>
            </div>
        </div>
    );

return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Expense Dashboard</h1>
            <Button
                variant="secondary"
                onClick={handleDownloadReport}
                disabled={isGeneratingPdf || !expenses?.length || user === undefined}
            >
                {isGeneratingPdf ? "📄 Generating..." : "📄 Download PDF"}
            </Button>
            <Button
                variant="outline"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
                {theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode"}
            </Button>
            <Button onClick={() => signOut()} variant="destructive">Sign Out</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            {/* LEFT COLUMN: FORMS */}
            <div className="col-span-1 space-y-8">

                {/* ADD EXPENSE FORM */}
                <Card>
                    <CardHeader><CardTitle>Add New Expense</CardTitle></CardHeader>
                    <CardContent>
                        <form onSubmit={handleAddExpense} className="space-y-4">
                            <Input type="number" placeholder="Amount (e.g. 15.50)" value={amount} onChange={(e) => setAmount(e.target.value)} step="0.01" required />
                            <Input type="text" placeholder="Category (e.g. food)" value={category} onChange={(e) => setCategory(e.target.value)} required />
                            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
                            <Input type="text" placeholder="Payment Method" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} required />
                            <Button type="submit" className="w-full" disabled={isSubmittingExpense}>
                                {isSubmittingExpense ? "Adding..." : "Add Expense"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* SET BUDGET FORM */}
                <Card>
                    <CardHeader><CardTitle>Set Monthly Budget</CardTitle></CardHeader>
                    <CardContent>
                        <form onSubmit={handleSetBudget} className="space-y-4">
                            <Input type="month" value={budgetMonth} onChange={(e) => setBudgetMonth(e.target.value)} required />
                            <Input type="text" placeholder="Category (e.g. food)" value={budgetCategory} onChange={(e) => setBudgetCategory(e.target.value)} required />
                            <Input type="number" placeholder="Limit Amount (e.g. 300)" value={budgetLimit} onChange={(e) => setBudgetLimit(e.target.value)} required />
                            <Button type="submit" className="w-full" disabled={isSettingBudget}>
                                {isSettingBudget ? "Setting..." : "Set Budget"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

            </div>

            {/* RIGHT COLUMN: DATA */}
            <div className="col-span-1 md:col-span-2 space-y-8">

                <Card className="border-primary/50 bg-primary/5">
                    <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2">
                            ✨ AI Financial Insights
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isAnalyzing ? (
                            <p className="text-sm animate-pulse">Analyzing your spending habits...</p>
                        ) : aiAdvice ? (
                            <p className="text-sm italic whitespace-pre-wrap">
                                &ldquo;{aiAdvice}&rdquo;
                            </p>
                        ) : (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleGetAdvice}
                                disabled={!expenses?.length}
                            >
                                Analyze My Spending
                            </Button>
                        )}
                    </CardContent>
                </Card>

                <Card className="bg-blue-500/10 border-blue-500/20">
                    <CardHeader><CardTitle className="text-sm">📈 Spending Forecast</CardTitle></CardHeader>
                    <CardContent>
                        {prediction ? (
                            <p className="text-sm font-medium text-blue-400">{prediction}</p>
                        ) : (
                            <Button variant="link" className="p-0 h-auto text-blue-400" onClick={handleGetPrediction}>
                                Calculate my end-of-month forecast →
                            </Button>
                        )}
                    </CardContent>
                </Card>

                {/* 1. SPENDING CHART (NEW!) */}
                <Card>
                    <CardHeader>
                        <CardTitle>Spending Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {expenses && expenses.length > 0 ? (
                            <SpendingChart data={Object.values(
                                expenses.reduce(
                                    (acc: Record<string, { name: string; value: number }>, curr: Doc<"expenses">) => {
                                        const cat = curr.category.toLowerCase();
                                        if (!acc[cat]) acc[cat] = { name: cat, value: 0 };
                                        acc[cat].value += curr.amount;
                                        return acc;
                                    },
                                    {}
                                )
                            )} />
                        ) : (
                            <p className="text-muted-foreground">Add expenses to see your chart.</p>
                        )}
                    </CardContent>
                </Card>

                {/* 2. BUDGET TRACKER */}
                <Card>
                    <CardHeader><CardTitle>Budget Progress</CardTitle></CardHeader>
                    <CardContent>
                        {budgets === undefined || expenses === undefined ? (
                            <p className="text-muted-foreground">Loading budgets...</p>
                        ) : budgets.length === 0 ? (
                            <p className="text-muted-foreground">No budgets set. Create one to start tracking!</p>
                        ) : (
                            <div className="space-y-4">
                                {budgets.map((budget) => {
                                    const spent = expenses
                                        .filter(e => {
                                            const isSameMonth = e.date.startsWith(budget.month);

                                            // If the budget category is "all", include everything for that month
                                            if (budget.category.toLowerCase() === "all") {
                                                return isSameMonth;
                                            }

                                            // Otherwise, match the specific category
                                            return isSameMonth && e.category.toLowerCase() === budget.category.toLowerCase();
                                        })
                                        .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
                                    const isOverBudget = spent > budget.limitAmount;
                                    return (
                                        <div key={budget._id} className="p-4 border rounded-lg flex justify-between items-center">
                                            <div>
                                                <p className="font-bold text-lg capitalize">{budget.category}</p>
                                                <p className="text-sm text-muted-foreground">{budget.month}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className={`font-bold ${isOverBudget ? 'text-red-500' : 'text-green-500'}`}>
                                                    ${spent.toFixed(2)} / ${budget.limitAmount.toFixed(2)}
                                                </p>
                                                {isOverBudget && <p className="text-xs text-red-500 mt-1">Over budget!</p>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* 3. RECENT EXPENSES */}
                <Card>
                    <CardHeader><CardTitle>Recent Expenses</CardTitle></CardHeader>
                    <CardContent>
                        {expenses === undefined ? (
                            <p className="text-muted-foreground">Loading expenses...</p>
                        ) : expenses.length === 0 ? (
                            <p className="text-muted-foreground">No expenses added yet.</p>
                        ) : (
                            <div className="space-y-4">
                                {expenses.map((expense) => (
                                    <div key={expense._id} className="flex justify-between items-center p-4 border rounded-lg">
                                        <div>
                                            <p className="font-bold capitalize">{expense.category}</p>
                                            <p className="text-sm text-muted-foreground">{expense.date} • {expense.paymentMethod}</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <p className="font-bold text-lg">${expense.amount.toFixed(2)}</p>
                                            <Button variant="destructive" size="sm" onClick={() => deleteExpense({ id: expense._id as Id<"expenses"> })}>Delete</Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

            </div>
        </div>
    </div>
);
}