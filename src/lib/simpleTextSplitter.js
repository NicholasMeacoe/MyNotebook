export class SimpleTextSplitter {
    constructor(options = {}) {
        this.chunkSize = options.chunkSize || 1000;
        this.chunkOverlap = options.chunkOverlap || 200;
    }

    async splitText(text) {
        if (!text) return [];

        const chunks = [];
        let start = 0;

        while (start < text.length) {
            const end = Math.min(start + this.chunkSize, text.length);
            const chunk = text.slice(start, end);
            chunks.push(chunk);

            if (end === text.length) break;

            start += (this.chunkSize - this.chunkOverlap);
        }

        return chunks;
    }
}
