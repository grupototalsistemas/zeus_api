import { Transform } from 'class-transformer';

export function TransformDate(format: 'string' | 'date' = 'date') {
  return Transform(({ value }) => {
    if (!value) return null;

    // Se já for uma data, converte para o formato desejado
    if (value instanceof Date) {
      if (format === 'string') {
        const day = value.getDate().toString().padStart(2, '0');
        const month = (value.getMonth() + 1).toString().padStart(2, '0');
        const year = value.getFullYear();
        return `${day}/${month}/${year}`;
      }
      return value;
    }

    // Se for string no formato dd/mm/yyyy
    if (typeof value === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
      const [dia, mes, ano] = value.split('/');
      const date = new Date(`${ano}-${mes}-${dia}`);

      if (isNaN(date.getTime())) {
        return null;
      }

      return format === 'string' ? value : date;
    }

    return null;
  });
}
