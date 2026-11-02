import type { CopilotChatConfigurationProvider } from "@copilotkit/react-core/v2";
import type { ComponentProps } from "react";
import { DEFAULT_LOCALE } from "./i18n";

type ChatLabels = ComponentProps<
  typeof CopilotChatConfigurationProvider
>["labels"];

export const chatLabels: ChatLabels =
  DEFAULT_LOCALE === "pt-BR"
    ? {
        chatInputPlaceholder: "Como posso ajudar?",
        chatInputToolbarStartTranscribeButtonLabel: "Iniciar transcrição",
        chatInputToolbarCancelTranscribeButtonLabel: "Cancelar transcrição",
        chatInputToolbarFinishTranscribeButtonLabel: "Concluir transcrição",
        chatInputToolbarAddButtonLabel: "Adicionar",
        chatInputToolbarToolsButtonLabel: "Ferramentas",
        assistantMessageToolbarCopyCodeLabel: "Copiar código",
        assistantMessageToolbarCopyCodeCopiedLabel: "Código copiado",
        assistantMessageToolbarCopyMessageLabel: "Copiar mensagem",
        assistantMessageToolbarInspectorLabel: "Inspecionar",
        assistantMessageToolbarInspectorDescription:
          "Ver detalhes desta mensagem",
        assistantMessageToolbarInspectorLocalOnlyLabel:
          "Disponível apenas localmente",
        assistantMessageToolbarInspectorLocalOnlyDescription:
          "A inspeção está disponível no ambiente local.",
        assistantMessageToolbarInspectorTitle: "Detalhes da mensagem",
        assistantMessageToolbarInspectorHideLabel: "Ocultar detalhes",
        assistantMessageToolbarInspectorHideDescription:
          "Fechar os detalhes da mensagem",
        assistantMessageToolbarThumbsUpLabel: "Resposta útil",
        assistantMessageToolbarThumbsDownLabel: "Resposta não útil",
        assistantMessageToolbarReadAloudLabel: "Ler em voz alta",
        assistantMessageToolbarRegenerateLabel: "Gerar novamente",
        userMessageToolbarCopyMessageLabel: "Copiar mensagem",
        userMessageToolbarEditMessageLabel: "Editar mensagem",
        chatDisclaimerText:
          "A IA pode cometer erros. Confira as informações importantes.",
        chatToggleOpenLabel: "Abrir conversa",
        chatToggleCloseLabel: "Fechar conversa",
        modalHeaderTitle: "Assistente",
        welcomeMessageText: "Como posso ajudar você?",
      }
    : undefined;
