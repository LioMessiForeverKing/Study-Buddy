// Add to existing interfaces
interface YubiStats {
  // ... existing properties ...
  personalization?: {
    learningStyle: string
    interests: string[]
    communicationStyle: string
    motivationType: string
    customPrompts: {
      question: string
      response: string
    }[]
  }
}

// In the component, modify the getYubiMood function to consider personalization
const getYubiResponse = (message: string) => {
  const personalization = stats?.personalization

  // Check for custom prompts first
  const customPrompt = personalization?.customPrompts.find(
    p => message.toLowerCase().includes(p.question.toLowerCase())
  )
  if (customPrompt) return customPrompt.response

  // Otherwise generate contextual response based on personalization
  const style = personalization?.communicationStyle || 'Encouraging & Supportive'
  const interests = personalization?.interests || []
  
  // Add personality to responses based on communication style
  switch (style) {
    case 'Encouraging & Supportive':
      return `You're doing great! Let's keep learning about ${interests[0] || 'this topic'}! 💪`
    case 'Direct & Concise':
      return `Focus on the key concepts. Ready to continue?`
    case 'Humorous & Playful':
      return `Hey there! Did you hear about the math book that was sad? It had too many problems! 😄`
    case 'Socratic & Questioning':
      return `What aspects of ${interests[0] || 'this topic'} interest you the most? Let's explore deeper!`
    default:
      return `Let's keep learning together!`
  }
}