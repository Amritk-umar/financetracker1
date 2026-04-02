import type { Doc } from "@/convex/_generated/dataModel";

export async function getFinancialAdvice(expenses: Doc<"expenses">[]) {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) return "API Key not found.";

    // Summarize data for the AI
    const summary = expenses.map(e => `${e.category}: $${e.amount}`).join(", ");

    const prompt = `Act as a professional financial advisor. Here is a list of my recent expenses: ${summary}. 
  Give me a 2-sentence piece of advice on how to save money or manage these specific spending habits. Be concise and encouraging.`;

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            }
        );

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    } catch {
        return "Could not generate advice at this time.";
    }
}