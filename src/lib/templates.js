export const templates = [
    {
        id: 'summary',
        name: 'Summary',
        description: 'Get a concise overview of the main points.',
        structure: [
            'Executive Summary',
            'Key Takeaways (Bulleted list)',
            'Conclusion'
        ],
        systemPrompt: 'Summarize the provided content. Focus on capturing the main arguments and conclusions. be concise.'
    },
    {
        id: 'study-guide',
        name: 'Study Guide',
        description: 'Create a study aid with definitions and questions.',
        structure: [
            'Topic Overview',
            'Key Terms & Definitions',
            'Practice Questions (with answers)'
        ],
        systemPrompt: 'You are a tutor. Create a study guide based on the material. define key terms and generate practice questions to test understanding.'
    },
    {
        id: 'briefing',
        name: 'Briefing Doc',
        description: 'A formal document for quick updates.',
        structure: [
            'Situation',
            'Background',
            'Assessment',
            'Recommendation'
        ],
        systemPrompt: 'Create a formal briefing document (SBAR format) based on the information provided.'
    },
    {
        id: 'faq',
        name: 'FAQ',
        description: 'Frequently Asked Questions generated from the text.',
        structure: [
            'List of 5-10 Questions and Answers'
        ],
        systemPrompt: 'Generate a list of frequently asked questions that can be answered by the text, and provide the answers.'
    },
    {
        id: 'critique',
        name: 'Critique',
        description: 'Analyze the strengths and weaknesses.',
        structure: [
            'Strengths',
            'Weaknesses',
            'Missing Perspectives',
            'Final Verdict'
        ],
        systemPrompt: 'Critically analyze the provided text. Identify its strong points and areas where it lacks evidence or clarity.'
    }
];
