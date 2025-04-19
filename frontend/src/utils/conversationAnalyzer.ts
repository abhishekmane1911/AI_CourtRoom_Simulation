/**
 * Utility functions to analyze trial conversation exports
 */

interface ConversationTurn {
  turn: number;
  role: string;
  role_name: string;
  prompt: string;
  response: string;
  timestamp: string | Date;
}

interface ConversationExport {
  case_name: string;
  timestamp: string;
  conversation: ConversationTurn[];
  metadata: {
    total_turns: number;
    roles_involved: string[];
    export_date: string;
  };
}

/**
 * Analyzes a conversation export for basic metrics
 */
export function analyzeConversation(data: ConversationExport) {
  // Basic statistics
  const totalTurns = data.conversation.length;
  const roleDistribution = data.conversation.reduce((acc: Record<string, number>, turn) => {
    acc[turn.role] = (acc[turn.role] || 0) + 1;
    return acc;
  }, {});
  
  // Calculate average response length
  const avgResponseLength = data.conversation.reduce((sum, turn) => 
    sum + turn.response.length, 0) / totalTurns;
  
  // Calculate average prompt length
  const avgPromptLength = data.conversation.reduce((sum, turn) => 
    sum + turn.prompt.length, 0) / totalTurns;
  
  // Find legal terminology usage
  const legalTerms = [
    "objection", "sustained", "overruled", "evidence", "testimony", 
    "witness", "exhibit", "verdict", "ruling", "court", "judge", 
    "prosecution", "defense", "plaintiff", "defendant", "counsel",
    "attorney", "law", "legal", "statute", "precedent", "case law"
  ];
  
  const legalTermCounts = legalTerms.reduce((acc: Record<string, number>, term) => {
    const regex = new RegExp(`\\b${term}\\b`, 'gi');
    const count = data.conversation.reduce((sum, turn) => {
      const promptMatches = (turn.prompt.match(regex) || []).length;
      const responseMatches = (turn.response.match(regex) || []).length;
      return sum + promptMatches + responseMatches;
    }, 0);
    
    if (count > 0) {
      acc[term] = count;
    }
    return acc;
  }, {});
  
  // Check for role consistency
  const roleConsistency = data.conversation.reduce((acc: Record<string, boolean>, turn) => {
    // Check if the response contains phrases that would be inappropriate for the role
    const isConsistent = true; // This is simplified - you'd want more sophisticated checks
    acc[`${turn.turn}-${turn.role}`] = isConsistent;
    return acc;
  }, {});
  
  return {
    case_name: data.case_name,
    total_turns: totalTurns,
    role_distribution: roleDistribution,
    avg_response_length: avgResponseLength,
    avg_prompt_length: avgPromptLength,
    legal_term_usage: legalTermCounts,
    role_consistency: roleConsistency,
    analysis_timestamp: new Date().toISOString()
  };
}

/**
 * Loads a conversation export from a file
 */
export function loadConversationFile(file: File): Promise<ConversationExport> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        resolve(data);
      } catch (error) {
        reject(new Error('Failed to parse JSON file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}