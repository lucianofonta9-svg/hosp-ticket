export interface Ticket {
  id: string;
  fechaCreacion: Date;
  fechaCierre?: Date; // El ? significa que puede no estar (si sigue abierto)
  sector: string;
  descripcion: string;
  tecnicoAsignado: string;
  estado: 'PENDIENTE' | 'EN_PROCESO' | 'RESUELTO';
}