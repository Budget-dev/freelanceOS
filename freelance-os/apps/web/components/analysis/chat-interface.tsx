"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, User, Bot, AlertCircle,
  FileText, ImageIcon, RotateCcw,
  Copy, Check, ChevronDown, ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { FileUploadZone } from "@/components/analysis/file-upload-zone";
import {
  AgentWorkflow,
  PixelDotsLoader,
} from "@/components/ui/ai-agent-response";
import { cn } from "@/lib/utils";
import type {
  ChatMessage,
  AnalysisState,
  UploadedFile,
} from "@/hooks/use-mock-analysis";

// ── Props ───────────────────────────────────────────────────────────────

interface ChatInterfaceProps {
  messages: ChatMessage[];
  state: AnalysisState;
  uploadedFiles: UploadedFile[];
  onSubmit: (text: string) => void;
  onAddFiles: (files: File[]) => void;
  onRemoveFile: (id: string) => void;
  onReset: () => void;
}

// ── Typing indicator ────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-3 px-1 w-full"
    >
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700 shadow-2xs">
        <Bot className="h-4 w-4" />
      </div>
      <div className="flex items-center gap-2 rounded-2xl bg-slate-50 border border-border/60 px-4 py-2.5 text-[12.5px] text-muted-foreground shadow-2xs">
        <PixelDotsLoader />
        <span className="font-medium text-foreground/80">Analyzing project & extracting signals…</span>
      </div>
    </motion.div>
  );
}

// ── Single message bubble ───────────────────────────────────────────────

function MessageBubble({
  message,
  isLatest,
}: {
  message: ChatMessage;
  isLatest?: boolean;
}) {
  const isUser = message.role === "user";
  const isError = message.role === "system";
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (message.content) {
      navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isLongContent =
    message.content &&
    (message.content.length > 300 || message.content.split("\n").length > 5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn("flex gap-3 px-1 w-full", isUser ? "justify-end" : "")}
    >
      {/* Avatar (only for non-user messages) */}
      {!isUser && (
        <div
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
            isError ? "bg-red-50 text-destructive" : "bg-slate-100 text-slate-700"
          )}
        >
          {isError ? (
            <AlertCircle className="h-4 w-4 text-destructive" />
          ) : (
            <Bot className="h-4 w-4" />
          )}
        </div>
      )}

      {/* Bubble / Content */}
      <div
        className={cn(
          "transition-all",
          isUser
            ? "max-w-[95%] sm:max-w-[85%] flex flex-col gap-1.5"
            : isError
            ? "max-w-[85%] rounded-2xl bg-red-50 px-4 py-3 text-[13px] text-red-700 border border-red-200/60 rounded-bl-md"
            : "flex-1 max-w-full rounded-2xl bg-slate-50/70 px-4 py-3 text-[13px] border border-border/60 rounded-bl-md shadow-2xs"
        )}
      >
        {isUser ? (
          <>
            {/* Attachments preview */}
            {message.attachments && message.attachments.length > 0 && (
              <div className="flex flex-wrap gap-1.5 justify-end">
                {message.attachments.map((att, i) => (
                  <Badge
                    key={i}
                    variant="secondary"
                    className="gap-1 text-[10px] h-5 font-normal bg-slate-100 text-slate-700 hover:bg-slate-200"
                  >
                    {att.type.startsWith("image/") ? (
                      <ImageIcon className="h-2.5 w-2.5" />
                    ) : (
                      <FileText className="h-2.5 w-2.5" />
                    )}
                    {att.name}
                  </Badge>
                ))}
              </div>
            )}

            {message.content && (
              <div className="group overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 shadow-sm flex flex-col w-full max-w-full">
                <div className="flex items-center justify-between px-3.5 py-2 border-b border-white/10 bg-white/5">
                  <span className="text-[10px] font-medium text-slate-400">
                    {isLongContent ? "PASTED CONTENT" : "MESSAGE"}
                  </span>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 text-[10px] font-medium text-slate-400 hover:text-white transition-colors"
                  >
                    {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>

                <div className="relative">
                  <motion.div
                    animate={{ height: isExpanded ? "auto" : isLongContent ? 100 : "auto" }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className={cn(
                      "px-4 py-3 text-[13px] text-slate-200 leading-relaxed whitespace-pre-wrap break-words",
                      isExpanded ? "max-h-[360px] overflow-y-auto" : "overflow-hidden"
                    )}
                  >
                    {message.content}
                  </motion.div>

                  {isLongContent && !isExpanded && (
                    <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-900 to-transparent pointer-events-none" />
                  )}
                </div>

                {isLongContent && (
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center justify-center gap-1.5 py-2 text-[11px] font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors border-t border-white/5 w-full"
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="h-3.5 w-3.5" />
                        Show less
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-3.5 w-3.5" />
                        Show more
                      </>
                    )}
                  </button>
                )}
              </div>
            )}

            <p className="text-[10px] text-slate-400 text-right mr-1">
              {message.timestamp.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </>
        ) : (
          /* Assistant / System Message */
          <>
            {message.workflowPhases && message.workflowPhases.length > 0 ? (
              <AgentWorkflow
                phases={message.workflowPhases}
                workingLabel="Analyzing project..."
              />
            ) : (
              message.content && (
                <p className="whitespace-pre-wrap break-words">{message.content}</p>
              )
            )}

            <p className="mt-2 text-[10px] text-muted-foreground/60">
              {message.timestamp.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </>
        )}
      </div>
    </motion.div>
  );
}

// ── Main component ──────────────────────────────────────────────────────

export function ChatInterface({
  messages,
  state,
  uploadedFiles,
  onSubmit,
  onAddFiles,
  onRemoveFile,
  onReset,
}: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const isProcessing = state === "processing";

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, state]);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 110)}px`;
  }, [input]);

  const handleSubmit = () => {
    if (isProcessing) return;
    if (!input.trim() && uploadedFiles.length === 0) return;
    onSubmit(input);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    const pastedFiles: File[] = [];
    for (let i = 0; i < items.length; i++) {
      if (items[i].kind === "file") {
        const file = items[i].getAsFile();
        if (file) pastedFiles.push(file);
      }
    }
    if (pastedFiles.length > 0) {
      onAddFiles(pastedFiles);
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* ── Messages area ── */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-4 no-scrollbar"
      >
        {messages.length === 0 && state === "idle" && (
          <div className="flex h-full flex-col items-center justify-center text-center py-20">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 border border-border/60 shadow-xs mb-3">
              <Bot className="h-6 w-6 text-slate-700" />
            </div>
            <h3 className="text-lg font-bold text-foreground tracking-tight">
              Freelancer.com Analysis
            </h3>
            <p className="mt-2 max-w-sm text-[13px] text-muted-foreground leading-relaxed">
              Paste a project description, client profile, or URL below. You can also
              attach images and files to include in the analysis.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {[
                "Paste project description",
                "Upload screenshot",
                "Analyze client profile",
              ].map((hint) => (
                <Badge
                  key={hint}
                  variant="secondary"
                  className="text-[11px] font-normal cursor-default"
                >
                  {hint}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <MessageBubble key={msg.id} message={msg} isLatest={idx === messages.length - 1} />
        ))}

        {isProcessing && <TypingIndicator />}
      </div>

      {/* ── Input area ── */}
      <div className="shrink-0 border-t border-border/40 bg-white p-4 space-y-3">
        {/* Upload zone (collapsed into thumbnails when files present) */}
        <FileUploadZone
          files={uploadedFiles}
          onAddFiles={onAddFiles}
          onRemoveFile={onRemoveFile}
          disabled={isProcessing}
        />

        {/* Text input + submit */}
        <div className="flex items-end gap-2">
          <div className="relative flex-1">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              placeholder="Paste a Freelancer.com project description, URL, or ask a follow-up question..."
              rows={1}
              disabled={isProcessing}
              className={cn(
                "w-full resize-none rounded-xl border border-border/60 bg-slate-50/50 px-4 py-3 pr-12 text-[13px] leading-relaxed text-foreground placeholder:text-muted-foreground/50 transition-all focus:border-ring focus:bg-white focus:outline-none focus:ring-2 focus:ring-ring/20",
                isProcessing && "opacity-60 cursor-not-allowed"
              )}
            />
          </div>

          <div className="flex items-center gap-1.5">
            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 shrink-0"
                onClick={onReset}
                disabled={isProcessing}
                title="New analysis"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            )}

            <Button
              size="icon"
              className="h-10 w-10 shrink-0 rounded-xl shadow-sm"
              onClick={handleSubmit}
              disabled={isProcessing || (!input.trim() && uploadedFiles.length === 0)}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <p className="text-center text-[10px] text-muted-foreground/50">
          AI analysis is simulated for demonstration purposes
        </p>
      </div>
    </div>
  );
}
