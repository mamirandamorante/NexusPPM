import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send } from 'lucide-react';

/**
 * AI Chat Component
 * 
 * AI-powered portfolio assistant in the right sidebar
 */

const AIChat = ({ isOpen, onClose }) => {
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    {
      type: 'assistant',
      text: 'Hello! I\'m your AI Portfolio Assistant. I can help you with:\n\n• Project health assessments\n• Risk analysis and mitigation plans\n• Portfolio performance summaries\n• Financial insights and forecasting\n\nWhat would you like to know?'
    }
  ]);
  const chatEndRef = useRef(null);

  const suggestedPrompts = [
    'Assess overall portfolio health',
    'What are the top 3 risks?',
    'Projects requiring immediate attention',
    'Financial summary and burn rate'
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    
    setChatMessages(prev => [...prev, { type: 'user', text: chatInput }]);
    const userMessage = chatInput;
    setChatInput('');
    
    setTimeout(() => {
      let response = '';
      const lowerMsg = userMessage.toLowerCase();
      
      if (lowerMsg.includes('portfolio') || lowerMsg.includes('health') || lowerMsg.includes('assess')) {
        response = '📊 **Portfolio Health Assessment**\n\nCurrent Status:\n• 60% projects on track (12 projects)\n• 30% at risk (6 projects)\n• 10% critical (2 projects)\n\n**Recommendation:** Focus on the 2 critical projects: Finance System Migration and Marketing - Project Pro. Both are off track on multiple health indicators.\n\n**Action Items:**\n1. Schedule immediate status review meetings\n2. Reallocate resources if needed\n3. Review and update risk mitigation plans';
      } else if (lowerMsg.includes('risk')) {
        response = '⚠️ **Top 3 Risks Analysis**\n\n**1. Economic Downturn Impact (Score: 20)**\n   • Level: Portfolio\n   • Mitigation: Diversify funding sources, build contingency reserves\n\n**2. Legacy System Integration (Score: 20)**\n   • Level: Program\n   • Mitigation: Dedicated integration team, phased approach\n\n**3. Resource Over-Allocation (Score: 16)**\n   • Level: Program\n   • Mitigation: Rebalance workload, hire contractors for peak periods\n\nWould you like detailed mitigation plans for any of these?';
      } else if (lowerMsg.includes('financial') || lowerMsg.includes('budget') || lowerMsg.includes('burn')) {
        response = '💰 **Financial Summary**\n\n**Overall Portfolio:**\n• Total Budget: $13,000,000\n• Spent: $6,900,000 (53%)\n• Remaining: $6,100,000\n• Monthly Burn Rate: $863K\n• Projected Completion: On target\n\n**Status:**\n✓ Spending aligned with schedule (53% complete, 53% spent)\n✓ No budget overruns detected\n✓ Cash flow healthy\n\n**Forecast:** At current burn rate, all projects will complete within budget.';
      } else {
        response = 'I can help you with that. Here are some things I can analyze:\n\n• Portfolio health and status\n• Risk assessments and mitigation strategies\n• Project prioritization recommendations\n• Financial analysis and forecasting\n• Resource allocation optimization\n\nWhat specific aspect would you like me to focus on?';
      }
      
      setChatMessages(prev => [...prev, { type: 'assistant', text: response }]);
    }, 800);
  };

  const handlePromptClick = (prompt) => {
    setChatInput(prompt);
    setTimeout(() => handleSendMessage(), 100);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="h-full flex flex-col bg-portavia-grey">
      {/* Header */}
      <div className="p-4 border-b border-portavia-border flex items-center justify-between bg-portavia-grey">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-portavia-dark" />
          <h3 className="font-semibold text-portavia-dark">AI Assistant</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-200 rounded transition-colors"
          aria-label="Close AI Assistant"
        >
          <X className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 chat-scroll">
        {chatMessages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-lg p-3 ${
                msg.type === 'user'
                  ? 'bg-portavia-dark text-white'
                  : 'bg-white border border-portavia-border text-gray-800'
              }`}
            >
              <div className="text-sm whitespace-pre-wrap">{msg.text}</div>
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Suggested Prompts */}
      {chatMessages.length === 1 && (
        <div className="px-4 pb-4">
          <p className="text-xs text-gray-500 mb-2">Suggested prompts:</p>
          <div className="space-y-2">
            {suggestedPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handlePromptClick(prompt)}
                className="w-full text-left px-3 py-2 bg-white border border-portavia-border rounded text-xs hover:bg-gray-50 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t border-portavia-border bg-portavia-grey">
        <div className="flex gap-2">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about your portfolio..."
            className="flex-1 px-3 py-2 bg-white border border-portavia-border rounded text-sm focus:outline-none focus:border-gray-400"
          />
          <button
            onClick={handleSendMessage}
            className="p-2 bg-portavia-dark text-white rounded hover:bg-gray-800 transition-colors"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
