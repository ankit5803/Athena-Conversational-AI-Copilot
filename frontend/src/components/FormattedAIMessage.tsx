// "use client";

// import { useEffect, useState, useRef } from "react";
// import DOMPurify from "dompurify";
// import { marked } from "marked";
// import { useChat } from "./contexts/ChatContext";

// export default function FormattedAIMessage({ content }: { content: string }) {
//   const [html, setHtml] = useState("");
//   const fullTextRef = useRef("");
//   const { selectedConversation } = useChat();

//   useEffect(() => {
//     if (!content || !selectedConversation?.id) return;

//     const eventSource = new EventSource(
//       `/api/chat/${selectedConversation.id}/messages`,
//       { content: content }
//     );

//     eventSource.onmessage = async (event) => {
//       if (event.data === "[DONE]") {
//         eventSource.close();
//         return;
//       }

//       try {
//         const parsed = JSON.parse(event.data);
//         const delta = parsed?.delta;
//         if (delta) {
//           fullTextRef.current += delta;
//           const rawHtml = await marked.parse(fullTextRef.current, {
//             breaks: true,
//             gfm: true,
//           });
//           const safeHtml = DOMPurify.sanitize(rawHtml);
//           setHtml(safeHtml);
//         }
//       } catch {
//         // ignore malformed chunks
//       }
//     };

//     eventSource.onerror = () => eventSource.close();
//     return () => eventSource.close();
//   }, [content]);

//   return (
//     <div
//       className="whitespace-pre-wrap font-sans text-sm leading-relaxed"
//       dangerouslySetInnerHTML={{
//         __html: html + `<span class="animate-pulse">|</span>`,
//       }}
//     />
//   );
// }

import React from "react";
import DOMPurify from "dompurify";
import { marked } from "marked";
export default function FormattedAIMessage({ content }: { content: string }) {
  const [formatted, setFormatted] = React.useState("");

  React.useEffect(() => {
    (async () => {
      const html = await formatMessageFromAI(content);
      setFormatted(html);
    })();
  }, [content]);

  return (
    <div
      className="whitespace-pre-wrap"
      dangerouslySetInnerHTML={{ __html: formatted }}
    />
  );
}

function formatMessageFromAI(content: string) {
  if (!content || typeof content !== "string") return "";

  marked.setOptions({
    breaks: true,
    gfm: true,
  });

  // ✅ Use parseSync to stay synchronous
  const rawHtml: string | Promise<string> = marked.parse(content);

  const safeHtml: string = DOMPurify.sanitize(rawHtml as string);
  return safeHtml;
}
