import {
  CopilotChatMessageView,
  CopilotChatReasoningMessage,
} from "@copilotkit/react-core/v2";
import type { ComponentProps } from "react";
import { DEFAULT_LOCALE } from "@/lib/i18n";

function LocalizedReasoningHeader(
  props: ComponentProps<typeof CopilotChatReasoningMessage.Header>,
) {
  let label = props.label;
  if (DEFAULT_LOCALE === "pt-BR") {
    const duration = label
      ?.replace(/^Thought for /, "")
      .replace(/a few seconds/, "alguns segundos")
      .replace(/seconds?/, "segundos")
      .replace(/minutes?/, "minutos")
      .replace(/hours?/, "horas");
    label = props.isStreaming
      ? "Pensando…"
      : duration
        ? `Pensou por ${duration}`
        : "Raciocínio";
  }
  return <CopilotChatReasoningMessage.Header {...props} label={label} />;
}

/** Preserve the SDK's scrolling, content and controls through its partial slot props. */
export const localizedMessageView = {
  reasoningMessage: { header: LocalizedReasoningHeader },
} satisfies Partial<ComponentProps<typeof CopilotChatMessageView>>;
