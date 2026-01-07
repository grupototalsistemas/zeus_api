import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { DateUtils } from 'src/common/utils/date.utils';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePessoaDto, UpdatePessoaDto } from '../dto/pessoa.dto';

@Injectable()
export class PessoasService {
  constructor(
    private prisma: PrismaService,
    private dateUtils: DateUtils,
  ) {}

  async create(createPessoaDto: CreatePessoaDto) {
    const { pessoas } = createPessoaDto;

    return this.prisma.$transaction(async (tx) => {
      const resultados: Array<{ message: string; id: number; codigo: string }> =
        [];

      for (const pessoaData of pessoas) {
        const {
          pessoa,
          fisica,
          juridica,
          id_pessoa_tipo,
          id_pessoa_origem,
          codigo,
          situacao,
          enderecos,
          contatos,
          dados_adicionais,
        } = pessoaData;

        // 1️⃣ Cria pessoa base
        const pessoaBase = await tx.pessoas.create({
          data: {
            id_pessoa_tipo: id_pessoa_tipo, // garante que não é undefined
            id_pessoa_origem: id_pessoa_origem ?? 1, // fallback caso undefined
            pessoa,
            codigo,
            situacao: situacao ?? 1,
          },
        });

        const pessoaId = Number(pessoaBase.id);

        // 2️⃣ Cria pessoa física (se enviada)
        if (fisica) {
          const fisicaComDatas = DateUtils.parseObjectDates(fisica, [
            'doc_data_emissao',
            'data_nascimento',
          ]);

          await tx.pessoasFisica.create({
            data: {
              id_pessoa: pessoaId,
              cpf: fisica.cpf,
              nome_registro: fisica.nome_registro,
              nome_social: fisica.nome_social || '',
              id_pessoa_genero: fisica.id_pessoa_genero,
              id_pessoa_estado_civil: fisica.id_pessoa_estado_civil,
              cpf_justificativa: fisica.cpf_justificativa,
              doc_numero: fisica.doc_numero || null,
              doc_emissor: fisica.doc_emissor || null,
              doc_data_emissao: fisicaComDatas.doc_data_emissao || null,
              nacionalidade: fisica.nacionalidade || null,
              naturalidade: fisica.naturalidade || null,
              data_nascimento: fisicaComDatas.data_nascimento || null,
            },
          });
        }

        // 3️⃣ Cria pessoa jurídica (se enviada) com pessoas_fisicas
        if (juridica) {
          let pfResponsavelId: number | null = null;

          // Se há uma pessoa física no mesmo cadastro, usa ela como responsável
          if (fisica) {
            const pfCriada = await tx.pessoasFisica.findFirst({
              where: { id_pessoa: pessoaId },
            });
            if (pfCriada) pfResponsavelId = Number(pfCriada.id);
          }

          // Se foi especificado um responsável específico, busca e valida
          if (juridica.id_pessoa_fisica_responsavel) {
            const pf = await tx.pessoasFisica.findUnique({
              where: { id: juridica.id_pessoa_fisica_responsavel },
            });
            if (!pf) {
              throw new NotFoundException(
                'Pessoa física responsável não encontrada',
              );
            }
            pfResponsavelId = Number(pf.id);
          }

          const dataJuridica: any = {
            id_pessoa: pessoaId,
            cnpj: juridica.cnpj,
            razao_social: juridica.razao_social ?? null,
            nome_fantasia: juridica.nome_fantasia ?? null,
            insc_estadual: juridica.insc_estadual ?? null,
            insc_municipal: juridica.insc_municipal ?? null,
            filial_principal: juridica.filial_principal ?? 0,
            situacao: juridica.situacao ?? 1,
            motivo: juridica.motivo ?? null,
          };

          // Só adiciona o campo se pfResponsavelId não for null
          if (pfResponsavelId !== null) {
            dataJuridica.id_pessoa_fisica_responsavel = pfResponsavelId;
          }

          await tx.pessoasJuridicas.create({ data: dataJuridica });

          // 3.1️⃣ Cria pessoas físicas associadas à jurídica (se enviadas)
          if (juridica.pessoas_fisicas && juridica.pessoas_fisicas.length > 0) {
            for (const pfData of juridica.pessoas_fisicas) {
              await this.createPessoaFisicaCompleta(tx, pfData, pessoaId);
            }
          }
        }

        // 4️⃣ Cria endereços da pessoa principal (se enviados)
        if (enderecos && enderecos.length > 0) {
          await this.createEnderecos(tx, pessoaId, enderecos);
        }

        // 5️⃣ Cria contatos da pessoa principal (se enviados)
        if (contatos && contatos.length > 0) {
          await this.createContatos(tx, pessoaId, contatos);
        }

        // 6️⃣ Cria dados adicionais da pessoa principal (se enviados)
        if (dados_adicionais && dados_adicionais.length > 0) {
          await this.createDadosAdicionais(tx, pessoaId, dados_adicionais);
        }

        resultados.push({
          message: 'Pessoa cadastrada com sucesso',
          id: pessoaId,
          codigo: codigo,
        });
      }

      return resultados;
    });
  }

  // 🔧 Métodos auxiliares para criação de entidades relacionadas
  private async createPessoaFisicaCompleta(
    tx: any,
    pfData: any,
    idPessoaJuridica: number,
  ) {
    const {
      pessoa,
      fisica,
      id_pessoa_tipo,
      id_pessoa_origem,
      codigo,
      situacao,
      enderecos,
      contatos,
      dados_adicionais,
    } = pfData;

    // Cria pessoa base para a física
    const pessoaBase = await tx.pessoas.create({
      data: {
        id_pessoa_tipo,
        id_pessoa_origem,
        pessoa,
        codigo,
        situacao: situacao ?? 1,
      },
    });

    const pessoaId = Number(pessoaBase.id);

    // Cria dados físicos
    if (fisica) {
      const fisicaComDatas = DateUtils.parseObjectDates(fisica, [
        'doc_data_emissao',
        'data_nascimento',
      ]);

      await tx.pessoasFisica.create({
        data: {
          id_pessoa: pessoaId,
          cpf: fisica.cpf,
          nome_registro: fisica.nome_registro,
          nome_social: fisica.nome_social || '',
          id_pessoa_genero: fisica.id_pessoa_genero,
          id_pessoa_estado_civil: fisica.id_pessoa_estado_civil,
          cpf_justificativa: fisica.cpf_justificativa,
          doc_numero: fisica.doc_numero || null,
          doc_emissor: fisica.doc_emissor || null,
          doc_data_emissao: fisicaComDatas.doc_data_emissao || null,
          nacionalidade: fisica.nacionalidade || null,
          naturalidade: fisica.naturalidade || null,
          data_nascimento: fisicaComDatas.data_nascimento || null,
        },
      });
    }

    // Cria endereços da pessoa física
    if (enderecos && enderecos.length > 0) {
      await this.createEnderecos(tx, pessoaId, enderecos);
    }

    // Cria contatos da pessoa física
    if (contatos && contatos.length > 0) {
      await this.createContatos(tx, pessoaId, contatos);
    }

    // Cria dados adicionais da pessoa física
    if (dados_adicionais && dados_adicionais.length > 0) {
      await this.createDadosAdicionais(tx, pessoaId, dados_adicionais);
    }

    return pessoaId;
  }

  private async createEnderecos(tx: any, pessoaId: number, enderecos: any[]) {
    const enderecosData = enderecos.map((end) => ({
      id_pessoa: pessoaId,
      id_pessoa_endereco_tipo: end.id_pessoa_endereco_tipo,
      logradouro: end.logradouro,
      endereco: end.endereco,
      numero: end.numero ?? null,
      complemento: end.complemento ?? null,
      bairro: end.bairro,
      municipio: end.municipio,
      municipio_ibge: end.municipio_ibge ?? null,
      estado: end.estado,
      cep: end.cep,
    }));

    await tx.pessoasEnderecos.createMany({ data: enderecosData });
  }

  private async createContatos(tx: any, pessoaId: number, contatos: any[]) {
    const contatosData = contatos.map((cont) => ({
      id_pessoa: pessoaId,
      id_pessoa_contato_tipo: cont.id_pessoa_contato_tipo,
      descricao: cont.descricao,
    }));

    await tx.pessoasContatos.createMany({ data: contatosData });
  }

  private async createDadosAdicionais(
    tx: any,
    pessoaId: number,
    dados_adicionais: any[],
  ) {
    const adicionaisData = dados_adicionais.map((dado) => ({
      id_pessoa: pessoaId,
      id_pessoa_dado_adicional_tipo: dado.id_pessoa_dado_adicional_tipo,
      descricao: dado.descricao,
    }));

    await tx.pessoasDadosAdicionais.createMany({ data: adicionaisData });
  }

  // 📊 Métodos de consulta (CORRIGIDOS com nomes exatos do schema)
  // 🔍 Métodos de consulta corrigidos
  async findAll() {
    const pessoas = await this.prisma.pessoas.findMany({
      include: {
        pessoaFisica: { include: { genero: true, estadoCivil: true } },
        pessoaJuridica: true, // PJ
        pessoasEnderecos: { include: { enderecoTipo: true } },
        pessoasContatos: { include: { contatoTipo: true } },
        pessoasDadosAdicionais: { include: { dadoAdicionalTipo: true } },
        pessoaTipo: true,
        pessoaOrigem: true,
      },
    });

    const resultado: any[] = [];

    for (const p of pessoas) {
      const base: any = {
        pessoa: Number(p.id),
        id_pessoa_tipo: Number(p.id_pessoa_tipo),
        id_pessoa_origem: Number(p.id_pessoa_origem),
        codigo: p.codigo,
        situacao: p.situacao,
      };

      // Pessoa Física
      if (p.pessoaFisica) {
        base['fisica'] = {
          cpf: p.pessoaFisica.cpf,
          nome_registro: p.pessoaFisica.nome_registro,
          nome_social: p.pessoaFisica.nome_social,
          id_pessoa_genero: Number(p.pessoaFisica.id_pessoa_genero),
          id_pessoa_estado_civil: Number(p.pessoaFisica.id_pessoa_estado_civil),
          cpf_justificativa: p.pessoaFisica.cpf_justificativa,
          doc_numero: p.pessoaFisica.doc_numero,
          doc_emissor: p.pessoaFisica.doc_emissor,
          doc_data_emissao: p.pessoaFisica.doc_data_emissao,
          nacionalidade: p.pessoaFisica.nacionalidade,
          naturalidade: p.pessoaFisica.naturalidade,
          data_nascimento: p.pessoaFisica.data_nascimento,
        };
      }

      // Pessoa Jurídica (objeto único)
      if (p.pessoaJuridica?.length) {
        const pj = p.pessoaJuridica[0];

        const pjObj: any = {
          cnpj: pj.cnpj,
          razao_social: pj.razao_social,
          nome_fantasia: pj.nome_fantasia,
          id_pessoa_fisica_responsavel: pj.id_pessoa_fisica_responsavel,
          insc_estadual: pj.insc_estadual,
          insc_municipal: pj.insc_municipal,
          filial_principal: pj.filial_principal,
          situacao: pj.situacao,
          motivo: pj.motivo,
        };

        // Pessoas físicas vinculadas à PJ
        if (pj.id_pessoa_fisica_responsavel) {
          const pessoasFisicas = await this.prisma.pessoas.findMany({
            where: { id: pj.id_pessoa_fisica_responsavel },
            include: {
              pessoaFisica: { include: { genero: true, estadoCivil: true } },
              pessoasEnderecos: { include: { enderecoTipo: true } },
              pessoasContatos: { include: { contatoTipo: true } },
              pessoasDadosAdicionais: { include: { dadoAdicionalTipo: true } },
            },
          });

          pjObj['pessoas_fisicas'] = pessoasFisicas.map((pf) => ({
            pessoa: Number(pf.id),
            id_pessoa_tipo: Number(pf.id_pessoa_tipo),
            id_pessoa_origem: Number(pf.id_pessoa_origem),
            codigo: pf.codigo,
            situacao: pf.situacao,
            fisica: pf.pessoaFisica
              ? {
                  cpf: pf.pessoaFisica.cpf,
                  nome_registro: pf.pessoaFisica.nome_registro,
                  nome_social: pf.pessoaFisica.nome_social,
                  id_pessoa_genero: Number(pf.pessoaFisica.id_pessoa_genero),
                  id_pessoa_estado_civil: Number(
                    pf.pessoaFisica.id_pessoa_estado_civil,
                  ),
                  cpf_justificativa: pf.pessoaFisica.cpf_justificativa,
                  doc_numero: pf.pessoaFisica.doc_numero,
                  doc_emissor: pf.pessoaFisica.doc_emissor,
                  doc_data_emissao: pf.pessoaFisica.doc_data_emissao,
                  nacionalidade: pf.pessoaFisica.nacionalidade,
                  naturalidade: pf.pessoaFisica.naturalidade,
                  data_nascimento: pf.pessoaFisica.data_nascimento,
                }
              : null,
            enderecos: pf.pessoasEnderecos?.map((e) => ({
              id_pessoa_endereco_tipo: e.id_pessoa_endereco_tipo,
              logradouro: e.logradouro,
              endereco: e.endereco,
              numero: e.numero,
              complemento: e.complemento,
              bairro: e.bairro,
              municipio: e.municipio,
              municipio_ibge: e.municipio_ibge,
              estado: e.estado,
              cep: e.cep,
            })),
            contatos: pf.pessoasContatos?.map((c) => ({
              id_pessoa_contato_tipo: c.id_pessoa_contato_tipo,
              descricao: c.descricao,
            })),
            dados_adicionais: pf.pessoasDadosAdicionais?.map((d) => ({
              id_pessoa_dado_adicional_tipo: d.id_pessoa_dado_adicional_tipo,
              descricao: d.descricao,
            })),
          }));
        }

        base['juridica'] = pjObj;
      }

      // Endereços, contatos e dados adicionais da pessoa principal
      base['enderecos'] = p.pessoasEnderecos?.map((e) => ({
        id_pessoa_endereco_tipo: e.id_pessoa_endereco_tipo,
        logradouro: e.logradouro,
        endereco: e.endereco,
        numero: e.numero,
        complemento: e.complemento,
        bairro: e.bairro,
        municipio: e.municipio,
        municipio_ibge: e.municipio_ibge,
        estado: e.estado,
        cep: e.cep,
      }));

      base['contatos'] = p.pessoasContatos?.map((c) => ({
        id_pessoa_contato_tipo: c.id_pessoa_contato_tipo,
        descricao: c.descricao,
      }));

      base['dados_adicionais'] = p.pessoasDadosAdicionais?.map((d) => ({
        id_pessoa_dado_adicional_tipo: d.id_pessoa_dado_adicional_tipo,
        descricao: d.descricao,
      }));

      resultado.push(base);
    }

    return { pessoas: resultado };
  }

  async findOne(id: number) {
    const p = await this.prisma.pessoas.findUnique({
      where: { id },
      include: {
        pessoaFisica: { include: { genero: true, estadoCivil: true } },
        pessoaJuridica: true,
        pessoasEnderecos: { include: { enderecoTipo: true } },
        pessoasContatos: { include: { contatoTipo: true } },
        pessoasDadosAdicionais: { include: { dadoAdicionalTipo: true } },
        pessoaTipo: true,
        pessoaOrigem: true,
      },
    });

    if (!p) return null;

    const base: any = {
      pessoa: Number(p.id),
      id_pessoa_tipo: Number(p.id_pessoa_tipo),
      id_pessoa_origem: Number(p.id_pessoa_origem),
      codigo: p.codigo,
      situacao: p.situacao,
    };

    // Pessoa Física
    if (p.pessoaFisica) {
      base['fisica'] = {
        cpf: p.pessoaFisica.cpf,
        nome_registro: p.pessoaFisica.nome_registro,
        nome_social: p.pessoaFisica.nome_social,
        id_pessoa_genero: Number(p.pessoaFisica.id_pessoa_genero),
        id_pessoa_estado_civil: Number(p.pessoaFisica.id_pessoa_estado_civil),
        cpf_justificativa: p.pessoaFisica.cpf_justificativa,
        doc_numero: p.pessoaFisica.doc_numero,
        doc_emissor: p.pessoaFisica.doc_emissor,
        doc_data_emissao: p.pessoaFisica.doc_data_emissao,
        nacionalidade: p.pessoaFisica.nacionalidade,
        naturalidade: p.pessoaFisica.naturalidade,
        data_nascimento: p.pessoaFisica.data_nascimento,
      };
    }

    // Pessoa Jurídica (objeto único)
    if (p.pessoaJuridica?.length) {
      const pj = p.pessoaJuridica[0];

      const pjObj: any = {
        cnpj: pj.cnpj,
        razao_social: pj.razao_social,
        nome_fantasia: pj.nome_fantasia,
        id_pessoa_fisica_responsavel: pj.id_pessoa_fisica_responsavel,
        insc_estadual: pj.insc_estadual,
        insc_municipal: pj.insc_municipal,
        filial_principal: pj.filial_principal,
        situacao: pj.situacao,
        motivo: pj.motivo,
      };

      // Pessoas físicas vinculadas à PJ
      if (pj.id_pessoa_fisica_responsavel) {
        const pessoasFisicas = await this.prisma.pessoas.findMany({
          where: { id: pj.id_pessoa_fisica_responsavel },
          include: {
            pessoaFisica: { include: { genero: true, estadoCivil: true } },
            pessoasEnderecos: { include: { enderecoTipo: true } },
            pessoasContatos: { include: { contatoTipo: true } },
            pessoasDadosAdicionais: { include: { dadoAdicionalTipo: true } },
          },
        });

        pjObj['pessoas_fisicas'] = pessoasFisicas.map((pf) => ({
          pessoa: Number(pf.id),
          id_pessoa_tipo: Number(pf.id_pessoa_tipo),
          id_pessoa_origem: Number(pf.id_pessoa_origem),
          codigo: pf.codigo,
          situacao: pf.situacao,
          fisica: pf.pessoaFisica
            ? {
                cpf: pf.pessoaFisica.cpf,
                nome_registro: pf.pessoaFisica.nome_registro,
                nome_social: pf.pessoaFisica.nome_social,
                id_pessoa_genero: Number(pf.pessoaFisica.id_pessoa_genero),
                id_pessoa_estado_civil: Number(
                  pf.pessoaFisica.id_pessoa_estado_civil,
                ),
                cpf_justificativa: pf.pessoaFisica.cpf_justificativa,
                doc_numero: pf.pessoaFisica.doc_numero,
                doc_emissor: pf.pessoaFisica.doc_emissor,
                doc_data_emissao: pf.pessoaFisica.doc_data_emissao,
                nacionalidade: pf.pessoaFisica.nacionalidade,
                naturalidade: pf.pessoaFisica.naturalidade,
                data_nascimento: pf.pessoaFisica.data_nascimento,
              }
            : null,
          enderecos: pf.pessoasEnderecos?.map((e) => ({
            id_pessoa_endereco_tipo: e.id_pessoa_endereco_tipo,
            logradouro: e.logradouro,
            endereco: e.endereco,
            numero: e.numero,
            complemento: e.complemento,
            bairro: e.bairro,
            municipio: e.municipio,
            municipio_ibge: e.municipio_ibge,
            estado: e.estado,
            cep: e.cep,
          })),
          contatos: pf.pessoasContatos?.map((c) => ({
            id_pessoa_contato_tipo: c.id_pessoa_contato_tipo,
            descricao: c.descricao,
          })),
          dados_adicionais: pf.pessoasDadosAdicionais?.map((d) => ({
            id_pessoa_dado_adicional_tipo: d.id_pessoa_dado_adicional_tipo,
            descricao: d.descricao,
          })),
        }));
      }

      base['juridica'] = pjObj;
    }

    // Endereços, contatos e dados adicionais da pessoa principal
    base['enderecos'] = p.pessoasEnderecos?.map((e) => ({
      id_pessoa_endereco_tipo: e.id_pessoa_endereco_tipo,
      logradouro: e.logradouro,
      endereco: e.endereco,
      numero: e.numero,
      complemento: e.complemento,
      bairro: e.bairro,
      municipio: e.municipio,
      municipio_ibge: e.municipio_ibge,
      estado: e.estado,
      cep: e.cep,
    }));

    base['contatos'] = p.pessoasContatos?.map((c) => ({
      id_pessoa_contato_tipo: c.id_pessoa_contato_tipo,
      descricao: c.descricao,
    }));

    base['dados_adicionais'] = p.pessoasDadosAdicionais?.map((d) => ({
      id_pessoa_dado_adicional_tipo: d.id_pessoa_dado_adicional_tipo,
      descricao: d.descricao,
    }));

    return base;
  }

  async update(id: number, updatePessoaDto: UpdatePessoaDto) {
    const pessoa = await this.prisma.pessoas.findUnique({
      where: { id: Number(id) },
      include: {
        pessoaJuridica: true,
        pessoasEnderecos: true,
        pessoasContatos: true,
        pessoasDadosAdicionais: true,
      },
    });

    if (!pessoa) throw new NotFoundException('Pessoa não encontrada');

    const { pessoas } = updatePessoaDto;
    if (!pessoas || pessoas.length === 0)
      throw new BadRequestException('Nenhum dado para atualizar');

    const pessoaData = pessoas[0];

    return await this.prisma.$transaction(async (tx) => {
      // Atualiza pessoa básica
      await tx.pessoas.update({
        where: { id: Number(id) },
        data: {
          codigo: pessoaData.codigo ?? pessoa.codigo,
          situacao: pessoaData.situacao ?? pessoa.situacao,
        },
      });

      // Atualiza pessoa jurídica
      if (pessoaData.juridica) {
        const pj = pessoa.pessoaJuridica[0]; // assume apenas 1 PJ
        if (pj) {
          await tx.pessoasJuridicas.update({
            where: { id: pj.id },
            data: {
              cnpj: pessoaData.juridica.cnpj ?? pj.cnpj,
              razao_social: pessoaData.juridica.razao_social ?? pj.razao_social,
              nome_fantasia:
                pessoaData.juridica.nome_fantasia ?? pj.nome_fantasia,
              id_pessoa_fisica_responsavel:
                pessoaData.juridica.id_pessoa_fisica_responsavel ??
                pj.id_pessoa_fisica_responsavel,
              insc_estadual:
                pessoaData.juridica.insc_estadual ?? pj.insc_estadual,
              insc_municipal:
                pessoaData.juridica.insc_municipal ?? pj.insc_municipal,
              filial_principal:
                pessoaData.juridica.filial_principal ?? pj.filial_principal,
              situacao: pessoaData.juridica.situacao ?? pj.situacao,
              motivo: pessoaData.juridica.motivo ?? pj.motivo,
            },
          });

          // Atualiza pessoas físicas vinculadas à PJ
          if (pessoaData.juridica.pessoas_fisicas?.length) {
            for (const pfData of pessoaData.juridica.pessoas_fisicas) {
              const pf = await tx.pessoas.findUnique({
                where: { id: pfData.pessoa },
              });
              if (pf) {
                await tx.pessoas.update({
                  where: { id: pf.id },
                  data: {
                    codigo: pfData.codigo ?? pf.codigo,
                    situacao: pfData.situacao ?? pf.situacao,
                  },
                });

                if (pfData.fisica) {
                  const fisicaData = pfData.fisica;

                  // Converte datas usando DateUtils
                  const data_nascimento = DateUtils.parseDate(
                    fisicaData.data_nascimento,
                  );
                  const doc_data_emissao = DateUtils.parseDate(
                    fisicaData.doc_data_emissao,
                  );

                  // Remove campos undefined
                  const updateFisicaData: any = {};
                  if (fisicaData.cpf) updateFisicaData.cpf = fisicaData.cpf;
                  if (fisicaData.nome_registro)
                    updateFisicaData.nome_registro = fisicaData.nome_registro;
                  if (fisicaData.nome_social)
                    updateFisicaData.nome_social = fisicaData.nome_social;
                  if (fisicaData.id_pessoa_genero)
                    updateFisicaData.id_pessoa_genero =
                      fisicaData.id_pessoa_genero;
                  if (fisicaData.id_pessoa_estado_civil)
                    updateFisicaData.id_pessoa_estado_civil =
                      fisicaData.id_pessoa_estado_civil;
                  if (fisicaData.cpf_justificativa !== undefined)
                    updateFisicaData.cpf_justificativa =
                      fisicaData.cpf_justificativa;
                  if (fisicaData.doc_numero)
                    updateFisicaData.doc_numero = fisicaData.doc_numero;
                  if (fisicaData.doc_emissor)
                    updateFisicaData.doc_emissor = fisicaData.doc_emissor;
                  if (doc_data_emissao)
                    updateFisicaData.doc_data_emissao = doc_data_emissao;
                  if (fisicaData.nacionalidade)
                    updateFisicaData.nacionalidade = fisicaData.nacionalidade;
                  if (fisicaData.naturalidade)
                    updateFisicaData.naturalidade = fisicaData.naturalidade;
                  if (data_nascimento)
                    updateFisicaData.data_nascimento = data_nascimento;

                  if (Object.keys(updateFisicaData).length > 0) {
                    await tx.pessoasFisica.update({
                      where: { id_pessoa: pf.id },
                      data: updateFisicaData,
                    });
                  }
                }
              }
            }
          }
        }
      }

      // Atualiza endereços (upsert)
      if (pessoaData.enderecos?.length) {
        for (const e of pessoaData.enderecos) {
          await tx.pessoasEnderecos.upsert({
            where: { id: e.id ?? 0 }, // se id não existe, cria novo
            update: { ...e },
            create: { ...e, id_pessoa: Number(id) },
          });
        }
      }

      // Atualiza contatos (upsert)
      if (pessoaData.contatos?.length) {
        for (const c of pessoaData.contatos) {
          await tx.pessoasContatos.upsert({
            where: { id: c.id ?? 0 },
            update: { ...c },
            create: { ...c, id_pessoa: Number(id) },
          });
        }
      }

      // Atualiza dados adicionais (upsert)
      if (pessoaData.dados_adicionais?.length) {
        for (const d of pessoaData.dados_adicionais) {
          await tx.pessoasDadosAdicionais.upsert({
            where: { id: d.id ?? 0 },
            update: { ...d },
            create: { ...d, id_pessoa: Number(id) },
          });
        }
      }

      return { message: 'Atualização realizada com sucesso' };
    });
  }

  async remove(id: number, motivo: string) {
    const pessoa = await this.prisma.pessoas.findUnique({
      where: { id: Number(id) },
    });

    if (!pessoa) throw new NotFoundException('Pessoa não encontrada');

    // Verifica se está ativo (situacao = 1)
    if (pessoa.situacao !== 1) {
      throw new BadRequestException('Pessoa já está desativada');
    }

    // Verifica se não é registro global (id = -1)
    if (Number(pessoa.id) === -1) {
      throw new BadRequestException(
        'Nao e permitido remover registros globais (pessoa = -1)',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      // Atualiza situacao = 0 em todas as tabelas relacionadas
      await tx.pessoasDadosAdicionais.updateMany({
        where: { id_pessoa: Number(id) },
        data: {
          situacao: 0,
          motivo: motivo,
          updatedAt: new Date(),
        },
      });

      await tx.pessoasContatos.updateMany({
        where: { id_pessoa: Number(id) },
        data: {
          situacao: 0,
          motivo: motivo,
          updatedAt: new Date(),
        },
      });

      await tx.pessoasEnderecos.updateMany({
        where: { id_pessoa: Number(id) },
        data: {
          situacao: 0,
          motivo: motivo,
          updatedAt: new Date(),
        },
      });

      await tx.pessoasJuridicas.updateMany({
        where: { id_pessoa: Number(id) },
        data: {
          situacao: 0,
          motivo: motivo,
          updatedAt: new Date(),
        },
      });

      await tx.pessoasFisica.updateMany({
        where: { id_pessoa: Number(id) },
        data: {
          situacao: 0,
          motivo: motivo,
          updatedAt: new Date(),
        },
      });

      // Atualiza também o registro principal
      await tx.pessoas.update({
        where: { id: Number(id) },
        data: {
          situacao: 0,
          motivo: motivo,
          updatedAt: new Date(),
        },
      });

      return { message: 'Pessoa inativada com sucesso' };
    });
  }

  findFisicaByCpf(cpf: string) {
    return this.prisma.pessoasFisica.findFirst({
      where: { cpf },
      include: {
        pessoa: {
          include: {
            pessoasEnderecos: {
              include: {
                enderecoTipo: true,
              },
            },
            pessoasContatos: {
              include: {
                contatoTipo: true,
              },
            },
            pessoasDadosAdicionais: {
              include: {
                dadoAdicionalTipo: true,
              },
            },
          },
        },
        genero: true,
        estadoCivil: true,
      },
    });
  }

  findJuridicaByCnpj(cnpj: string) {
    return this.prisma.pessoasJuridicas.findFirst({
      where: { cnpj },
      include: {
        pessoa: {
          include: {
            pessoasEnderecos: {
              include: {
                enderecoTipo: true,
              },
            },
            pessoasContatos: {
              include: {
                contatoTipo: true,
              },
            },
            pessoasDadosAdicionais: {
              include: {
                dadoAdicionalTipo: true,
              },
            },
          },
        },
        // Para buscar o responsável, fazer consulta separada
      },
    });
  }

  // 🔍 Método auxiliar para buscar pessoa física responsável
  private async findPessoaFisicaResponsavel(idPessoaFisica: number) {
    if (!idPessoaFisica) return null;

    return this.prisma.pessoasFisica.findUnique({
      where: { id: idPessoaFisica },
      include: {
        pessoa: true,
      },
    });
  }
}
