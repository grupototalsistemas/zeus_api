import { BadRequestException } from '@nestjs/common';

export class DateUtils {
  static formatDate(date: Date | null | undefined): string | null {
    if (!date) return null;

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  /**
   * Converte string para Date, suportando múltiplos formatos
   */
  static parseDate(dateString: string | null | undefined): Date | null {
    if (!dateString) return null;

    try {
      const cleanDate = dateString.toString().trim();

      // Formato brasileiro DD/MM/YYYY
      if (cleanDate.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
        const [dia, mes, ano] = cleanDate.split('/');
        return new Date(Date.UTC(Number(ano), Number(mes) - 1, Number(dia)));
      }

      // Formato ISO YYYY-MM-DD
      if (cleanDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return new Date(cleanDate + 'T00:00:00.000Z');
      }

      // Tenta converter diretamente
      const date = new Date(cleanDate);
      return isNaN(date.getTime()) ? null : date;
    } catch {
      return null;
    }
  }

  static parseDate2(dateString: string): Date {
    const cleanDate = dateString.toString().trim();

    // Formato brasileiro DD/MM/YYYY
    if (cleanDate.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      const [dia, mes, ano] = cleanDate.split('/');
      return new Date(Date.UTC(Number(ano), Number(mes) - 1, Number(dia)));
    }

    // Formato ISO YYYY-MM-DD
    if (cleanDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return new Date(cleanDate);
    }

    // Tenta converter diretamente
    const date = new Date(cleanDate);
    return isNaN(date.getTime()) ? new Date() : date;
  }

  private parseDateBrToISO(dateBr: string): Date {
    // Espera algo como '01/08/2025'
    const [day, month, year] = dateBr.split('/').map(Number);

    // Garante data válida
    if (!day || !month || !year) {
      throw new BadRequestException(
        'Data de referência inválida. Use o formato DD/MM/AAAA.',
      );
    }

    // Cria data em UTC sem deslocamento de timezone
    return new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
  }

  /**
   * ✅ CORRIGIDO: Retorna Date completo com data e hora atuais no fuso de Brasília
   */
  static getCurrentDateTime(): Date {
    // Método mais direto para garantir horário de Brasília
    const now = new Date();
    const brasiliaOffset = -3; // GMT-3 para Brasília
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const brasiliaTime = new Date(utc + brasiliaOffset * 3600000);

    return brasiliaTime;
  }

  /**
   * ✅ ALTERNATIVA: Usa Intl para garantir fuso de Brasília
   */
  static getCurrentDateTimeBrasilia(): Date {
    return new Date(
      new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }),
    );
  }

  /**
   * ✅ ATUALIZADO: Retorna hora atual no formato HH:mm:ss no fuso de Brasília
   */
  static getCurrentTime(): string {
    // Usa o horário de Brasília
    const now = new Date().toLocaleString('en-US', {
      timeZone: 'America/Sao_Paulo',
    });
    const brasiliaDate = new Date(now);

    const hora = String(brasiliaDate.getHours()).padStart(2, '0');
    const min = String(brasiliaDate.getMinutes()).padStart(2, '0');
    const seg = String(brasiliaDate.getSeconds()).padStart(2, '0');
    return `${hora}:${min}:${seg}`;
  }

  /**
   * ✅ ATUALIZADO: Combina data específica com hora atual de Brasília
   * Para casos onde você quer uma data específica mas com hora atual de Brasília
   */
  static combineDateWithCurrentTime(date: Date): Date {
    // Pega hora atual de Brasília
    const nowBrasilia = new Date().toLocaleString('en-US', {
      timeZone: 'America/Sao_Paulo',
    });
    const brasiliaTime = new Date(nowBrasilia);

    const combinedDate = new Date(date);
    combinedDate.setHours(brasiliaTime.getHours());
    combinedDate.setMinutes(brasiliaTime.getMinutes());
    combinedDate.setSeconds(brasiliaTime.getSeconds());
    combinedDate.setMilliseconds(brasiliaTime.getMilliseconds());

    return combinedDate;
  }

  /**
   * ✅ MELHORADO: Obtém data/hora atual de Brasília de forma mais confiável
   */
  static getBrasiliaDateTime(): Date {
    const brasiliaTime = new Date().toLocaleString('en-US', {
      timeZone: 'America/Sao_Paulo',
    });
    return new Date(brasiliaTime);
  }

  /**
   * ✅ NOVO: Converte string de hora HH:mm:ss para string validada
   * Usado para campos do tipo "time without time zone" no PostgreSQL
   */
  static parseTime(timeString: string | null | undefined): string | null {
    if (!timeString) return null;

    const cleanTime = timeString.toString().trim();

    // Formato HH:mm:ss
    if (cleanTime.match(/^\d{2}:\d{2}:\d{2}$/)) {
      const [hora, min, seg] = cleanTime.split(':').map(Number);

      // Valida ranges
      if (
        hora >= 0 &&
        hora <= 23 &&
        min >= 0 &&
        min <= 59 &&
        seg >= 0 &&
        seg <= 59
      ) {
        return cleanTime;
      }
    }

    // Formato HH:mm (adiciona :00 no final)
    if (cleanTime.match(/^\d{2}:\d{2}$/)) {
      const [hora, min] = cleanTime.split(':').map(Number);

      if (hora >= 0 && hora <= 23 && min >= 0 && min <= 59) {
        return `${cleanTime}:00`;
      }
    }

    return null;
  }

  /**
   * ✅ NOVO: Retorna hora atual no formato HH:mm:ss
   */

  /**
   * ✅ NOVO: Valida e normaliza hora para salvar no banco
   * Retorna string HH:mm:ss ou hora atual se inválido
   */
  static parseTimeOrCurrent(timeString: string | null | undefined): string {
    const parsed = this.parseTime(timeString);
    return parsed ?? this.getCurrentTime();
  }

  /**
   * ✅ NOVO: Converte string de hora (HH:mm:ss) para DateTime
   * Combina a hora fornecida com a data especificada
   * Preserva a hora exata informada (cria em UTC para evitar conversão de timezone)
   */
  static parseTimeToDateTime(
    timeString: string,
    baseDate: Date = new Date(),
  ): Date {
    // Valida e extrai componentes da hora
    const timeRegex = /^(\d{2}):(\d{2}):(\d{2})$/;
    const match = timeString.match(timeRegex);

    if (!match) {
      throw new BadRequestException(
        `Formato de hora inválido: ${timeString}. Use HH:mm:ss.`,
      );
    }

    const [, hours, minutes, seconds] = match;

    // Extrai ano, mês e dia da data base
    const year = baseDate.getFullYear();
    const month = baseDate.getMonth();
    const day = baseDate.getDate();

    // Cria a data em UTC para preservar a hora exata informada
    // Isso evita que o Prisma/PostgreSQL faça conversão de timezone
    const result = new Date(
      Date.UTC(
        year,
        month,
        day,
        parseInt(hours, 10),
        parseInt(minutes, 10),
        parseInt(seconds, 10),
        0,
      ),
    );

    return result;
  }

  /**
   * ✅ NOVO: Valida hora e lança exceção se inválida
   */
  static parseTimeStrict(timeString: string): string {
    if (!timeString) {
      throw new BadRequestException('Hora inválida.');
    }

    const parsed = this.parseTime(timeString);

    if (!parsed) {
      throw new BadRequestException(
        `Formato de hora inválido: ${timeString}. Use HH:mm:ss ou HH:mm.`,
      );
    }

    return parsed;
  }

  static formatarData(data: Date): string {
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    return `${dia}/${mes}/${ano}`;
  }

  static formataStringData(data: string): string {
    const dia = String(data.slice(8, 10));
    const mes = String(data.slice(5, 7));
    const ano = data.slice(0, 4);
    return `${dia}/${mes}/${ano}`;
  }

  static formatarDataISO(date: Date): string {
    return date.toISOString().split('T')[0]; // YYYY-MM-DD
  }

  static formataStringDataBR(data: string): string {
    if (!data) return '';

    // Se vier DD/MM/YYYY → converte para YYYY-MM-DD
    if (data.includes('/')) {
      const [dia, mes, ano] = data.split('/');
      return `${ano}-${mes}-${dia}`;
    }

    // Se vier YYYY-MM-DD → já está certo
    if (data.includes('-')) {
      return data;
    }

    return data;
  }

  /**
   * Converte datas em um objeto
   */
  static parseObjectDates<T>(obj: T, dateFields: string[]): T {
    if (!obj || typeof obj !== 'object') return obj;

    const result = { ...obj } as any;

    dateFields.forEach((field) => {
      if (result[field] !== undefined && result[field] !== null) {
        result[field] = this.parseDate(result[field]);
      }
    });

    return result;
  }

  /**
   * Converte string para Date aceitando formatos dd/mm/yyyy ou variações
   * Retorna data no formato local (sem conversão UTC) para evitar problemas de timezone
   */
  static parseDateString(dateStr: string): Date {
    if (!dateStr) {
      throw new BadRequestException('Data inválida.');
    }

    // Aceita d/m/yy, dd/mm/yyyy, dd/m/yy, etc.
    const regex = /^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})$/;
    const match = dateStr.match(regex);

    if (!match) {
      throw new BadRequestException(
        `Formato de data inválido: ${dateStr}. Use dd/mm/yyyy (ou variações como d/m/yy).`,
      );
    }

    let [_, dia, mes, ano] = match;

    // Converte 2 dígitos de ano para completo (ex: 24 → 2024)
    if (ano.length === 2) {
      const anoNum = Number(ano);
      ano = String(anoNum < 50 ? 2000 + anoNum : 1900 + anoNum);
    }

    const diaNum = Number(dia);
    const mesNum = Number(mes) - 1;
    const anoNum = Number(ano);

    // Cria string no formato ISO para garantir que a data seja interpretada como local
    const isoStr = `${anoNum}-${String(mesNum + 1).padStart(2, '0')}-${String(diaNum).padStart(2, '0')}`;
    const date = new Date(isoStr + 'T00:00:00');

    // Validação extra: data realmente existente
    if (
      date.getFullYear() !== anoNum ||
      date.getMonth() !== mesNum ||
      date.getDate() !== diaNum
    ) {
      throw new BadRequestException(`Data inválida: ${dateStr}`);
    }

    return date;
  }

  static verificacaoDatas(
    data_inicial?: string,
    data_final?: string,
  ): { dataInicio: Date; dataFim: Date } {
    if (data_final && !data_inicial) {
      throw new BadRequestException(
        'Se informar data_final, é obrigatório informar data_inicial.',
      );
    }

    if (data_inicial && data_final) {
      const dataInicio = DateUtils.parseDateString(data_inicial);
      const dataFim = DateUtils.parseDateString(data_final);
      if (dataInicio > dataFim) {
        throw new BadRequestException(
          'Data inicial nao pode ser maior que data final.',
        );
      }
    }

    const dataInicio = data_inicial
      ? DateUtils.parseDateString(data_inicial)
      : new Date(new Date().setDate(new Date().getDate() - 30));
    const dataFim = data_final
      ? DateUtils.parseDateString(data_final)
      : new Date();

    return { dataInicio, dataFim };
  }

  /**
   * ✅ NOVO: Combina data específica com hora específica
   */
  static combineDateWithTime(date: Date, timeString: string): Date {
    const parsedTime = this.parseTime(timeString);
    if (!parsedTime) {
      throw new BadRequestException(`Formato de hora inválido: ${timeString}`);
    }

    const [hours, minutes, seconds] = parsedTime.split(':').map(Number);
    const combinedDate = new Date(date);

    combinedDate.setHours(hours);
    combinedDate.setMinutes(minutes);
    combinedDate.setSeconds(seconds);
    combinedDate.setMilliseconds(0);

    return combinedDate;
  }

  /**
   * ✅ TESTE: Função para debug de horários
   */
  static testTimeZones(): any {
    const now = new Date();
    const utcTime = now.toISOString();
    const localTime = now.toString();
    const brasiliaTime1 = new Date().toLocaleString('en-US', {
      timeZone: 'America/Sao_Paulo',
    });
    const brasiliaTime2 = this.getCurrentDateTimeBrasilia();

    return {
      utc: utcTime,
      local: localTime,
      brasilia_locale: brasiliaTime1,
      brasilia_calculated: brasiliaTime2,
      current_time_method: this.getCurrentTime(),
    };
  }
}
