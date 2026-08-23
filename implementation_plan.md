# Implementation Plan for BookMyDoc RAG Assistant

Based on my inspection of the existing codebase and the provided `BookMyDoc` project documentation, here is the assessment and implementation plan for building the Phase 1 and Phase 2 backend functionality. 

## 1. What is already implemented
- **Nothing substantive.** The `Backend` directory only contains a boilerplate `package.json` with no dependencies, and a `server.js` file with a single `console.log("hello world")` statement. 

## 2. What is partially implemented
- **None.** The project is effectively a blank slate on the backend.

## 3. What is missing
- Everything required for the Phase 1 (RAG) and Phase 2 (Conversation) features:
  - Express server setup & routing
  - MongoDB connection setup
  - Mongoose models (`Conversation`, `KnowledgeBase`, `Doctor`)
  - AI/LLM integration for structured extraction and natural language generation
  - Embedding pipeline and Vector Search implementation
  - Business logic services (extraction, conversation merging, RAG retrieval)

## 4. What files need to be created
We need a clean service-oriented architecture:
- `Backend/config/db.js` (MongoDB connection)
- `Backend/models/Conversation.js` (Persistent state for interactions)
- `Backend/models/KnowledgeBase.js` (Medical mapping rules & descriptions)
- `Backend/models/Doctor.js` (Basic schema for future testing)
- `Backend/services/embeddingService.js` (Generates text embeddings)
- `Backend/services/vectorSearchService.js` (Queries the vector DB)
- `Backend/services/ragService.js` (Orchestrates Knowledge Base retrieval)
- `Backend/services/llmService.js` (LLM calls for structured extraction & response generation)
- `Backend/services/extractionService.js` (Extracts slots from user input)
- `Backend/services/conversationService.js` (State management and merging)
- `Backend/controllers/ragController.js` (Handles `/api/rag/chat` endpoint)
- `Backend/routes/ragRoutes.js` (Express routing)
- `Backend/scripts/seedKnowledgeBase.js` (Utility to populate the DB for testing)
- `Backend/.env` (Environment variables)

## 5. What existing files need to be modified
- `Backend/package.json`: To include necessary dependencies and update the startup script.
- `Backend/server.js`: To bootstrap the Express application, connect to MongoDB, load middleware, and mount the API routes.

## 6. What dependencies need to be installed
- `express`: Web framework
- `mongoose`: MongoDB object modeling
- `dotenv`: Environment variable management
- `@google/genai` (or `openai`): LLM and embedding SDK (since you are using Gemini 3.1 Pro, we'll use the new Google Gen AI SDK)
- `cors`: For future frontend communication
- `express-json`: (built into Express, for body parsing)

## 7. What MongoDB schema changes are required
- **New `Conversation` Model**:
  ```json
  {
    "userId": "String (optional for now)",
    "intent": "String",
    "slots": {
      "symptom": "String",
      "specialty": "String",
      "date": "String",
      "time": "String",
      "doctorId": "ObjectId"
    },
    "messages": [{ "role": "String", "content": "String", "timestamp": "Date" }],
    "status": "String"
  }
  ```
- **Modified `KnowledgeBase` Model**:
  Must include an `embedding` field (an Array of Numbers) to store the vector representations of the text content/keywords for semantic search.

## 8. Recommended Vector Search Solution & Why
**Recommendation: MongoDB Atlas Vector Search**
*Why?* The project is already utilizing MongoDB and Mongoose for standard data modeling (Users, Doctors, Appointments). Introducing a separate vector database (like Pinecone or Weaviate) would add unnecessary infrastructure complexity and network overhead. MongoDB Atlas supports native Vector Search through the `$vectorSearch` aggregation pipeline stage. This allows us to keep the Knowledge Base documents and their embeddings in the same database and seamlessly query them using Mongoose. It serves a real purpose for semantic retrieval without over-engineering the portfolio project.

## 9. The Exact Execution Flow
1. **Request:** User sends `POST /api/rag/chat` with an optional `conversationId` and a `message`.
2. **State Management:** Backend loads the existing `Conversation` (or creates a new one if missing).
3. **Extraction Phase:** The `message` and current conversation context are sent to the LLM to extract a structured JSON representation (intent, symptom, date, time).
4. **State Merge:** The extracted data is intelligently merged into the `Conversation` slots without overwriting existing non-null data with nulls.
5. **RAG Retrieval:** If a `symptom` is present but `specialty` is null, the backend generates an embedding for the symptom and uses `$vectorSearch` on the `KnowledgeBase` to determine the specialty.
6. **Missing Field Evaluation:** The system evaluates the updated conversation state to identify missing requirements (e.g., if specialty is found, but date and time are missing).
7. **Response Generation:** 
   - If fields are missing: The LLM generates a single grouped follow-up question (e.g., "What date and time would you prefer?").
   - If all required slots are present (Specialty, Date, Time): The flow prepares for Doctor Retrieval.
8. **Persistence:** The `Conversation` is saved to MongoDB.
9. **Response:** The API returns the `conversationId`, AI `message`, and the updated `state`.

## 10. Step-by-Step Implementation Order
1. **Initialize Project & Env:** Install all NPM dependencies, set up `.env` with DB URIs and API keys, and configure `server.js` and `db.js`.
2. **Data Models:** Define Mongoose schemas for `Conversation`, `KnowledgeBase`, and a stub `Doctor` model.
3. **LLM & Embeddings Foundation:** Build `llmService.js` and `embeddingService.js` to ensure we can successfully call the Gemini API for text generation and embeddings.
4. **Knowledge Base Seed:** Create a quick `seedKnowledgeBase.js` script to ingest the medical mapping rules (from the PDF) into MongoDB, chunk them, generate embeddings, and save them.
5. **RAG Integration:** Build `vectorSearchService.js` and `ragService.js` to execute semantic searches against the Knowledge Base collection.
6. **Conversational AI Logic:** Implement `extractionService.js` to enforce strict JSON output from the LLM, and `conversationService.js` to handle the smart merging of slots and determination of missing fields.
7. **API Layer:** Wire up `ragController.js` and `ragRoutes.js` and mount them in `server.js`.
8. **End-to-End Testing:** Validate the 4 test scenarios outlined in the prompt using Postman/curl, ensuring no unnecessary follow-up questions are asked and state is preserved correctly.

---

> [!IMPORTANT]
> **User Review Required**
> Please review this plan. If you agree with the structure, dependencies (especially the use of MongoDB Atlas Vector Search and Gemini), and implementation order, provide your approval so I can begin generating the backend code and scaffolding the project structure.
