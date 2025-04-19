// Trial.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchCaseLogs, sendAgentMessage } from '../api';

const roleColors: { [key: string]: string } = {
  judge: '#8e44ad',
  prosecution: '#c0392b',
  defense: '#2980b9',
  plaintiff: '#d35400',
  defendant: '#16a085'
};

const roleNames: { [key: string]: string } = {
  judge: 'Judge Taylor Morgan',
  prosecution: 'Prosecutor Jordan Blake',
  defense: 'Defense Attorney Alex Carter',
  plaintiff: 'Plaintiff',
  defendant: 'Defendant'
};

// Define the order of roles for automatic conversation
const roleOrder: string[] = ['judge', 'prosecution', 'defense', 'plaintiff', 'defendant'];



// Add this function after your component definition but before export
function downloadJson(data: any, filename: string) {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

const Trial: React.FC = () => {
  // Add navigate to your existing hooks
  const navigate = useNavigate();
  const { caseName } = useParams<{ caseName: string }>();
  
  // Rest of your existing state variables
  
  // Add this function to export the conversation
  const exportConversation = () => {
    if (messages.length === 0) {
      alert('No conversation to export');
      return;
    }
    
    // Format the data for analysis
    const conversationData = {
      case_name: caseName,
      timestamp: new Date().toISOString(),
      conversation: messages.map((msg, index) => ({
        turn: index + 1,
        role: msg.role,
        role_name: roleNames[msg.role] || msg.role,
        prompt: msg.content,
        response: msg.response,
        timestamp: msg.timestamp
      })),
      metadata: {
        total_turns: messages.length,
        roles_involved: [...new Set(messages.map(msg => msg.role))],
        export_date: new Date().toISOString()
      }
    };
    
    // Download as JSON
    downloadJson(conversationData, `${caseName?.replace(/\s+/g, '_')}_trial_export_${new Date().toISOString().slice(0,10)}.json`);
  };
  const [messages, setMessages] = useState<{ role: string, content: string, response: string, timestamp: Date }[]>([]);
  const [currentMessage, setCurrentMessage] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('judge');
  const [loading, setLoading] = useState<boolean>(false);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [autoMode, setAutoMode] = useState<boolean>(false);
  const [autoDelay, setAutoDelay] = useState<number>(5000); // 5 seconds delay between messages
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const autoModeRef = useRef<boolean>(false);

  // Update ref when state changes
  useEffect(() => {
    autoModeRef.current = autoMode;
  }, [autoMode]);

  useEffect(() => {
    fetchMessages();
  }, [caseName]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      setInitialLoading(true);
      const logs = await fetchCaseLogs(caseName || 'Untitled Case');
      const formattedMessages = logs.map((log: any) => ({
        role: log.role,
        content: log.message,
        response: log.response,
        timestamp: new Date(log.timestamp)
      }));
      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (role: string, message: string) => {
    if (!message.trim()) return;
    
    setLoading(true);
    
    try {
      const history = messages.flatMap((msg) => [
        { role: 'user', content: msg.content },
        { role: 'assistant', content: msg.response }
      ]);
      
      const response = await sendAgentMessage({
        role: role,
        message: message,
        history: history,
        case: caseName || 'Untitled Case'
      });
      
      const newMessage = {
        role: role,
        content: message,
        response: response.reply,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, newMessage]);
      setCurrentMessage('');
      
      // Continue auto mode if enabled
      if (autoModeRef.current) {
        setTimeout(() => {
          if (autoModeRef.current) {
            continueConversation(newMessage);
          }
        }, autoDelay);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
      setAutoMode(false);
    } finally {
      setLoading(false);
    }
  };

  // Function to determine the next role in the conversation
  const getNextRole = (currentRole: string) => {
    const currentIndex = roleOrder.indexOf(currentRole);
    if (currentIndex === -1) return roleOrder[0];
    return roleOrder[(currentIndex + 1) % roleOrder.length];
  };

  // Function to generate a prompt for the next role based on the conversation context
  const generatePromptForRole = (role: string, lastMessage: any) => {
    const prompts: { [key: string]: string } = {
      judge: `Based on the previous statements, provide your ruling or ask clarifying questions as the judge.`,
      prosecution: `Respond to the previous statements as the prosecutor. Present your arguments or question the defense/witnesses.`,
      defense: `Respond to the previous statements as the defense attorney. Counter the prosecution's arguments or present your own.`,
      plaintiff: `As the plaintiff, respond to the previous statements. Provide your testimony or answer questions.`,
      defendant: `As the defendant, respond to the previous statements. Provide your testimony or answer questions.`
    };
    
    return prompts[role] || `Continue the conversation as ${roleNames[role]}.`;
  };

  // Function to continue the conversation automatically
  const continueConversation = (lastMessage: any) => {
    if (!autoModeRef.current) return;
    
    const nextRole = getNextRole(lastMessage.role);
    const prompt = generatePromptForRole(nextRole, lastMessage);
    
    setSelectedRole(nextRole);
    handleSendMessage(nextRole, prompt);
  };

  // Function to start auto mode
  const startAutoMode = () => {
    if (messages.length === 0) {
      // If no messages, start with judge's opening statement
      setAutoMode(true);
      handleSendMessage('judge', 'Lets begin this trial. Ill provide an opening statement and overview of the case.');
    } else {
      // Continue from the last message
      setAutoMode(true);
      const lastMessage = messages[messages.length - 1];
      setTimeout(() => {
        if (autoModeRef.current) {
          continueConversation(lastMessage);
        }
      }, 1000);
    }
  };

  // Function to stop auto mode
  const stopAutoMode = () => {
    setAutoMode(false);
  };

  const getRoleStyle = (role: string) => {
    return {
      backgroundColor: roleColors[role] || '#718096',
      color: 'white'
    };
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading trial data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto pb-8">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">{caseName}</h1>
            <p className="text-sm text-gray-300">Court Session in Progress</p>
          </div>
          <div className="flex space-x-2">
            {!autoMode ? (
              <button
                onClick={startAutoMode}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition flex items-center"
                disabled={loading}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Start Auto Trial
              </button>
            ) : (
              <button
                onClick={stopAutoMode}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Stop Auto Trial
              </button>
            )}
            <select 
              className="px-2 py-2 bg-gray-700 text-white rounded border border-gray-600"
              value={autoDelay}
              onChange={(e) => setAutoDelay(Number(e.target.value))}
              disabled={autoMode}
            >
              <option value="3000">Fast (3s)</option>
              <option value="5000">Normal (5s)</option>
              <option value="8000">Slow (8s)</option>
            </select>
            
            {/* Add Export button */}
            <button
              onClick={exportConversation}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition flex items-center"
              disabled={messages.length === 0}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export JSON
            </button>
          </div>
        </div>

        {/* Chat messages */}
        <div 
          ref={chatContainerRef}
          className="h-[calc(100vh-400px)] min-h-[400px] overflow-y-auto p-6 bg-gray-50"
        >
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-black">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p>No messages yet. Start the trial by clicking "Start Auto Trial" or send a message manually.</p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div key={index} className="mb-8">
                {/* User message */}
                <div className="flex items-start mb-4 text-black">
                  <div 
                    className="rounded-full w-10 h-10 flex justify-center items-center mr-3 flex-shrink-0" 
                    style={getRoleStyle(msg.role)}
                  >
                    {msg.role[0].toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-baseline">
                      <p className="font-semibold text-black">{roleNames[msg.role] || msg.role}</p>
                      <span className="ml-2 text-xs text-black">{formatTimestamp(msg.timestamp)}</span>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm mt-1 border border-gray-200">
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                </div>

                {/* AI response */}
                <div className="flex items-start ml-12">
                  <div className="bg-blue-50 p-4 rounded-lg shadow-sm border border-blue-100 w-full">
                    <p className="whitespace-pre-wrap text-black">{msg.response}</p>
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Manual input section (hidden in auto mode) */}
        {!autoMode && (
          <>
            {/* Role selection */}
            <div className="bg-gray-100 p-4 border-t border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-2">Select Role:</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(roleNames).map(([role, name]) => (
                  <button
                    key={role}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                      selectedRole === role 
                        ? 'text-white shadow-sm' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                    style={selectedRole === role ? getRoleStyle(role) : {}}
                    onClick={() => setSelectedRole(role)}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>

            {/* Message input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <textarea
                  className="text-black w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={`Message as ${roleNames[selectedRole]}`}
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  rows={3}
                  disabled={loading}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(selectedRole, currentMessage);
                    }
                  }}
                />
                <button
                  className="px-4 py-2 rounded-lg flex items-center justify-center focus:outline-none transition"
                  style={{
                    ...getRoleStyle(selectedRole),
                    opacity: loading || !currentMessage.trim() ? 0.6 : 1
                  }}
                  onClick={() => handleSendMessage(selectedRole, currentMessage)}
                  disabled={loading || !currentMessage.trim()}
                >
                  {loading ? (
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">Press Shift+Enter for a new line. Press Enter to send.</p>
            </div>
          </>
        )}
        
        {/* Auto mode indicator */}
        {autoMode && (
          <div className="p-4 border-t border-gray-200 bg-gray-100 flex items-center justify-center">
            <div className="flex items-center text-gray-700">
              <div className="animate-pulse mr-2 h-3 w-3 rounded-full bg-green-500"></div>
              <p>Auto trial in progress - {roleNames[selectedRole]} is thinking...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Trial;