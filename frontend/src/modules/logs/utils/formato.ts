export const fechaLog = (valor: string) => new Date(valor).toLocaleString('es-BO', { timeZone: 'America/La_Paz' });
export const duracionLog = (valor: number) => `${valor.toLocaleString('es', { maximumFractionDigits: 2 })} ms`;
