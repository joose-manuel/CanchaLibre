import { ChatConversation } from '../interfaces/mensajes.interface';

/**
 * Datos quemados de la página de mensajes.
 *
 * El backend todavía no expone conversaciones, así que el servicio devuelve
 * estos datos mientras tanto.
 */

export const FALLBACK_CONVERSATIONS: ChatConversation[] = [
  {
    id: 'c-1',
    name: 'Juan Pérez',
    initials: 'JP',
    preview: 'Perfecto, nos vemos a las 6 en la cancha',
    timeLabel: '10:24 AM',
    unread: 2,
    isGroup: false,
    online: true,
    messages: [
      {
        id: 'm-1',
        text: '¿La cancha 3 sigue libre a las 6?',
        timeLabel: '10:12 AM',
        fromMe: false,
        read: true,
      },
      {
        id: 'm-2',
        text: 'Sí, la reservé hace un rato. Te la dejo pagada.',
        timeLabel: '10:18 AM',
        fromMe: true,
        read: true,
      },
      {
        id: 'm-3',
        text: 'Perfecto, nos vemos a las 6 en la cancha',
        timeLabel: '10:24 AM',
        fromMe: false,
        read: false,
      },
    ],
  },
  {
    id: 'c-2',
    name: 'Club Prodes',
    initials: 'CP',
    preview: 'Marta: Listo, ya habilitamos la cancha 2',
    timeLabel: '9:05 AM',
    unread: 0,
    isGroup: true,
    online: false,
    messages: [
      {
        id: 'm-4',
        text: 'Marta: Listo, ya habilitamos la cancha 2',
        timeLabel: '9:05 AM',
        fromMe: false,
        read: true,
      },
    ],
  },
  {
    id: 'c-3',
    name: 'Elena Rodríguez',
    initials: 'ER',
    preview: 'Gracias por la reserva',
    timeLabel: 'Ayer',
    unread: 0,
    isGroup: false,
    online: false,
    messages: [
      {
        id: 'm-5',
        text: 'Gracias por la reserva',
        timeLabel: 'Ayer',
        fromMe: false,
        read: true,
      },
    ],
  },
  {
    id: 'c-4',
    name: 'Marco Tulio',
    initials: 'MT',
    preview: '¿Alguien tiene el contacto del arbitraje?',
    timeLabel: 'Lun',
    unread: 1,
    isGroup: false,
    online: false,
    messages: [
      {
        id: 'm-6',
        text: '¿Alguien tiene el contacto del arbitraje?',
        timeLabel: 'Lun',
        fromMe: false,
        read: false,
      },
    ],
  },
];

/** Placeholder del buscador de conversaciones. */
export const SEARCH_PLACEHOLDER = 'Buscar conversaciones...';

/** Placeholder del campo de escritura. */
export const COMPOSER_PLACEHOLDER = 'Escribe un mensaje...';
