import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { AppMenuComponent } from '../../components/app-menu/app-menu.component';
import { SearchFieldComponent } from '../../components/search-field/search-field.component';
import { MAIN_NAV_ITEMS } from '../../constants/nav-items';
import { MenuItem } from '../../interfaces/menu-item.interface';
import { MediaQueryService } from '../../services/media-query.service';
import {
  COMPOSER_PLACEHOLDER,
  SEARCH_PLACEHOLDER,
} from './constants/mensajes.constants';
import { ChatConversation, ChatMessage } from './interfaces/mensajes.interface';
import { MensajesService } from './services/mensajes.service';

/**
 * Mensajes: lista de conversaciones y conversación abierta.
 *
 * Es la misma pantalla en dos estados (lista / hilo) para que el usuario
 * nunca pierda el contexto de dónde está.
 */
@Component({
  selector: 'cl-mensajes-page',
  imports: [AppMenuComponent, SearchFieldComponent],
  templateUrl: './mensajes.page.html',
  styleUrl: './mensajes.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MensajesPage {
  private readonly mensajesService = inject(MensajesService);
  private readonly mediaQuery = inject(MediaQueryService);

  protected readonly isDesktop = this.mediaQuery.isDesktop;

  protected readonly navItems: MenuItem[] = MAIN_NAV_ITEMS;

  protected readonly searchPlaceholder = SEARCH_PLACEHOLDER;
  protected readonly composerPlaceholder = COMPOSER_PLACEHOLDER;

  protected readonly conversations = signal<ChatConversation[]>([]);
  protected readonly searchTerm = signal('');

  /** Conversación abierta (null si se está viendo la lista). */
  protected readonly activeId = signal<string | null>(null);

  /** Texto del campo de escritura. */
  protected readonly draft = signal('');

  /** Conversaciones que pasan el filtro de búsqueda. */
  protected readonly visibleConversations = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();

    if (term === '') {
      return this.conversations();
    }

    return this.conversations().filter((conversation) =>
      `${conversation.name} ${conversation.preview}`.toLowerCase().includes(term),
    );
  });

  /** Conversación abierta. */
  protected readonly activeConversation = computed(
    () => this.conversations().find((item) => item.id === this.activeId()) ?? null,
  );

  /** Número total de mensajes sin leer. */
  protected readonly totalUnread = computed(() =>
    this.conversations().reduce((total, conversation) => total + conversation.unread, 0),
  );

  constructor() {
    this.mensajesService
      .getConversations()
      .subscribe((conversations) => this.conversations.set(conversations));
  }

  protected onSearch(term: string): void {
    this.searchTerm.set(term);
  }

  /** Abre una conversación (y marca sus mensajes como leídos). */
  protected onOpen(conversation: ChatConversation): void {
    this.activeId.set(conversation.id);

    this.conversations.update((list) =>
      list.map((item) => (item.id === conversation.id ? { ...item, unread: 0 } : item)),
    );
  }

  /** Vuelve a la lista de conversaciones. */
  protected onClose(): void {
    this.activeId.set(null);
  }

  /** Escribe en el campo de envío. */
  protected onDraft(value: string): void {
    this.draft.set(value);
  }

  /** Envía el mensaje escrito. */
  protected onSend(): void {
    const text = this.draft().trim();
    const conversationId = this.activeId();

    if (!text || !conversationId) {
      return;
    }

    const message: ChatMessage = {
      id: `local-${Date.now()}`,
      text,
      timeLabel: this.nowLabel(),
      fromMe: true,
      read: false,
    };

    this.conversations.update((list) =>
      list.map((conversation) =>
        conversation.id === conversationId
          ? {
              ...conversation,
              preview: text,
              timeLabel: message.timeLabel,
              messages: [...conversation.messages, message],
            }
          : conversation,
      ),
    );

    this.draft.set('');
  }

  /** "10:32 AM" */
  private nowLabel(): string {
    const date = new Date();
    const hours = date.getHours();
    const suffix = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 === 0 ? 12 : hours % 12;

    return `${hour12}:${String(date.getMinutes()).padStart(2, '0')} ${suffix}`;
  }
}
