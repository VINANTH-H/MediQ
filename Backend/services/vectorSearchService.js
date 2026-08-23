import KnowledgeBase from '../models/KnowledgeBase.js';

const searchKnowledgeBase = async (queryVector) => {
    try {
        // MongoDB Atlas Vector Search requires an aggregation pipeline with $vectorSearch
        const results = await KnowledgeBase.aggregate([
            {
                $vectorSearch: {
                    index: 'vector_index', // This must match the index name configured in MongoDB Atlas
                    path: 'embedding',
                    queryVector: queryVector,
                    numCandidates: 10,
                    limit: 1
                }
            },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    category: 1,
                    content: 1,
                    score: { $meta: 'vectorSearchScore' }
                }
            }
        ]);
        return results.length > 0 ? results[0] : null;
    } catch (error) {
        console.error('Vector search error:', error);
        return null;
    }
};

export { searchKnowledgeBase };
