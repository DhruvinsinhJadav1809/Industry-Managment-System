import { Bot, MessageCircle, Send, X } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { clsx } from "clsx";
import { chatService } from "../../services/chatService";
import type { ApiErrorShape } from "../../lib/axios";

interface ThreadMessage {
  id: string;
  role: "user" | "bot";
  text: string;
  isError?: boolean;
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ThreadMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isPending, setIsPending] = useState(false);
  const threadRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    threadRef.current?.scrollTo({
      top: threadRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isPending]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const handleSend = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isPending) return;

    setMessages((prev) => [
      ...prev,
      { id: `${Date.now()}-u`, role: "user", text: trimmed },
    ]);
    setInputValue("");
    setIsPending(true);

    try {
      const res = await chatService.ask(trimmed);
      setMessages((prev) => [
        ...prev,
        { id: `${Date.now()}-b`, role: "bot", text: res.data.answer },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-e`,
          role: "bot",
          text: (err as ApiErrorShape).message,
          isError: true,
        },
      ]);
    } finally {
      setIsPending(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleSend(inputValue);
  };

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-6 z-40 flex h-[28rem] max-h-[70vh] w-80 flex-col overflow-hidden rounded-lg border border-steel-200 bg-white shadow-2xl dark:border-steel-700 dark:bg-steel-900 sm:w-96">
          <div className="flex items-center justify-between border-b border-steel-800 bg-steel-800 px-4 py-3 dark:border-steel-950 dark:bg-steel-950">
            <div className="flex items-center gap-2">
              <Bot className="size-4 text-amber-400" aria-hidden="true" />
              <p className="font-display text-sm font-bold text-steel-50">
                IMS Assistant
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close assistant"
              className="cursor-pointer rounded-md p-1 text-steel-300 transition-colors hover:bg-steel-700/60 hover:text-steel-50"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>

          <div
            ref={threadRef}
            className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
          >
            {/* {messages.length === 0 && (
              <div className="space-y-3 text-center">
                <p className="text-xs leading-relaxed text-steel-400 dark:text-steel-500">
                  Ask about your finances — sales, purchases, profit, or tax.
                </p>
                <div className="flex flex-wrap justify-center gap-1.5">
                  {chatQuestions.map((q) => (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => handleSend(q.question)}
                      className="cursor-pointer rounded-full border border-steel-200 px-3 py-1.5 text-xs font-medium text-steel-600 transition-colors hover:bg-steel-100 hover:text-steel-900 dark:border-steel-700 dark:text-steel-300 dark:hover:bg-steel-800 dark:hover:text-steel-50"
                    >
                      {q.question}
                    </button>
                  ))}
                </div>
              </div>
            )} */}

            {messages.map((m) => (
              <div
                key={m.id}
                className={clsx(
                  "flex",
                  m.role === "user" ? "justify-end" : "justify-start",
                )}
              >
                <div
                  className={clsx(
                    "max-w-[85%] rounded-lg px-3 py-2 text-sm leading-snug",
                    m.role === "user"
                      ? "bg-steel-800 text-steel-50 dark:bg-amber-400 dark:text-steel-950"
                      : m.isError
                        ? "border border-red-300/70 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
                        : "bg-steel-100 text-steel-800 dark:bg-steel-800 dark:text-steel-100",
                  )}
                >
                  {m.text}
                </div>
              </div>
            ))}

            {isPending && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1.5 rounded-lg bg-steel-100 px-3 py-2.5 dark:bg-steel-800">
                  <span className="size-1.5 animate-bounce rounded-full bg-steel-400 [animation-delay:-0.3s]" />
                  <span className="size-1.5 animate-bounce rounded-full bg-steel-400 [animation-delay:-0.15s]" />
                  <span className="size-1.5 animate-bounce rounded-full bg-steel-400" />
                </div>
              </div>
            )}
          </div>

          {/* {messages.length > 0 && (
            <div className="flex flex-wrap gap-1.5 border-t border-steel-100 px-3 pt-3 dark:border-steel-800">
              {chatQuestions.map((q) => (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => handleSend(q.question)}
                  disabled={isPending}
                  className="cursor-pointer rounded-full border border-steel-200 px-2.5 py-1 text-[11px] font-medium text-steel-600 transition-colors hover:bg-steel-100 hover:text-steel-900 disabled:cursor-not-allowed disabled:opacity-50 dark:border-steel-700 dark:text-steel-300 dark:hover:bg-steel-800 dark:hover:text-steel-50"
                >
                  {q.question}
                </button>
              ))}
            </div>
          )} */}

          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 border-t border-steel-100 p-3 dark:border-steel-800"
          >
            <input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask a question…"
              disabled={isPending}
              className="w-full rounded-md border border-steel-200 bg-white px-3 py-2 text-sm text-steel-900 outline-none transition-colors placeholder:text-steel-400 focus:border-steel-500 disabled:opacity-60 dark:border-steel-700 dark:bg-steel-900 dark:text-steel-50 dark:placeholder:text-steel-500 dark:focus:border-amber-400/70"
            />
            <button
              type="submit"
              disabled={isPending || !inputValue.trim()}
              aria-label="Send"
              className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-md bg-steel-800 text-steel-50 transition-colors hover:bg-steel-900 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-amber-400 dark:text-steel-950"
            >
              <Send className="size-4" aria-hidden="true" />
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close assistant" : "Open assistant"}
        className="fixed bottom-6 right-6 z-40 flex size-14 cursor-pointer items-center justify-center rounded-full bg-steel-800 text-steel-50 shadow-lg shadow-steel-900/20 transition-transform hover:scale-105 dark:bg-amber-400 dark:text-steel-950"
      >
        {open ? (
          <X className="size-5" aria-hidden="true" />
        ) : (
          <MessageCircle className="size-5" aria-hidden="true" />
        )}
      </button>
    </>
  );
}
