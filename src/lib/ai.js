import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { SimpleVectorStore } from "./simpleVectorStore";
import { SimpleTextSplitter } from "./simpleTextSplitter";
import { Document } from "@langchain/core/documents";
import { TaskType } from "@google/generative-ai";

class AIService {
    constructor() {
        this.vectorStore = null;
        this.apiKey = localStorage.getItem('gemini_api_key') || '';
        this.model = null;
        this.embeddings = null;
    }

    setApiKey(key) {
        this.apiKey = key;
        localStorage.setItem('gemini_api_key', key);
        this.initModels();
    }

    initModels() {
        if (!this.apiKey) return;

        this.model = new ChatGoogleGenerativeAI({
            apiKey: this.apiKey,
            modelName: "gemini-pro",
            maxOutputTokens: 2048,
        });

        this.embeddings = new GoogleGenerativeAIEmbeddings({
            apiKey: this.apiKey,
            modelName: "embedding-001",
            taskType: TaskType.RETRIEVAL_DOCUMENT,
        });
    }

    async processDocuments(sources) {
        if (!this.embeddings) throw new Error("API Key not set");

        const docs = [];
        // Use our simple splitter
        const splitter = new SimpleTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 200,
        });

        for (const source of sources) {
            const chunks = await splitter.splitText(source.content);
            chunks.forEach((chunk, i) => {
                docs.push(new Document({
                    pageContent: chunk,
                    metadata: { sourceId: source.id, sourceName: source.name, chunkIndex: i }
                }));
            });
        }

        // Create vector store from documents
        this.vectorStore = await SimpleVectorStore.fromDocuments(
            docs,
            this.embeddings
        );
    }

    async generateResponse(template, sources, query = "") {
        if (!this.model || !this.vectorStore) throw new Error("AI Service not initialized or documents not processed");

        const searchContext = query || template.name;
        const relevantDocs = await this.vectorStore.similaritySearch(searchContext, 10);
        const contextText = relevantDocs.map(d => d.pageContent).join("\n\n---\n\n");

        const prompt = `
      You are an intelligent assistant. Use the following context documents to generate a "${template.name}".
      
      Structure:
      ${JSON.stringify(template.structure)}
      
      Instructions:
      ${template.systemPrompt}
      
      Context:
      ${contextText}
      
      Response:
    `;

        const response = await this.model.invoke(prompt);
        return response.content;
    }
}

export const aiService = new AIService();
