function cosineSimilarity(a, b) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < a.length; i++) {
        dotProduct += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export class SimpleVectorStore {
    constructor(embeddings) {
        this.embeddings = embeddings;
        this.documents = []; // { pageContent, metadata, embedding }
    }

    async addDocuments(docs) {
        const texts = docs.map(d => d.pageContent);
        const embeddings = await this.embeddings.embedDocuments(texts);

        for (let i = 0; i < docs.length; i++) {
            this.documents.push({
                pageContent: docs[i].pageContent,
                metadata: docs[i].metadata,
                embedding: embeddings[i]
            });
        }
    }

    async similaritySearch(query, k = 4) {
        const queryEmbedding = await this.embeddings.embedQuery(query);

        const scores = this.documents.map(doc => ({
            doc,
            score: cosineSimilarity(queryEmbedding, doc.embedding)
        }));

        // Sort by score descending
        scores.sort((a, b) => b.score - a.score);

        return scores.slice(0, k).map(s => s.doc);
    }

    static async fromDocuments(docs, embeddings) {
        const store = new SimpleVectorStore(embeddings);
        await store.addDocuments(docs);
        return store;
    }
}
