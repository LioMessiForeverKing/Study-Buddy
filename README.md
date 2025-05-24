# StudyBuddy - AI-Powered Learning Assistant

StudyBuddy is an intelligent learning platform designed to transform education through personalized AI tutoring, interactive tools, and adaptive learning experiences. By combining cutting-edge AI technology with proven educational methodologies, StudyBuddy empowers students to learn at their own pace, stay organized, and remain engaged.

## Key Features

- **Personalized AI Tutoring**: Leverage Google's Gemini AI to create customized learning experiences based on individual learning styles
- **Interactive Smart Workspace**: Sketch ideas and solve problems with real-time AI feedback and suggestions
- **Learning Analytics Dashboard**: Track progress with detailed insights and visualizations of learning patterns
- **Yubi Companion**: Your personal AI study buddy that adapts to your learning style and provides motivational support
- **Multi-modal Learning**: Combine text, drawings, and voice inputs for comprehensive understanding
- **Spaced Repetition System**: Optimized review schedules based on cognitive science principles
- **Knowledge Graph Visualization**: See connections between concepts to enhance understanding
- **Collaborative Learning Spaces**: Work with peers on shared notes and problems

## Why StudyBuddy?

StudyBuddy democratizes knowledge by providing personalized education regardless of a student's background, learning style, or resources. Our platform transforms studying from a chore into an engaging, gamified experience that students actually look forward to.

> "StudyBuddy represents the future of personalized education. By combining AI with proven learning methodologies, it creates a truly adaptive experience that meets students where they are. This is exactly the kind of innovation we need to transform education."
> 
> — Wennie, Senior Product Manager at Google

> "The learning analytics implementation in StudyBuddy is impressive. The way it tracks and visualizes student progress while providing actionable insights demonstrates a deep understanding of both data science and educational psychology. This could revolutionize how we approach personalized learning."
> 
> — Frank Yoon, Senior Data Scientist at Google

## Technical Architecture

### Frontend
- **Next.js 14**: Utilizing the App Router for optimized server-side rendering and client-side navigation
- **React**: Component-based UI with hooks for state management
- **TypeScript**: Static typing for enhanced code quality and developer experience
- **TailwindCSS**: Utility-first CSS framework for responsive design
- **Framer Motion**: Advanced animations for an engaging user experience

### Backend Infrastructure
- **Supabase**: Provides a comprehensive backend solution with:
  - PostgreSQL database with Row-Level Security (RLS) for fine-grained access control
  - Real-time subscriptions using WebSockets for collaborative features
  - Authentication with multiple providers and PKCE flow for enhanced security
  - Storage for user-generated content with secure access policies
  - Edge Functions for serverless computing
  - Vector embeddings for semantic search capabilities

### AI Integration
- **Google Gemini API**: Powers our advanced AI tutoring capabilities
- **Custom Prompt Engineering**: Sophisticated prompt templates optimized for educational contexts
- **Context-aware AI**: Maintains conversation history and adapts to user's learning style
- **Multi-modal Understanding**: Processes and generates text, images, and mathematical content

### Data Architecture
- **Relational Schema**: Optimized database design for educational content and user interactions
- **Vector Embeddings**: For semantic search and content recommendations
- **Real-time Sync**: Changes propagate instantly across devices using Supabase Realtime
- **Efficient Storage**: Binary data compression for drawings and multimedia content

### Advanced Features
- **Interactive Drawing Board**: Canvas-based interface with real-time AI analysis
- **Spaced Repetition Algorithm**: Custom implementation based on the SuperMemo SM-2 algorithm
- **Learning Style Assessment**: Adaptive questionnaires to determine optimal teaching methods
- **Knowledge Graph Generation**: Automatic extraction of concept relationships from notes
- **Middleware Authentication**: Secure route protection with server-side session validation
- **Offline Capability**: Progressive Web App features for studying without internet connection

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (see `.env.example`)
   - Supabase URL and anon key
   - Google Gemini API key
   - Storage configuration
4. Run the development server: `npm run dev`
5. Access the application at `http://localhost:3000`

## Contributing

We welcome contributions! Please see our [Contribution Guidelines](CONTRIBUTING.md) for more information.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
