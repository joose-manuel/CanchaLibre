import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { FALLBACK_CONVERSATIONS } from '../constants/mensajes.constants';
import { ChatConversation } from '../interfaces/mensajes.interface';

/**
 * Servicio de la página de mensajes.
 *
 * El backend todavía no expone conversaciones, así que por ahora devuelve
 * los datos quemados de `constants/mensajes.constants.ts`. Cuando exista el
 * endpoint, sólo hay que cambiar el cuerpo de estos métodos.
 */
@Injectable({ providedIn: 'root' })
export class MensajesService {
  /** Lista de conversaciones del usuario. */
  getConversations(): Observable<ChatConversation[]> {
    return of(FALLBACK_CONVERSATIONS);
  }

  /**
   * Envía un mensaje a una conversación.
   *
   * El envío es local por ahora: el backend todavía no expone el chat.
   */
  sendMessage(): Observable<ChatConversation[]> {
    return of(FALLBACK_CONVERSATIONS);
  }
}
