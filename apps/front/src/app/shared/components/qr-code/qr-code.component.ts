import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Código QR de acceso a la cancha (paso 4 del asistente).
 *
 * Sin una librería de QR se dibuja una matriz decorativa determinista a
 * partir del payload: el patrón se genera siempre igual para el mismo
 * código, de modo que sirve como identificador visual de la reserva.
 */
@Component({
  selector: 'cl-qr-code',
  templateUrl: './qr-code.component.html',
  styleUrl: './qr-code.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QrCodeComponent {
  readonly payload = input.required<string>();
  /** Tamaño de la matriz (cuadrados por lado). */
  readonly size = input(21);

  /**
   * Celdas activas de la matriz. Se derivan del payload con un hash simple
   * y determinista, así el mismo código produce siempre el mismo patrón.
   */
  protected readonly cells = (): boolean[][] => {
    const size = this.size();
    const payload = this.payload() || 'CANCHALIBRE';
    const matrix: boolean[][] = [];

    for (let row = 0; row < size; row++) {
      const line: boolean[] = [];

      for (let col = 0; col < size; col++) {
        const inFinder =
          (row < 7 && col < 7) ||
          (row < 7 && col >= size - 7) ||
          (row >= size - 7 && col < 7);

        if (inFinder) {
          const r = row < 7 ? row : row - (size - 7);
          const c = col < 7 ? col : col - (size - 7);
          const onBorder = r === 0 || r === 6 || c === 0 || c === 6;
          const inCore = r >= 2 && r <= 4 && c >= 2 && c <= 4;

          line.push(onBorder || inCore);
          continue;
        }

        line.push(this.hash(payload, row, col) % 2 === 0);
      }

      matrix.push(line);
    }

    return matrix;
  };

  /** Hash determinista (djb2) de tres valores. */
  private hash(value: string, row: number, col: number): number {
    let hash = 5381;
    const source = `${value}:${row}:${col}`;

    for (let i = 0; i < source.length; i++) {
      hash = (hash * 33) ^ source.charCodeAt(i);
    }

    return Math.abs(hash);
  }
}
