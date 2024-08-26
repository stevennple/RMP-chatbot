# Chat System Architecture

Our AI chatbot application is built with a full-stack architecture, incorporating an intuitive frontend and an advanced backend API.

## Frontend: Chat Component

The Chat component, located in `app/components/chat.tsx`, includes the following features:

- **Real-time AI chat**
- **Conversation history display**
- **Auto-scrolling chat window**
- **Voice input**
- **PDF uploads**
- **Conversation summaries**
- **RateMyProfessors link detection and summaries**
- **Persistent chat sessions**

## Backend: AI-Powered Chat API

The backend API, defined in `app/api/chat/route.ts`, leverages several advanced technologies:

- **LangChain Framework**
- **OpenAI GPT-4**
- **Pinecone Vector Store**
- **Dynamic Context Retrieval**
- **Prompt Engineering**
- **Streaming Responses**
- **Error Handling**

### Key Technical Features

- **Asynchronous processing**
- **AI integration (ChatOpenAI, PromptTemplate)**
- **RunnableSequence pipeline**
- **Chunk-based response streaming**

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/username/project-name.git
   ```
2. Navigate to the project directory:
   ```bash
   cd project-name
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Set up environment variables:
   ```bash
   cp .env.example .env
   # Update .env with your settings
   ```
5. Run the development server:
   ```bash
   npm run dev
   ```
6. **NOTE: Base Context File**: Upon spinning up the app on localhost, you will need to input a file that the chatbot will use as the base context. Otherwise, errors might be expect due to missing context.

## Contributing

To contribute:

1. **Fork the Repository**: Fork the project on GitHub.
2. **Clone the Fork**: Clone your fork locally.
   ```bash
   git clone https://github.com/your-username/project-name.git
   ```
3. **Create a Branch**: Create a branch for your changes.
   ```bash
   git checkout -b feature-branch
   ```
4. **Make Changes**: Implement your changes.
5. **Fetch and Merge Upstream Changes**: If necessary, sync with the latest upstream changes.
   ```bash
   git fetch upstream
   git merge upstream/main
   ```
6. **Push Changes**: Push your changes to your fork.
   ```bash
   git push origin feature-branch
   ```
7. **Create a Pull Request**:
   - Go to the main repository on GitHub.
   - Navigate to the "Pull Requests" tab.
   - Click "New Pull Request."
   - Choose your fork and branch as the source, and the main repository's branch as the target.
   - Add a clear description of your changes, then submit the pull request.