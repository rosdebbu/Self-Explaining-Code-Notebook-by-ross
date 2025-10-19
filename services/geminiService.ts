import { GoogleGenAI, Type } from "@google/genai";
import type { DataFrame, ExplanationResponse, CodeExplanationPart, QuizFeedback, UseCase } from '../types';
import { SAMPLE_DATAFRAME } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        overallExplanation: {
            type: Type.STRING,
            description: "A high-level summary of what the pandas operation does."
        },
        steps: {
            type: Type.ARRAY,
            description: "An array of objects, where each object represents a single, animatable step of the operation.",
            items: {
                type: Type.OBJECT,
                properties: {
                    title: {
                        type: Type.STRING,
                        description: "A short, descriptive title for this step (e.g., 'Initial State', 'Grouping Rows')."
                    },
                    explanation: {
                        type: Type.STRING,
                        description: "A sentence explaining what is happening to the data in this specific step."
                    },
                    data: {
                        type: Type.OBJECT,
                        description: "The state of the DataFrame at the end of this step.",
                        properties: {
                            columns: {
                                type: Type.ARRAY,
                                items: { type: Type.STRING }
                            },
                            rows: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.ARRAY,
                                    items: {
                                        type: Type.STRING,
                                        description: "A single cell value, converted to a string."
                                    }
                                }
                            }
                        }
                    },
                    groups: {
                        type: Type.ARRAY,
                        description: "Optional. For grouping steps, this array contains objects, where each object represents a group. This is crucial for visualization.",
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                key: { type: Type.STRING, description: "The name of the group (e.g., 'A')." },
                                indices: {
                                    type: Type.ARRAY,
                                    description: "An array of original 0-based row indices belonging to this group.",
                                    items: { type: Type.NUMBER }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
};

const codeExplanationSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            segment: { type: Type.STRING, description: "A small, logical piece of the code (e.g., 'df', '.groupby()', \"('Category')\")." },
            explanation: { type: Type.STRING, description: "A technical explanation of what the code segment does." },
            purpose: { type: Type.STRING, description: "The high-level goal or 'why' of this code segment in the overall operation." }
        },
        required: ["segment", "explanation", "purpose"]
    }
};

const quizFeedbackSchema = {
    type: Type.OBJECT,
    properties: {
        isCorrect: {
            type: Type.BOOLEAN,
            description: "A boolean indicating whether the user's answer is correct."
        },
        explanation: {
            type: Type.STRING,
            description: "A friendly and constructive explanation of why the answer is correct or incorrect. Provide the right answer if the user was wrong."
        }
    },
    required: ["isCorrect", "explanation"]
};

const useCasesSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING, description: "A short, catchy title for the use case scenario." },
            description: { type: Type.STRING, description: "A 2-3 sentence paragraph explaining the context, data, and question the code answers." },
            icon: { type: Type.STRING, description: "The most fitting icon name from the provided list." }
        },
        required: ["title", "description", "icon"]
    }
};

export async function generateExplanation(code: string): Promise<ExplanationResponse> {
    const prompt = `
You are a data science assistant that explains Python pandas and numpy operations in a step-by-step, visual manner.
Given a Python code snippet and a sample DataFrame, break down the operation into distinct, animatable steps.

Your output MUST be a valid JSON object that adheres to the provided schema. The steps should logically progress from the initial state to the final result.
In all 'data' objects, ensure every value inside the 'rows' array is a string, even numbers.

For a 'groupby' operation, the steps should be:
1.  **Initial State**: The original DataFrame.
2.  **Grouping**: The DataFrame, logically reordered to show rows clustered by the group key. For this step, crucially, you MUST populate the 'groups' field in the JSON response. The 'groups' field should be an array of objects. Each object must have a 'key' (the category name) and an 'indices' (an array of the original 0-based row indices belonging to that group). For example: [ { "key": "A", "indices": [0, 2, 5] }, { "key": "B", "indices": [1, 4] }, { "key": "C", "indices": [3] } ]. The 'data' for this step should show the rows re-sorted according to these groups.
3.  **Aggregation**: Show the intermediate result where each group is being aggregated (e.g., calculating the mean). The data should reflect this, perhaps showing one row per group with the calculated value.
4.  **Final Result**: The final, aggregated DataFrame as pandas would output it, with the group key as the new index.

Here is the Python code:
\`\`\`python
${code}
\`\`\`

Here is the sample DataFrame in JSON format:
\`\`\`json
${JSON.stringify(SAMPLE_DATAFRAME, null, 2)}
\`\`\`

Generate the JSON output for this operation.
`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            },
        });
        
        const jsonText = response.text.trim();
        const parsedJson = JSON.parse(jsonText);
        
        // Basic validation
        if (!parsedJson.overallExplanation || !Array.isArray(parsedJson.steps) || parsedJson.steps.length === 0) {
            throw new Error("Invalid JSON structure received from API.");
        }

        return parsedJson as ExplanationResponse;

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Failed to generate explanation from Gemini API. Check console for details.");
    }
}


export async function generateCodeExplanation(code: string): Promise<CodeExplanationPart[]> {
    const prompt = `
You are an expert data science instructor who explains Python code to beginners, focusing on the pandas and numpy libraries.
Your task is to break down the provided Python code snippet into its logical components and explain each one in a simple, clear manner.

The code is: \`\`\`python
${code}
\`\`\`

For the code \`df.groupby('Category')['Value'].agg(np.mean)\`, the breakdown should include segments for any imports (like \`import numpy as np\`), 'df', '.groupby()', "('Category')", "['Value']", '.agg()', and 'np.mean'.
Provide a final 'Full Expression' segment for a plain-English summary.

Return a valid JSON array of objects that adheres to the provided schema. Each object must have a "segment", "explanation", and "purpose" field.
`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: codeExplanationSchema,
            },
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as CodeExplanationPart[];
    } catch (error) {
        console.error("Error calling Gemini API for code explanation:", error);
        throw new Error("Failed to generate code explanation from Gemini API.");
    }
}


export async function generateConceptExplanation(topic: string): Promise<string> {
    const prompt = `
You are a helpful data science instructor.
Explain the following Python pandas or numpy concept to a beginner.

- Keep the explanation concise and clear (2-3 paragraphs).
- Start with a simple, one-sentence definition.
- Use an analogy if it helps.
- Provide a single, easy-to-understand, one-line code example.
- Do NOT use complex jargon.
- Format the output as plain text with newlines.

Concept: "${topic}"
`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });
        
        return response.text;
    } catch (error) {
        console.error("Error calling Gemini API for concept explanation:", error);
        throw new Error("Failed to generate concept explanation from Gemini API.");
    }
}

export async function generateQuizQuestion(code: string): Promise<string> {
    const prompt = `
You are an AI Tutor for a data science learning application.
Based on the following Python code (using pandas/numpy), generate a single, clear, multiple-choice or short-answer question to test a beginner's understanding of a core concept in the code.

The code is: \`\`\`python
${code}
\`\`\`

Examples of good questions:
- "In the code provided, what is the main purpose of the .groupby() method?"
- "If you replaced .agg(np.mean) with .sum(), what would the operation calculate instead?"
- "Which part of the code selects the specific column to perform the calculation on?"
- "What does 'np' refer to in the code?"

Keep the question text-only. Do not return JSON.
`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating quiz question:", error);
        throw new Error("Failed to generate quiz question.");
    }
}

export async function evaluateAnswer(question: string, answer: string): Promise<QuizFeedback> {
    const prompt = `
You are an AI Tutor evaluating a student's answer to a question about Python data science code (pandas/numpy).
Be encouraging and provide clear, helpful feedback.

The question was: "${question}"
The student's answer is: "${answer}"

Your task is to:
1. Determine if the student's answer is conceptually correct.
2. Provide a brief explanation for why the answer is correct or incorrect.
3. If the answer is incorrect, gently provide the correct answer or concept.

Return a valid JSON object that adheres to the provided schema.
`;
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: quizFeedbackSchema,
            },
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as QuizFeedback;
    } catch (error) {
        console.error("Error evaluating answer:", error);
        throw new Error("Failed to evaluate the answer.");
    }
}

export async function generateUseCases(code: string): Promise<UseCase[]> {
    const prompt = `
You are a creative data science evangelist who explains the practical applications of code.
For the given Python (pandas/numpy) code snippet, generate 3 distinct, real-world use cases.
Each use case should be relatable to a beginner and clearly explain a scenario where this exact code would be useful.

- **title:** A short, catchy title for the scenario (e.g., "E-commerce Sales Analysis").
- **description:** A 2-3 sentence paragraph explaining the context, the data, and the question the code answers.
- **icon:** Choose the most fitting icon name from this list: 'shopping-cart', 'finance', 'health', 'gaming', 'science', 'social'.

The code is: \`\`\`python
${code}
\`\`\`

Return a valid JSON array of objects that adheres to the provided schema.
`;
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: useCasesSchema,
            },
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as UseCase[];
    } catch (error) {
        console.error("Error generating use cases:", error);
        throw new Error("Failed to generate use cases from the API.");
    }
}