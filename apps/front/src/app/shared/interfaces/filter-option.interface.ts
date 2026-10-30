export interface FilterOption {
  value: string;
  label: string;
  /**
   * Color del punto que acompaña a la opción.
   *
   * El punto identifica la disciplina de un vistazo (fútbol verde, pádel
   * azul, basket naranja). Las opciones sin punto son las neutras
   * ("Todos").
   */
  dotColor?: string;
}
