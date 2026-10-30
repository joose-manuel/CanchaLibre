/**
 * Tipos de la página de mensajes.
 */

/** Un mensaje dentro de una conversación. */
export interface ChatMessage {
  id: string;
  /** Texto del mensaje. */
  text: string;
  /** "10:24 AM" */
  timeLabel: string;
  /** `true` si lo envió el usuario. */
  fromMe: boolean;
  /** `true` si ya fue leído. */
  read: boolean;
}

/** Una conversación de la lista de mensajes. */
export interface ChatConversation {
  id: string;
  /** Nombre del contacto o del grupo. */
  name: string;
  /** Iniciales para el avatar. */
  initials: string;
  /** Último mensaje de la conversación. */
  preview: string;
  /** "10:24 AM" */
  timeLabel: string;
  /** Número de mensajes sin leer (0 si no hay). */
  unread: number;
  /** `true` si es un grupo. */
  isGroup: boolean;
  /** `true` si el contacto está en línea. */
  online: boolean;
  /** Mensajes de la conversación. */
  messages: ChatMessage[];
}
