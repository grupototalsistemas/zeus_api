import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateFornecedorDto, QueryFornecedorDto } from '../dto/fornecedor.dto';

@Injectable()
export class FornecedoresService {
  constructor(private prisma: PrismaService) {}

  private cleanCnpj(cnpj: string): string {
    return cnpj.replace(/[^\d]/g, '');
  }

  async create(createFornecedorDto: CreateFornecedorDto[]) {
    const sucessos: any[] = [];
    const erros: any[] = [];
    const total = createFornecedorDto.length;

    // Processa cada DTO dentro de uma transação
    return await this.prisma.$transaction(async (tx) => {
      for (const dto of createFornecedorDto) {
        const cleanCnpj = this.cleanCnpj(dto.cnpj);

        // 1. Verifica duplicidade
        const existing = await tx.pessoasJuridicas.findFirst({
          where: { situacao: 1, cnpj: cleanCnpj },
        });

        if (existing) {
          erros.push({ ...dto, erro: 'CNPJ duplicado' });
          continue;
        }

        // 2. Cria pessoa base
        const pessoa = await tx.pessoas.create({
          data: {
            id_pessoa_origem: 2, // Cartório
            id_pessoa_tipo: 5, // Fornecedor
            pessoa: 1, // Fornecedor
            codigo: '',
            motivo: `Cadastro automático da empresa com CNPJ: ${cleanCnpj}`,
          },
        });

        if (!pessoa?.id) {
          erros.push({ ...dto, erro: 'Erro ao criar pessoa' });
          continue;
        }

        // 3. Atualiza código se vazio
        if (!pessoa.codigo || pessoa.codigo.trim().length === 0) {
          const updated = await tx.pessoas.update({
            where: { id: pessoa.id },
            data: { codigo: String(pessoa.id) },
          });

          if (!updated?.id) {
            erros.push({
              ...dto,
              erro: 'Erro ao atualizar codigo da pessoa',
            });
            continue;
          }

          pessoa.codigo = updated.codigo;
        }

        // 4. Cria empresa
        const {
          id_pessoa_juridica_empresa,
          codigo,
          endereco,
          contato,
          adicional,
          ...rest
        } = dto;
        const created_empresa = await tx.pessoasJuridicas.create({
          data: {
            ...rest,
            id_pessoa: pessoa.id,
            cnpj: cleanCnpj,
            razao_social: rest.razao_social?.toUpperCase(),
            nome_fantasia: rest.nome_fantasia?.toUpperCase() || null,
          },
        });

        if (!created_empresa?.id) {
          erros.push({ ...dto, erro: 'Erro ao criar empresa' });
          continue;
        }

        // 5. Cria vínculo (empresa base ↔ filial)
        const vinculo = await tx.pessoasJuridicasJuridicas.create({
          data: {
            id_pessoa_juridica_empresa: Number(id_pessoa_juridica_empresa),
            id_pessoa_juridica_filial: Number(created_empresa.id),
          },
        });

        if (!vinculo?.id_pessoa_juridica_empresa) {
          erros.push({
            ...dto,
            erro: 'Erro ao criar vínculo empresa-filial',
          });
          continue;
        }

        // 6. Processa endereços de forma síncrona
        const enderecosCriados: any[] = [];
        if (dto.endereco && Array.isArray(dto.endereco)) {
          for (const endereco of dto.endereco) {
            try {
              const { id_pessoa_endereco_tipo, id_pessoa, ...result } =
                endereco;
              const created_endereco = await tx.pessoasEnderecos.create({
                data: {
                  ...result,
                  id_pessoa: Number(pessoa.id),
                  id_pessoa_endereco_tipo: Number(id_pessoa_endereco_tipo),
                },
              });
              enderecosCriados.push(created_endereco);
            } catch (error: any) {
              console.error('Erro ao criar endereço:', error);
              erros.push({
                ...dto,
                erro: `Erro ao criar endereço: ${error.message || 'Erro desconhecido'}`,
              });
            }
          }
        }

        // 7. Processa contatos de forma síncrona
        const contatosCriados: any[] = [];
        if (dto.contato && Array.isArray(dto.contato)) {
          for (const contato of dto.contato) {
            try {
              const { id_pessoa, ...result } = contato;
              const created_contato = await tx.pessoasContatos.create({
                data: {
                  ...result,
                  id_pessoa: Number(pessoa.id),
                },
              });
              contatosCriados.push(created_contato);
            } catch (error: any) {
              console.error('Erro ao criar contato:', error.message || error);
              erros.push({
                ...dto,
                erro: `Erro ao criar contato: ${error.message || 'Erro desconhecido'}`,
              });
            }
          }
        }

        // 8. Processa adicionais de forma síncrona
        const adicionaisCriados: any[] = [];
        if (dto.adicional && Array.isArray(dto.adicional)) {
          for (const adicional of dto.adicional) {
            try {
              const created_adicional = await tx.pessoasDadosAdicionais.create({
                data: {
                  id_pessoa_dado_adicional_tipo: Number(
                    adicional.id_pessoa_dado_adicional_tipo,
                  ),
                  descricao: adicional.descricao,
                  id_pessoa: Number(pessoa.id),
                },
              });
              adicionaisCriados.push(created_adicional);
            } catch (error: any) {
              console.error('Erro ao criar adicional:', error);
              erros.push({
                ...dto,
                erro: `Erro ao criar adicional: ${error.message || 'Erro desconhecido'}`,
              });
            }
          }
        }

        sucessos.push({
          pessoas: pessoa,
          empresas: created_empresa,
          vinculos: vinculo,
          ...(enderecosCriados.length > 0 && { enderecos: enderecosCriados }),
          ...(contatosCriados.length > 0 && { contatos: contatosCriados }),
          ...(adicionaisCriados.length > 0 && {
            adicionais: adicionaisCriados,
          }),
        });
      }

      return {
        sucessos,
        erros,
        total,
      };
    });
  }

  isCNPJValid(cnpj: string) {
    // Remove caracteres especiais
    const cleanCNPJ = cnpj.replace(/[^\d]/g, '');

    // Verifica se tem 14 dígitos
    if (cleanCNPJ.length !== 14) {
      return false;
    }

    // Verifica se todos os dígitos são iguais (caso inválido)
    if (/^(\d)\1+$/.test(cleanCNPJ)) {
      return false;
    }

    // Validação do primeiro dígito verificador
    let soma = 0;
    let peso = 5;
    for (let i = 0; i < 12; i++) {
      soma += parseInt(cleanCNPJ[i]) * peso;
      peso = peso === 2 ? 9 : peso - 1;
    }
    const digito1 = soma % 11 < 2 ? 0 : 11 - (soma % 11);

    // Validação do segundo dígito verificador
    soma = 0;
    peso = 6;
    for (let i = 0; i < 13; i++) {
      soma += parseInt(cleanCNPJ[i]) * peso;
      peso = peso === 2 ? 9 : peso - 1;
    }
    const digito2 = soma % 11 < 2 ? 0 : 11 - (soma % 11);

    // Verifica se os dígitos calculados são iguais aos dígitos informados
    return (
      parseInt(cleanCNPJ[12]) === digito1 && parseInt(cleanCNPJ[13]) === digito2
    );
  }

  async findAll(query: QueryFornecedorDto) {
    const {
      cnpj,
      filial_principal,
      razao_social,
      nome_fantasia,
      id_pessoa_fisica_responsavel,
      id_pessoa_juridica_empresa,
      insc_estadual,
      insc_municipal,
    } = query;
    const orConditions: any[] = [];
    console.log('Query recebida:', query);
    // Monta condições dinâmicas para o OR
    if (cnpj) orConditions.push({ cnpj: cnpj });
    if (filial_principal === 1 || filial_principal === 0)
      orConditions.push({ filial_principal: filial_principal });
    if (razao_social)
      orConditions.push({
        razao_social: { contains: razao_social, mode: 'insensitive' },
      });
    if (nome_fantasia)
      orConditions.push({
        nome_fantasia: { contains: nome_fantasia, mode: 'insensitive' },
      });
    if (id_pessoa_fisica_responsavel)
      orConditions.push({
        id_pessoa_fisica_responsavel: Number(id_pessoa_fisica_responsavel),
      });
    if (insc_estadual) orConditions.push({ insc_estadual: insc_estadual });
    if (insc_municipal) orConditions.push({ insc_municipal: insc_municipal });

    // Verifica se foi fornecido o id_pessoa_juridica_empresa
    if (id_pessoa_juridica_empresa) {
      try {
        const empresas = await this.prisma.pessoasJuridicasJuridicas.findMany({
          where: {
            id_pessoa_juridica_empresa: Number(id_pessoa_juridica_empresa),
            situacao: 1,
          },
        });

        if (empresas.length === 0) {
          throw new NotFoundException('Nenhuma empresa encontrado.');
        }
        const ids = empresas.map((e) => e.id_pessoa_juridica_filial);
        orConditions.push({ id: { in: ids } });
      } catch (error) {
        throw new InternalServerErrorException(
          'Erro ao buscar empresas vinculadas',
        );
      }
    } else {
      throw new BadRequestException('Empresa não foi fornecida.');
    }

    if (orConditions.length > 0) {
      const result = await this.prisma.pessoasJuridicas.findMany({
        where: {
          situacao: 1,
          pessoa: { situacao: 1, id_pessoa_tipo: 5, id_pessoa_origem: 2 },
          AND: orConditions,
        },
        include: {
          pessoa: {
            include: {
              pessoaTipo: true,
              pessoaOrigem: true,
              pessoasContatos: true,
              pessoasEnderecos: true,
              pessoasDadosAdicionais: true,
            },
          },
        },
      });
      console.log('Resultado da consulta:', result);
      return result;
    } else {
      throw new BadRequestException('Nenhuma condição foi fornecida.');
    }
  }

  async findAllwhithCartorio(query: QueryFornecedorDto) {
    const {
      cnpj,
      filial_principal,
      razao_social,
      nome_fantasia,
      id_pessoa_fisica_responsavel,
      id_pessoa_juridica_empresa,
      insc_estadual,
      insc_municipal,
    } = query;

    const orConditions: any[] = [];
    let empresa_principal;

    // Monta condições dinâmicas para o OR
    if (cnpj) orConditions.push({ cnpj: cnpj });
    if (filial_principal === 1 || filial_principal === 0)
      orConditions.push({ filial_principal: filial_principal });
    if (razao_social)
      orConditions.push({
        razao_social: { contains: razao_social, mode: 'insensitive' },
      });
    if (nome_fantasia)
      orConditions.push({
        nome_fantasia: { contains: nome_fantasia, mode: 'insensitive' },
      });
    if (id_pessoa_fisica_responsavel)
      orConditions.push({
        id_pessoa_fisica_responsavel: Number(id_pessoa_fisica_responsavel),
      });
    if (insc_estadual) orConditions.push({ insc_estadual: insc_estadual });
    if (insc_municipal) orConditions.push({ insc_municipal: insc_municipal });

    // Verifica se foi fornecido o id_pessoa_juridica_empresa
    if (id_pessoa_juridica_empresa) {
      empresa_principal = await this.prisma.pessoasJuridicas.findUniqueOrThrow({
        where: {
          id: Number(id_pessoa_juridica_empresa),
        },
        include: {
          pessoa: {
            omit: {
              chave: true,
              senha: true,
            },
          },
        },
      });
      const empresas = await this.prisma.pessoasJuridicasJuridicas.findMany({
        where: {
          id_pessoa_juridica_empresa: Number(id_pessoa_juridica_empresa),
        },
      });

      const ids = empresas.map((e) => e.id_pessoa_juridica_filial);
      orConditions.push({ id: { in: ids } });
    } else {
      throw new BadRequestException('Empresa não foi fornecida.');
    }

    if (orConditions.length > 0) {
      const result = await this.prisma.pessoasJuridicas.findMany({
        where: {
          situacao: 1,
          pessoa: { situacao: 1, id_pessoa_tipo: 5, id_pessoa_origem: 2 },
          AND: orConditions,
        },
        include: {
          pessoa: {
            include: {
              pessoasContatos: true,
              pessoasEnderecos: true,
              pessoasDadosAdicionais: true,
            },
          },
        },
      });
      if (result.length === 0 && !empresa_principal) {
        throw new NotFoundException('Nenhuma empresa encontrado.');
      }
      // adicionando a empresa principal
      // result.unshift(empresa_principal);
      return result;
    } else {
      throw new BadRequestException('Nenhuma condição foi fornecida.');
    }
  }

  async findOne(id: number) {
    const empresa = await this.prisma.pessoasJuridicas.findUnique({
      where: {
        id,
        situacao: 1,
        pessoa: { situacao: 1, id_pessoa_tipo: 5, id_pessoa_origem: 2 },
      },
      include: {
        pessoa: true,
      },
    });
    if (!empresa) throw new NotFoundException('Fornecedor não encontrado');
    return empresa;
  }

  async update(id: number, dto: Partial<CreateFornecedorDto>) {
    // Busca a empresa, atraves de outro endpoint
    // const empresa = await this.findOne(id);

    const empresa = await this.prisma.pessoasJuridicas.findUnique({
      where: {
        id,
        situacao: 1,
        pessoa: { situacao: 1, id_pessoa_tipo: 5, id_pessoa_origem: 2 },
      },
      include: {
        pessoa: true,
      },
    });

    if (!empresa) throw new NotFoundException('Fornecedor não encontrado');

    // Normaliza CNPJ se vier no update
    if (dto.cnpj) dto.cnpj = dto.cnpj.replace(/[^\d]/g, '');

    // Separa campos que pertencem a tabelas diferentes
    const {
      id_pessoa_juridica_empresa, // Não pertence a nenhuma tabela (apenas usado no create)
      codigo, // Pertence à tabela 'pessoas'
      ...pessoasJuridicasData // Campos que pertencem à tabela 'pessoas_juridicas'
    } = dto;

    // Prepara dados para atualização
    const updateData: any = {
      ...pessoasJuridicasData,
    };

    // Se houver campo 'codigo', atualiza através do relacionamento 'pessoa'
    if (codigo !== undefined) {
      updateData.pessoa = {
        update: {
          codigo,
        },
      };
    }

    return this.prisma.pessoasJuridicas.update({
      where: {
        id: empresa.id,
        situacao: 1,
        pessoa: { situacao: 1, id_pessoa_tipo: 5, id_pessoa_origem: 2 },
      },
      data: updateData,
      include: {
        pessoa: true,
      },
    });
  }

  async remove(id: number, motivo: string) {
    // Busca a empresa para validação
    const empresa = await this.prisma.pessoasJuridicas.findUnique({
      where: { id },
      include: { pessoa: true },
    });

    if (!empresa) {
      throw new NotFoundException('Fornecedor não encontrado');
    }

    // Verifica se está ativo (situacao = 1)
    if (empresa.situacao !== 1) {
      throw new BadRequestException('Fornecedor já está desativado');
    }

    // Verifica se não é registro global (id = -1)
    if (Number(empresa.id) === -1) {
      throw new BadRequestException(
        'Nao e permitido remover registros globais (pessoa = -1)',
      );
    }

    try {
      // Validação de tipo e conteúdo do motivo
      if (!motivo || typeof motivo !== 'string' || motivo.trim().length === 0) {
        throw new BadRequestException('Motivo é obrigatório para remoção.');
      }
      await this.prisma.$transaction([
        // 1. Atualiza a empresa principal
        this.prisma.pessoasJuridicas.update({
          where: {
            id: empresa.id,
          },
          data: {
            situacao: 0,
            motivo,
            updatedAt: new Date(),
          },
        }),

        // 2. Atualiza relacionamentos filial/empresa
        // CORRETO: usando id_pessoa_juridica_empresa OU id_pessoa_juridica_filial
        this.prisma.pessoasJuridicasJuridicas.updateMany({
          where: {
            OR: [{ id_pessoa_juridica_filial: empresa.id }],
            situacao: 1,
          },
          data: {
            situacao: 0,
            motivo,
            updatedAt: new Date(),
          },
        }),

        // 3. Atualiza a pessoa vinculada
        this.prisma.pessoas.update({
          where: {
            id: empresa.id_pessoa,
          },
          data: {
            situacao: 0,
            motivo,
            updatedAt: new Date(),
          },
        }),
      ]);

      return { message: 'Fornecedor removida com sucesso' };
    } catch (error: any) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Erro ao remover empresa: ${error.message}`,
      );
    }
  }

  async findAllComChamados(id: number, query: QueryFornecedorDto) {
    const totalSistemasId = 1;
    try {
      query.id_pessoa_juridica_empresa = id;
      const vinculobase = await this.prisma.pessoasJuridicasJuridicas.findMany({
        where: {
          id_pessoa_juridica_empresa: Number(totalSistemasId),
          situacao: 1,
        },
      });
      if (vinculobase.length === 0) {
        throw new NotFoundException(
          'Nenhum fornecedor encontrado para a empresa fornecida.',
        );
      }

      const forncedoresComChamados = vinculobase.map(async (vinculos) => {
        const fornecedores = await this.prisma.pessoasJuridicas.findMany({
          where: {
            situacao: 1,
            id: vinculos.id_pessoa_juridica_filial,
          },
        });

        const fornecedoresComChamados = await Promise.all(
          fornecedores.map(async (fornecedor) => {
            const chamados = await this.prisma.chamado.findMany({
              where: {
                id_pessoa_juridica: fornecedor.id,
                situacao: 1,
              },
              include: {
                sistema: true,
              },
            });
            return { ...fornecedor, chamados };
          }),
        );
        return fornecedoresComChamados;
      });
      const result = await Promise.all(forncedoresComChamados);

      return result.flat();
    } catch (error: any) {
      throw new InternalServerErrorException(
        `Erro ao buscar fornecedores com chamados: ${error.message}`,
      );
    }
  }
}
