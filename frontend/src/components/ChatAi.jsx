import React, { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import axiosClient from "../utils/axiosClient";
import { Send, Bot, User, Sparkles, Lightbulb, Zap, AlertCircle, Copy, Check } from 'lucide-react';

function ChatAi({ problem }) {
  const [messages, setMessages] = useState([
    {
      role: 'model',
      parts: [
        {
          text: `Hi! I'm your AI coding coach for "${problem?.title || 'this challenge'}". You can ask me for hints, algorithm intuition, time complexity analysis, or debugging assistance.`
        }
      ]
    }
  ]);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset, setValue } = useForm();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (userText) => {
    if (!userText || !userText.trim() || loading) return;

    const newMessages = [...messages, { role: 'user', parts: [{ text: userText }] }];
    setMessages(newMessages);
    reset();
    setLoading(true);

    try {
      const response = await axiosClient.post("/ai/chat", {
        messages: newMessages,
        title: problem?.title,
        description: problem?.description,
        testCases: problem?.visibleTestCases,
        startCode: problem?.startCode
      });

      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          parts: [{ text: response.data?.message || 'I could not generate an answer.' }]
        }
      ]);
    } catch (error) {
      console.error("API Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          parts: [{ text: "Sorry, I encountered an issue connecting to the AI assistant. Please try again." }]
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (data) => {
    sendMessage(data.message);
  };

  const handleQuickPrompt = (prompt) => {
    setValue('message', prompt);
    sendMessage(prompt);
  };

  const quickPrompts = [
    { label: "Give a hint", icon: Lightbulb, query: "Can you give me a subtle hint to point me in the right direction without spoiling the complete solution?" },
    { label: "Optimal complexity", icon: Zap, query: "What are the recommended time and space complexities for this problem?" },
    { label: "Edge cases to consider", icon: AlertCircle, query: "What edge cases should I be careful with for this problem?" }
  ];

  // Helper to format text with code blocks
  const renderMessageContent = (text) => {
    const codeBlockRegex = /```([a-zA-Z]*)\n([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: text.substring(lastIndex, match.index)
        });
      }
      parts.push({
        type: 'code',
        language: match[1] || 'text',
        content: match[2].trim()
      });
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      parts.push({
        type: 'text',
        content: text.substring(lastIndex)
      });
    }

    return (
      <div className="space-y-2 text-xs sm:text-sm leading-relaxed">
        {parts.map((p, idx) => {
          if (p.type === 'code') {
            return (
              <div key={idx} className="my-2 rounded-lg bg-base-300 p-3 font-mono text-xs overflow-x-auto text-primary-content bg-slate-950">
                <div className="text-[10px] text-base-content/40 uppercase mb-1">{p.language}</div>
                <pre><code>{p.content}</code></pre>
              </div>
            );
          }
          return (
            <p key={idx} className="whitespace-pre-wrap">
              {p.content}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex h-full min-h-[480px] flex-col overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-sm">
      {/* Chat Header */}
      <div className="flex items-center justify-between border-b border-base-300/70 bg-base-200/50 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary shadow-sm">
            <Sparkles size={16} />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-base-content">AI Coding Assistant</h4>
            <p className="text-[10px] text-base-content/50">Context aware of current problem</p>
          </div>
        </div>
      </div>

      {/* Messages Thread */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.map((msg, index) => {
          const isUser = msg.role === "user";
          return (
            <div
              key={index}
              className={`flex items-start gap-2.5 ${isUser ? "flex-row-reverse" : "flex-row"} animate-fade-in`}
            >
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs ${
                  isUser ? "bg-primary text-primary-content" : "bg-base-300 text-base-content"
                }`}
              >
                {isUser ? <User size={14} /> : <Bot size={14} />}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl p-3.5 shadow-sm ${
                  isUser
                    ? "bg-primary text-primary-content rounded-tr-none"
                    : "bg-base-200 text-base-content rounded-tl-none border border-base-300/50"
                }`}
              >
                {renderMessageContent(msg.parts[0]?.text || '')}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-start gap-2.5 animate-fade-in">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-base-300 text-base-content">
              <Bot size={14} />
            </div>
            <div className="rounded-2xl rounded-tl-none border border-base-300/50 bg-base-200 p-3 text-xs text-base-content/70">
              <span className="inline-flex items-center gap-1.5">
                <span className="loading loading-dots loading-xs"></span>
                Thinking...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestions */}
      <div className="flex flex-wrap gap-1.5 px-4 py-2 border-t border-base-300/40 bg-base-200/30">
        {quickPrompts.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => handleQuickPrompt(item.query)}
              disabled={loading}
              className="btn btn-xs rounded-full border-base-300/70 bg-base-100 font-normal hover:border-primary/50 hover:bg-base-200 gap-1 text-[11px]"
            >
              <Icon size={12} className="text-primary" />
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="border-t border-base-300 bg-base-100 p-3 sm:p-4">
        <div className="flex items-center gap-2">
          <input
            placeholder="Ask a question or request a hint..."
            disabled={loading}
            className="input input-bordered input-sm flex-1 text-xs focus:border-primary bg-base-200/50"
            {...register("message", { required: true })}
          />
          <button
            type="submit"
            className="btn btn-primary btn-sm shadow-sm"
            disabled={loading}
          >
            <Send size={14} />
          </button>
        </div>
      </form>
    </div>
  );
}

export default ChatAi;