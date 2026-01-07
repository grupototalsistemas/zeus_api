import { BadRequestException, Injectable } from '@nestjs/common';
import * as forge from 'node-forge';
import { PrismaService } from 'src/prisma/prisma.service';

export interface CertificateInfo {
  commonName: string;
  cpf?: string;
  cnpj?: string;
  email: string;
  serialNumber: string;
  issuer: string;
  validFrom: Date;
  validTo: Date;
  isValid: boolean;
}

@Injectable()
export class CertificateService {
  constructor(private prisma: PrismaService) {}

  /**
   * Valida um certificado digital - retorna apenas boolean
   */
  validateCertificate(certificateString: string): boolean {
    try {
      const cleanCert = certificateString.trim();

      // Se for JSON
      try {
        const certData = JSON.parse(cleanCert);
        const now = new Date();
        const validFrom = new Date(certData.validityStart);
        const validTo = new Date(certData.validityEnd);

        return now >= validFrom && now <= validTo;
      } catch {
        // Não é JSON, continua para PEM/Base64
      }

      // Se for PEM/Base64
      const certificate = this.parseCertificate(cleanCert);
      const now = new Date();
      return (
        now >= certificate.validity.notBefore &&
        now <= certificate.validity.notAfter
      );
    } catch (error) {
      console.error('Erro ao validar certificado:', error);
      return false;
    }
  }

  /**
   * Extrai dados do certificado para comparação com usuário
   */
  extractCertificateData(certificateString: string): CertificateInfo {
    try {
      const cleanCert = certificateString.trim();

      // Verifica se é um JSON (certificado já processado)
      try {
        JSON.parse(cleanCert);

        return this.extractCertificateDataFromJson(cleanCert);
      } catch (jsonError) {
        // Se não conseguiu fazer parse como JSON, continua para certificado raw
      }

      // Se não é JSON, processa como certificado raw
      const certificate = this.parseCertificate(cleanCert);
      return this.extractCertificateInfo(certificate);
    } catch (error) {
      console.error('Erro ao extrair dados do certificado:', error);
      throw new BadRequestException('Certificado inválido ou corrompido');
    }
  }

  /**
   * Extrai dados do certificado a partir do JSON já processado
   */
  private extractCertificateDataFromJson(
    certificateJson: string,
  ): CertificateInfo {
    try {
      const certData = JSON.parse(certificateJson);

      const now = new Date();
      const validFrom = new Date(certData.validityStart);
      const validTo = new Date(certData.validityEnd);
      const isValid = now >= validFrom && now <= validTo;

      return {
        commonName: certData.subjectName || '',
        cpf: certData.pkiBrazil?.cpf || undefined,
        cnpj: certData.pkiBrazil?.cnpj || undefined,
        email: certData.email || '',
        serialNumber: certData.thumbprint || '', // Usando thumbprint como identificador único
        issuer: certData.issuerName || '',
        validFrom,
        validTo,
        isValid,
      };
    } catch (error) {
      console.error('Erro ao processar JSON do certificado:', error);
      throw new BadRequestException('JSON do certificado inválido');
    }
  }

  /**
   * Busca usuário pelo certificado
   */
  async findUserByCertificate(certInfo: CertificateInfo): Promise<any> {
    let user;

    // Busca por CPF
    if (certInfo.cpf) {
      user = await this.prisma.pessoasFisica.findFirst({
        where: {
          cpf: certInfo.cpf,
          situacao: 1,
        },
      });
    }

    // Se não encontrou por CPF, busca por CNPJ
    if (!user && certInfo.cnpj) {
      user = await this.prisma.pessoasJuridicas.findFirst({
        where: {
          cnpj: certInfo.cnpj,
          situacao: 1,
        },
      });
    }

    // Se não encontrou por documento, busca por email
    if (!user && certInfo.email) {
      user = await this.prisma.pessoasUsuarios.findFirst({
        where: {
          login: certInfo.email,
          situacao: 1,
        },
      });
    }

    return user;
  }

  /**
   * Faz o parse do certificado a partir da string
   */
  private parseCertificate(certificateString: string): forge.pki.Certificate {
    try {
      const cleanCert = certificateString.trim();

      // 1. PEM
      if (cleanCert.includes('-----BEGIN CERTIFICATE-----')) {
        return forge.pki.certificateFromPem(cleanCert);
      }

      // 2. Base64
      try {
        const der = forge.util.decode64(cleanCert);
        return forge.pki.certificateFromAsn1(forge.asn1.fromDer(der));
      } catch (base64Err) {
        // Não é base64 válido
      }

      // 3. Hex DER
      try {
        return forge.pki.certificateFromAsn1(forge.asn1.fromDer(cleanCert));
      } catch (derErr) {
        // Não é DER válido
      }

      throw new Error(
        'Formato de certificado não suportado: esperado PEM ou base64/DER',
      );
    } catch (error) {
      console.error('Erro parseCertificate:', error);
      throw new Error('Formato de certificado não suportado');
    }
  }

  /**
   * Extrai informações do certificado
   */
  private extractCertificateInfo(
    certificate: forge.pki.Certificate,
  ): CertificateInfo {
    const now = new Date();
    const validFrom = certificate.validity.notBefore;
    const validTo = certificate.validity.notAfter;
    const isValid = now >= validFrom && now <= validTo;

    // Extrai informações do subject
    const subject = certificate.subject;
    const commonName =
      this.getAttributeValue(subject.attributes, 'commonName') || '';
    const email =
      this.getAttributeValue(subject.attributes, 'emailAddress') || '';

    // Extrai CPF/CNPJ do certificado
    let cpf: string | undefined;
    let cnpj: string | undefined;

    // Busca CPF/CNPJ no commonName
    const cpfMatch = commonName.match(/(\d{11})/);
    const cnpjMatch = commonName.match(/(\d{14})/);

    if (cpfMatch && this.isCPF(cpfMatch[1])) {
      cpf = cpfMatch[1];
    }
    if (cnpjMatch && this.isCNPJ(cnpjMatch[1])) {
      cnpj = cnpjMatch[1];
    }

    return {
      commonName,
      cpf,
      cnpj,
      email,
      serialNumber: certificate.serialNumber,
      issuer:
        this.getAttributeValue(certificate.issuer.attributes, 'commonName') ||
        '',
      validFrom,
      validTo,
      isValid,
    };
  }

  /**
   * Obtém valor de um atributo do subject/issuer
   */
  private getAttributeValue(
    attributes: any[],
    attributeName: string,
  ): string | null {
    const attr = attributes.find((a) => a.name === attributeName);
    return attr ? (attr.value as string) : null;
  }

  /**
   * Valida se é um CPF válido
   */
  private isCPF(value: string): boolean {
    const cpf = value.replace(/\D/g, '');
    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf[i]) * (10 - i);
    }
    let digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    if (parseInt(cpf[9]) !== digit) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf[i]) * (11 - i);
    }
    digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    return parseInt(cpf[10]) === digit;
  }

  /**
   * Valida se é um CNPJ válido
   */
  private isCNPJ(value: string): boolean {
    const cnpj = value.replace(/\D/g, '');
    if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) return false;

    const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(cnpj[i]) * weights1[i];
    }
    let digit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (parseInt(cnpj[12]) !== digit) return false;

    sum = 0;
    for (let i = 0; i < 13; i++) {
      sum += parseInt(cnpj[i]) * weights2[i];
    }
    digit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    return parseInt(cnpj[13]) === digit;
  }
}
