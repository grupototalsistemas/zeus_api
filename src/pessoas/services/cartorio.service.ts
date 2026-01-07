import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateCartorioDto,
  DeleteCartorioDto,
  QueryCartorioDto,
  UpdateCartorioDto,
} from '../dto/cartorio.dto';

@Injectable()
export class CartorioService {
  constructor(private prisma: PrismaService) {}

  /**
   * Cria um novo cartório com todas as validações necessárias
   * @param createCartorioDto - Dados completos do cartório
   * @returns Cartório criado
   */
  async create(createCartorioDto: CreateCartorioDto) {
    try {
      // 1. Validar formato CNPJ
      if (!this.validarFormatoCNPJ(createCartorioDto.pessoa_juridica.cnpj)) {
        throw new BadRequestException('Formato de CNPJ inválido');
      }

      // 2. Validar formato CPF
      if (!this.validarFormatoCPF(createCartorioDto.responsavel.cpf)) {
        throw new BadRequestException('Formato de CPF inválido');
      }

      // 3. Validar CNPJ único
      const cnpjLimpo = createCartorioDto.pessoa_juridica.cnpj.replace(
        /[^\d]/g,
        '',
      );

      const cnpjExiste = await this.prisma.pessoasJuridicas.findFirst({
        where: {
          cnpj: cnpjLimpo,
          situacao: 1,
        },
      });

      if (cnpjExiste) {
        throw new BadRequestException(
          `CNPJ ${createCartorioDto.pessoa_juridica.cnpj} já está cadastrado`,
        );
      }

      // 4. Validar CPF único do responsável
      const cpfLimpo = createCartorioDto.responsavel.cpf.replace(/[^\d]/g, '');

      const cpfExiste = await this.prisma.pessoasFisica.findFirst({
        where: {
          cpf: cpfLimpo,
          situacao: 1,
        },
      });

      if (cpfExiste) {
        throw new BadRequestException(
          `CPF ${createCartorioDto.responsavel.cpf} já está cadastrado`,
        );
      }

      // 5. Criar em transação
      const resultado = await this.prisma.$transaction(async (tx) => {
        // 5.1 Criar pessoa jurídica (cartório)
        const pessoaJuridica = await tx.pessoas.create({
          data: {
            id_pessoa_tipo: 2, // Matriz
            id_pessoa_origem: 2, // 1 - api; 2 - app
            pessoa: 1, // 1 - Pessoa Jurídica; 0 - Pessoa Física
            codigo: createCartorioDto.codigo || null,
            situacao: 1,
          },
        });

        // 5.4 Criar pessoa física (responsável)
        const pessoaFisica = await tx.pessoas.create({
          data: {
            id_pessoa_tipo: 6,
            id_pessoa_origem: 2, // 1 - api; 2 - app
            pessoa: 0, // 1 - Pessoa Jurídica; 0 - Pessoa Física
            codigo: null,
            situacao: 1,
          },
        });

        const cartorio = await tx.pessoasJuridicas.create({
          data: {
            id_pessoa: pessoaJuridica.id,
            cnpj: cnpjLimpo,
            id_pessoa_fisica_responsavel: -1, // Temporário, será atualizado depois
            razao_social: createCartorioDto.pessoa_juridica.razao_social,
            nome_fantasia: createCartorioDto.pessoa_juridica.nome_fantasia,
            insc_estadual: createCartorioDto.pessoa_juridica.insc_estadual,
            insc_municipal: createCartorioDto.pessoa_juridica.insc_municipal,
            filial_principal:
              createCartorioDto.pessoa_juridica.filial_principal ?? 1,
            situacao: 1,
          },
        });

        // 5.2 Criar endereços do cartório
        if (createCartorioDto.pessoa_juridica.enderecos?.length) {
          for (const endereco of createCartorioDto.pessoa_juridica.enderecos) {
            await tx.pessoasEnderecos.create({
              data: {
                id_pessoa: pessoaJuridica.id,
                id_pessoa_endereco_tipo: endereco.id_pessoa_endereco_tipo,
                logradouro: endereco.logradouro,
                endereco: endereco.endereco,
                numero: endereco.numero,
                complemento: endereco.complemento,
                bairro: endereco.bairro,
                municipio: endereco.municipio,
                municipio_ibge: endereco.municipio_ibge,
                estado: endereco.estado,
                cep: endereco.cep,
                situacao: 1,
              },
            });
          }
        }

        // 5.3 Criar contatos do cartório
        if (createCartorioDto.pessoa_juridica.contatos?.length) {
          for (const contato of createCartorioDto.pessoa_juridica.contatos) {
            await tx.pessoasContatos.create({
              data: {
                id_pessoa: pessoaJuridica.id,
                id_pessoa_contato_tipo: contato.id_pessoa_contato_tipo,
                descricao: contato.descricao,
                situacao: 1,
              },
            });
          }
        }

        if (createCartorioDto.pessoa_juridica.adicionais?.length) {
          for (const adicional of createCartorioDto.pessoa_juridica
            .adicionais) {
            await tx.pessoasDadosAdicionais.create({
              data: {
                id_pessoa: pessoaJuridica.id,
                id_pessoa_dado_adicional_tipo:
                  adicional.id_pessoa_dado_adicional_tipo,
                descricao: adicional.descricao,
                situacao: 1,
              },
            });
          }
        }

        const responsavel = await tx.pessoasFisica.create({
          data: {
            id_pessoa: pessoaFisica.id,
            cpf: cpfLimpo,
            cpf_justificativa: createCartorioDto.responsavel.cpf_justificativa,
            nome_registro: createCartorioDto.responsavel.nome_registro,
            nome_social: createCartorioDto.responsavel.nome_social,
            id_pessoa_genero: createCartorioDto.responsavel.id_pessoa_genero,
            id_pessoa_estado_civil:
              createCartorioDto.responsavel.id_pessoa_estado_civil,
            doc_numero: createCartorioDto.responsavel.doc_numero,
            doc_emissor: createCartorioDto.responsavel.doc_emissor,
            doc_data_emissao:
              createCartorioDto.responsavel.doc_data_emissao?.trim().length
                ? new Date(createCartorioDto.responsavel.doc_data_emissao)
                : null,
            nacionalidade: createCartorioDto.responsavel.nacionalidade,
            naturalidade: createCartorioDto.responsavel.naturalidade,
            data_nascimento: createCartorioDto.responsavel.data_nascimento
              ? new Date(createCartorioDto.responsavel.data_nascimento)
              : null,
            situacao: 1,
          },
        });

        // 5.5 Criar endereços do responsável
        if (createCartorioDto.responsavel.enderecos?.length) {
          for (const endereco of createCartorioDto.responsavel.enderecos) {
            await tx.pessoasEnderecos.create({
              data: {
                id_pessoa: pessoaFisica.id,
                id_pessoa_endereco_tipo: endereco.id_pessoa_endereco_tipo,
                logradouro: endereco.logradouro,
                endereco: endereco.endereco,
                numero: endereco.numero,
                complemento: endereco.complemento,
                bairro: endereco.bairro,
                municipio: endereco.municipio,
                municipio_ibge: endereco.municipio_ibge,
                estado: endereco.estado,
                cep: endereco.cep,
                situacao: 1,
              },
            });
          }
        }

        // 5.6 Criar contatos do responsável
        if (createCartorioDto.responsavel.contatos?.length) {
          for (const contato of createCartorioDto.responsavel.contatos) {
            await tx.pessoasContatos.create({
              data: {
                id_pessoa: pessoaFisica.id,
                id_pessoa_contato_tipo: contato.id_pessoa_contato_tipo,
                descricao: contato.descricao,
                situacao: 1,
              },
            });
          }
        }

        if (createCartorioDto.responsavel.adicionais?.length) {
          for (const adicional of createCartorioDto.responsavel.adicionais) {
            await tx.pessoasDadosAdicionais.create({
              data: {
                id_pessoa: pessoaFisica.id,
                id_pessoa_dado_adicional_tipo:
                  adicional.id_pessoa_dado_adicional_tipo,
                descricao: adicional.descricao,
                situacao: 1,
              },
            });
          }
        }

        // 5.7 Vincular responsável ao cartório
        await tx.pessoasJuridicasFisicas.create({
          data: {
            id_pessoa_juridica: cartorio.id,
            id_pessoa_fisica: responsavel.id,
            id_pessoa_juridica_perfil: 2, // 1- Master, 2- Administrador
            juridica_principal: 1,
            situacao: 1,
          },
        });

        // 5.7 Vincular cartório a empresa base
        await tx.pessoasJuridicasJuridicas.create({
          data: {
            id_pessoa_juridica_empresa: 1,
            id_pessoa_juridica_filial: cartorio.id,
            situacao: 1,
          },
        });

        // 5.8 Criar usuário do cartório
        const codigoLogin = createCartorioDto.codigo || `CART${cartorio.id}`;
        await tx.pessoasUsuarios.create({
          data: {
            id_pessoa_fisica: responsavel.id,
            nome_login: 'ADMINISTRADOR',
            login: `admin${codigoLogin.toLowerCase()}@gmail.com`,
            situacao: 1,
          },
        });

        // 5.8 Vincular sistema ao cartório
        await tx.pessoasJuridicasSistemas.create({
          data: {
            id_pessoa_juridica: cartorio.id,
            id_sistema: 2, //Gerencial
            situacao: 1,
          },
        });

        // 5.8 Atualizar pessoa jurídica com ID do responsável
        await tx.pessoasJuridicas.update({
          where: { id: cartorio.id },
          data: {
            id_pessoa_fisica_responsavel: Number(responsavel.id),
          },
        });

        return {
          cartorio,
          responsavel,
          pessoa_juridica: pessoaJuridica,
          pessoa_fisica: pessoaFisica,
        };
      });

      return {
        success: true,
        message: 'Cartório cadastrado com sucesso',
        data: {
          id: resultado.cartorio.id,
          id_pessoa: resultado.cartorio.id_pessoa,
          cnpj: createCartorioDto.pessoa_juridica.cnpj,
          razao_social: resultado.cartorio.razao_social,
          nome_fantasia: resultado.cartorio.nome_fantasia,
          codigo: createCartorioDto.codigo,
          responsavel: {
            id: resultado.responsavel.id,
            nome_registro: resultado.responsavel.nome_registro,
            cpf: createCartorioDto.responsavel.cpf,
          },
        },
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        `Erro ao cadastrar cartório: ${error.message}`,
      );
    }
  }

  /**
   * Lista todos os cartórios com filtros
   * @param query - Filtros de busca
   * @returns Lista de cartórios
   */
  async findAll(query: QueryCartorioDto) {
    try {
      const { cnpj, razao_social, codigo, situacao = 1 } = query;

      const whereConditions: any = {
        situacao: situacao,
        id_pessoa_juridica_empresa: 1,
        pessoaJuridicaFilial: {
          situacao: 1, // Garantir que a pessoa jurídica (cartório) esteja ativa
        },
      };

      // Filtros opcionais
      if (cnpj) {
        whereConditions.pessoaJuridicaFilial = {
          ...whereConditions.pessoaJuridicaFilial,
          cnpj: { contains: cnpj.replace(/[^\d]/g, '') },
        };
      }

      if (razao_social) {
        whereConditions.pessoaJuridicaFilial = {
          ...whereConditions.pessoaJuridicaFilial,
          razao_social: {
            contains: razao_social,
            mode: 'insensitive',
          },
        };
      }

      const cartorios = await this.prisma.pessoasJuridicasJuridicas.findMany({
        where: whereConditions,
        include: {
          pessoaJuridicaEmpresa: {
            select: { id: true, razao_social: true },
          },
          pessoaJuridicaFilial: {
            include: {
              pessoa: {
                select: {
                  id: true,
                  codigo: true,
                  pessoasEnderecos: {
                    where: { situacao: 1 },
                    include: {
                      enderecoTipo: {
                        select: {
                          descricao: true,
                        },
                      },
                    },
                  },
                  pessoasContatos: {
                    where: { situacao: 1 },
                    include: {
                      contatoTipo: {
                        select: {
                          descricao: true,
                        },
                      },
                    },
                  },
                  pessoasDadosAdicionais: {
                    where: { situacao: 1 },
                  },
                },
              },
              pessoasJuridicasFisicas: {
                where: {
                  juridica_principal: 1,
                  situacao: 1,
                },
                include: {
                  pessoaFisica: {
                    include: {
                      pessoa: {
                        select: {
                          pessoasEnderecos: {
                            where: { situacao: 1 },
                          },
                          pessoasContatos: {
                            where: { situacao: 1 },
                          },
                          pessoasDadosAdicionais: {
                            where: { situacao: 1 },
                          },
                        },
                      },
                      genero: {
                        select: {
                          genero: true,
                          descricao: true,
                        },
                      },
                      estadoCivil: {
                        select: {
                          descricao: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      if (!cartorios.length) {
        throw new NotFoundException('Nenhum cartório encontrado');
      }

      // Aplicar filtro de código se fornecido
      let resultado = cartorios;
      if (codigo) {
        resultado = cartorios.filter(
          (c: any) =>
            c.pessoaJuridicaFilial?.pessoa?.codigo &&
            c.pessoaJuridicaFilial.pessoa.codigo.includes(codigo),
        );
      }

      return resultado.map((cartorio: any) => ({
        empresa_base: {
          id: cartorio.pessoaJuridicaEmpresa.id,
          razao_social: cartorio.pessoaJuridicaEmpresa.razao_social,
        },
        id: cartorio.pessoaJuridicaFilial.id,
        id_pessoa: cartorio.pessoaJuridicaFilial.id_pessoa,
        codigo: cartorio.pessoaJuridicaFilial.pessoa?.codigo,
        cnpj: this.formatarCNPJ(cartorio.pessoaJuridicaFilial.cnpj),
        razao_social: cartorio.pessoaJuridicaFilial.razao_social,
        nome_fantasia: cartorio.pessoaJuridicaFilial.nome_fantasia,
        insc_estadual: cartorio.pessoaJuridicaFilial.insc_estadual,
        insc_municipal: cartorio.pessoaJuridicaFilial.insc_municipal,
        filial_principal: cartorio.pessoaJuridicaFilial.filial_principal,
        enderecos: cartorio.pessoaJuridicaFilial.pessoa?.pessoasEnderecos,
        contatos: cartorio.pessoaJuridicaFilial.pessoa?.pessoasContatos,
        adicionais:
          cartorio.pessoaJuridicaFilial.pessoa?.pessoasDadosAdicionais,
        responsavel: cartorio.pessoaJuridicaFilial.pessoasJuridicasFisicas[0]
          ?.pessoaFisica
          ? {
              id: cartorio.pessoaJuridicaFilial.pessoasJuridicasFisicas[0]
                .pessoaFisica.id,
              cpf: this.formatarCPF(
                cartorio.pessoaJuridicaFilial.pessoasJuridicasFisicas[0]
                  .pessoaFisica.cpf || '',
              ),
              data_nascimento:
                cartorio.pessoaJuridicaFilial.pessoasJuridicasFisicas[0]
                  .pessoaFisica.data_nascimento,
              nome_registro:
                cartorio.pessoaJuridicaFilial.pessoasJuridicasFisicas[0]
                  .pessoaFisica.nome_registro,
              nome_social:
                cartorio.pessoaJuridicaFilial.pessoasJuridicasFisicas[0]
                  .pessoaFisica.nome_social,
              doc_numero:
                cartorio.pessoaJuridicaFilial.pessoasJuridicasFisicas[0]
                  .pessoaFisica.doc_numero,
              data_emissao:
                cartorio.pessoaJuridicaFilial.pessoasJuridicasFisicas[0]
                  .pessoaFisica.doc_data_emissao,
              doc_emissor:
                cartorio.pessoaJuridicaFilial.pessoasJuridicasFisicas[0]
                  .pessoaFisica.doc_emissor,
              nacionalidade:
                cartorio.pessoaJuridicaFilial.pessoasJuridicasFisicas[0]
                  .pessoaFisica.nacionalidade,
              genero:
                cartorio.pessoaJuridicaFilial.pessoasJuridicasFisicas[0]
                  .pessoaFisica.genero?.genero,
              estado_civil:
                cartorio.pessoaJuridicaFilial.pessoasJuridicasFisicas[0]
                  .pessoaFisica.estadoCivil?.descricao,
              naturalidade:
                cartorio.pessoaJuridicaFilial.pessoasJuridicasFisicas[0]
                  .pessoaFisica.naturalidade,
              enderecos:
                cartorio.pessoaJuridicaFilial.pessoasJuridicasFisicas[0]
                  .pessoaFisica.pessoa?.pessoasEnderecos,
              contatos:
                cartorio.pessoaJuridicaFilial.pessoasJuridicasFisicas[0]
                  .pessoaFisica.pessoa?.pessoasContatos,
              adicionais:
                cartorio.pessoaJuridicaFilial.pessoasJuridicasFisicas[0]
                  .pessoaFisica.pessoa?.pessoasDadosAdicionais,
            }
          : null,
        situacao: cartorio.situacao,
        createdAt: cartorio.createdAt,
        updatedAt: cartorio.updatedAt,
      }));
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        `Erro ao listar cartórios: ${error.message}`,
      );
    }
  }

  /**
   * Busca um cartório específico por ID
   * @param id - ID do cartório
   * @returns Cartório encontrado
   */
  async findOne(id: number) {
    try {
      const cartorio = await this.prisma.pessoasJuridicas.findUnique({
        where: { id },
        include: {
          pessoa: {
            select: {
              id: true,
              codigo: true,
              pessoasEnderecos: {
                where: { situacao: 1 },
                include: {
                  enderecoTipo: {
                    select: {
                      descricao: true,
                    },
                  },
                },
              },
              pessoasContatos: {
                where: { situacao: 1 },
                include: {
                  contatoTipo: {
                    select: {
                      descricao: true,
                    },
                  },
                },
              },
            },
          },
          pessoasJuridicasFisicas: {
            where: {
              juridica_principal: 1,
              situacao: 1,
            },
            include: {
              pessoaFisica: {
                include: {
                  pessoa: {
                    select: {
                      pessoasEnderecos: {
                        where: { situacao: 1 },
                        include: {
                          enderecoTipo: {
                            select: {
                              descricao: true,
                            },
                          },
                        },
                      },
                      pessoasContatos: {
                        where: { situacao: 1 },
                        include: {
                          contatoTipo: {
                            select: {
                              descricao: true,
                            },
                          },
                        },
                      },
                    },
                  },
                  genero: {
                    select: {
                      genero: true,
                      descricao: true,
                    },
                  },
                  estadoCivil: {
                    select: {
                      descricao: true,
                    },
                  },
                },
              },
              pessoaJuridicaPerfil: {
                select: {
                  id: true,
                  descricao: true,
                },
              },
            },
          },
        },
      });

      if (!cartorio) {
        throw new NotFoundException('Cartório não encontrado');
      }

      return {
        id: cartorio.id,
        id_pessoa: cartorio.id_pessoa,
        codigo: cartorio.pessoa?.codigo,
        cnpj: this.formatarCNPJ(cartorio.cnpj),
        razao_social: cartorio.razao_social,
        nome_fantasia: cartorio.nome_fantasia,
        insc_estadual: cartorio.insc_estadual,
        insc_municipal: cartorio.insc_municipal,
        filial_principal: cartorio.filial_principal,
        enderecos: cartorio.pessoa?.pessoasEnderecos,
        contatos: cartorio.pessoa?.pessoasContatos,
        responsavel: cartorio.pessoasJuridicasFisicas[0]?.pessoaFisica
          ? {
              id: cartorio.pessoasJuridicasFisicas[0].pessoaFisica.id,
              nome_registro:
                cartorio.pessoasJuridicasFisicas[0].pessoaFisica.nome_registro,
              nome_social:
                cartorio.pessoasJuridicasFisicas[0].pessoaFisica.nome_social,
              cpf: this.formatarCPF(
                cartorio.pessoasJuridicasFisicas[0].pessoaFisica.cpf || '',
              ),
              doc_numero:
                cartorio.pessoasJuridicasFisicas[0].pessoaFisica.doc_numero,
              doc_emissor:
                cartorio.pessoasJuridicasFisicas[0].pessoaFisica.doc_emissor,
              doc_data_emissao:
                cartorio.pessoasJuridicasFisicas[0].pessoaFisica
                  .doc_data_emissao,
              nacionalidade:
                cartorio.pessoasJuridicasFisicas[0].pessoaFisica.nacionalidade,
              naturalidade:
                cartorio.pessoasJuridicasFisicas[0].pessoaFisica.naturalidade,
              data_nascimento:
                cartorio.pessoasJuridicasFisicas[0].pessoaFisica
                  .data_nascimento,
              genero:
                cartorio.pessoasJuridicasFisicas[0].pessoaFisica.genero
                  ?.descricao,
              estado_civil:
                cartorio.pessoasJuridicasFisicas[0].pessoaFisica.estadoCivil
                  ?.descricao,
              perfil:
                cartorio.pessoasJuridicasFisicas[0].pessoaJuridicaPerfil
                  ?.descricao,
              enderecos:
                cartorio.pessoasJuridicasFisicas[0].pessoaFisica.pessoa
                  ?.pessoasEnderecos,
              contatos:
                cartorio.pessoasJuridicasFisicas[0].pessoaFisica.pessoa
                  ?.pessoasContatos,
            }
          : null,
        situacao: cartorio.situacao,
        motivo: cartorio.motivo,
        createdAt: cartorio.createdAt,
        updatedAt: cartorio.updatedAt,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        `Erro ao buscar cartório: ${error.message}`,
      );
    }
  }

  /**
   * Atualiza dados de um cartório
   * @param id - ID do cartório
   * @param updateCartorioDto - Dados a serem atualizados
   * @returns Cartório atualizado
   */
  async update(id: number, updateCartorioDto: UpdateCartorioDto) {
    try {
      const cartorio = await this.prisma.pessoasJuridicas.findUnique({
        where: { id },
        include: {
          pessoasJuridicasFisicas: {
            where: {
              juridica_principal: 1,
              situacao: 1,
            },
          },
        },
      });

      if (!cartorio) {
        throw new NotFoundException('Cartório não encontrado');
      }

      // Validações de atualização
      if (updateCartorioDto.pessoa_juridica?.cnpj) {
        if (!this.validarFormatoCNPJ(updateCartorioDto.pessoa_juridica.cnpj)) {
          throw new BadRequestException('Formato de CNPJ inválido');
        }

        const cnpjLimpo = updateCartorioDto.pessoa_juridica.cnpj.replace(
          /[^\d]/g,
          '',
        );
        const cnpjExiste = await this.prisma.pessoasJuridicas.findFirst({
          where: {
            cnpj: cnpjLimpo,
            situacao: 1,
            NOT: { id },
          },
        });

        if (cnpjExiste) {
          throw new BadRequestException(
            `CNPJ ${updateCartorioDto.pessoa_juridica.cnpj} já está cadastrado`,
          );
        }
      }

      if (updateCartorioDto.responsavel?.cpf) {
        if (!this.validarFormatoCPF(updateCartorioDto.responsavel.cpf)) {
          throw new BadRequestException('Formato de CPF inválido');
        }

        const cpfLimpo = updateCartorioDto.responsavel.cpf.replace(
          /[^\d]/g,
          '',
        );
        const idResponsavel =
          cartorio.pessoasJuridicasFisicas[0]?.id_pessoa_fisica;
        const cpfExiste = await this.prisma.pessoasFisica.findFirst({
          where: {
            cpf: cpfLimpo,
            situacao: 1,
            NOT: { id: idResponsavel },
          },
        });

        if (cpfExiste) {
          throw new BadRequestException(
            `CPF ${updateCartorioDto.responsavel.cpf} já está cadastrado`,
          );
        }
      }

      // Atualizar em transação
      const resultado = await this.prisma.$transaction(async (tx) => {
        // Atualiza registros de dados adicionais ou cria novos quando necessário
        const syncDadosAdicionais = async (
          idPessoa: bigint,
          adicionais?: {
            id_pessoa_dado_adicional_tipo: number;
            descricao: string;
          }[],
        ) => {
          if (!adicionais?.length) {
            return;
          }

          for (const adicional of adicionais) {
            const adicionalExistente =
              await tx.pessoasDadosAdicionais.findFirst({
                where: {
                  id_pessoa: idPessoa,
                  id_pessoa_dado_adicional_tipo:
                    adicional.id_pessoa_dado_adicional_tipo,
                },
              });

            if (adicionalExistente) {
              await tx.pessoasDadosAdicionais.update({
                where: { id: adicionalExistente.id },
                data: {
                  descricao: adicional.descricao,
                  situacao: 1,
                  motivo: null,
                  updatedAt: new Date(),
                },
              });
            } else {
              await tx.pessoasDadosAdicionais.create({
                data: {
                  id_pessoa: idPessoa,
                  id_pessoa_dado_adicional_tipo:
                    adicional.id_pessoa_dado_adicional_tipo,
                  descricao: adicional.descricao,
                  situacao: 1,
                },
              });
            }
          }
        };

        // Atualizar pessoa jurídica
        if (updateCartorioDto.pessoa_juridica) {
          const dadosUpdate: any = {};

          if (updateCartorioDto.pessoa_juridica.cnpj) {
            dadosUpdate.cnpj = updateCartorioDto.pessoa_juridica.cnpj.replace(
              /[^\d]/g,
              '',
            );
          }
          if (updateCartorioDto.pessoa_juridica.razao_social) {
            dadosUpdate.razao_social =
              updateCartorioDto.pessoa_juridica.razao_social;
          }
          if (updateCartorioDto.pessoa_juridica.nome_fantasia !== undefined) {
            dadosUpdate.nome_fantasia =
              updateCartorioDto.pessoa_juridica.nome_fantasia;
          }
          if (updateCartorioDto.pessoa_juridica.insc_estadual !== undefined) {
            dadosUpdate.insc_estadual =
              updateCartorioDto.pessoa_juridica.insc_estadual;
          }
          if (updateCartorioDto.pessoa_juridica.insc_municipal !== undefined) {
            dadosUpdate.insc_municipal =
              updateCartorioDto.pessoa_juridica.insc_municipal;
          }
          if (
            updateCartorioDto.pessoa_juridica.filial_principal !== undefined
          ) {
            dadosUpdate.filial_principal =
              updateCartorioDto.pessoa_juridica.filial_principal;
          }

          dadosUpdate.updatedAt = new Date();

          await tx.pessoasJuridicas.update({
            where: { id },
            data: dadosUpdate,
          });
        }

        // Atualizar código da pessoa se fornecido
        if (updateCartorioDto.codigo !== undefined) {
          await tx.pessoas.update({
            where: { id: cartorio.id_pessoa },
            data: { codigo: updateCartorioDto.codigo },
          });
        }

        // Atualizar endereços do cartório se fornecido
        if (updateCartorioDto.pessoa_juridica?.enderecos?.length) {
          // Desativar endereços existentes
          await tx.pessoasEnderecos.updateMany({
            where: {
              id_pessoa: cartorio.id_pessoa,
              situacao: 1,
            },
            data: {
              situacao: 0,
              updatedAt: new Date(),
            },
          });

          // Criar novos endereços
          for (const endereco of updateCartorioDto.pessoa_juridica.enderecos) {
            await tx.pessoasEnderecos.create({
              data: {
                id_pessoa: cartorio.id_pessoa,
                id_pessoa_endereco_tipo: endereco.id_pessoa_endereco_tipo,
                logradouro: endereco.logradouro,
                endereco: endereco.endereco,
                numero: endereco.numero,
                complemento: endereco.complemento,
                bairro: endereco.bairro,
                municipio: endereco.municipio,
                municipio_ibge: endereco.municipio_ibge,
                estado: endereco.estado,
                cep: endereco.cep,
                situacao: 1,
              },
            });
          }
        }

        // Atualizar contatos do cartório se fornecido
        if (updateCartorioDto.pessoa_juridica?.contatos?.length) {
          // Desativar contatos existentes
          await tx.pessoasContatos.updateMany({
            where: {
              id_pessoa: cartorio.id_pessoa,
              situacao: 1,
            },
            data: {
              situacao: 0,
              updatedAt: new Date(),
            },
          });

          // Criar novos contatos

          await syncDadosAdicionais(
            cartorio.id_pessoa,
            updateCartorioDto.pessoa_juridica?.adicionais,
          );
          for (const contato of updateCartorioDto.pessoa_juridica.contatos) {
            await tx.pessoasContatos.create({
              data: {
                id_pessoa: cartorio.id_pessoa,
                id_pessoa_contato_tipo: contato.id_pessoa_contato_tipo,
                descricao: contato.descricao,
                situacao: 1,
              },
            });
          }
        }

        // Atualizar pessoa física (responsável) se fornecido
        if (
          updateCartorioDto.responsavel &&
          cartorio.pessoasJuridicasFisicas[0]
        ) {
          const idResponsavel =
            cartorio.pessoasJuridicasFisicas[0].id_pessoa_fisica;
          const dadosUpdate: any = {};

          if (updateCartorioDto.responsavel.cpf) {
            dadosUpdate.cpf = updateCartorioDto.responsavel.cpf.replace(
              /[^\d]/g,
              '',
            );
          }
          if (updateCartorioDto.responsavel.nome_registro) {
            dadosUpdate.nome_registro =
              updateCartorioDto.responsavel.nome_registro;
          }
          if (updateCartorioDto.responsavel.nome_social !== undefined) {
            dadosUpdate.nome_social = updateCartorioDto.responsavel.nome_social;
          }
          if (updateCartorioDto.responsavel.id_pessoa_genero) {
            dadosUpdate.id_pessoa_genero =
              updateCartorioDto.responsavel.id_pessoa_genero;
          }
          if (updateCartorioDto.responsavel.id_pessoa_estado_civil) {
            dadosUpdate.id_pessoa_estado_civil =
              updateCartorioDto.responsavel.id_pessoa_estado_civil;
          }
          if (updateCartorioDto.responsavel.doc_numero !== undefined) {
            dadosUpdate.doc_numero = updateCartorioDto.responsavel.doc_numero;
          }
          if (updateCartorioDto.responsavel.doc_emissor !== undefined) {
            dadosUpdate.doc_emissor = updateCartorioDto.responsavel.doc_emissor;
          }
          if (updateCartorioDto.responsavel.doc_data_emissao !== undefined) {
            dadosUpdate.doc_data_emissao = updateCartorioDto.responsavel
              .doc_data_emissao
              ? new Date(updateCartorioDto.responsavel.doc_data_emissao)
              : null;
          }
          if (updateCartorioDto.responsavel.nacionalidade !== undefined) {
            dadosUpdate.nacionalidade =
              updateCartorioDto.responsavel.nacionalidade;
          }
          if (updateCartorioDto.responsavel.naturalidade !== undefined) {
            dadosUpdate.naturalidade =
              updateCartorioDto.responsavel.naturalidade;
          }
          if (updateCartorioDto.responsavel.data_nascimento !== undefined) {
            dadosUpdate.data_nascimento = updateCartorioDto.responsavel
              .data_nascimento
              ? new Date(updateCartorioDto.responsavel.data_nascimento)
              : null;
          }

          dadosUpdate.updatedAt = new Date();

          await tx.pessoasFisica.update({
            where: { id: idResponsavel },
            data: dadosUpdate,
          });

          // Obter ID da pessoa física
          const pessoaFisica = await tx.pessoasFisica.findUnique({
            where: { id: idResponsavel },
            select: { id_pessoa: true },
          });

          if (pessoaFisica) {
            // Atualizar endereços do responsável se fornecido
            if (updateCartorioDto.responsavel?.enderecos?.length) {
              // Desativar endereços existentes
              await tx.pessoasEnderecos.updateMany({
                where: {
                  id_pessoa: pessoaFisica.id_pessoa,
                  situacao: 1,
                },
                data: {
                  situacao: 0,
                  updatedAt: new Date(),
                },
              });

              // Criar novos endereços
              for (const endereco of updateCartorioDto.responsavel.enderecos) {
                await tx.pessoasEnderecos.create({
                  data: {
                    id_pessoa: pessoaFisica.id_pessoa,
                    id_pessoa_endereco_tipo: endereco.id_pessoa_endereco_tipo,
                    logradouro: endereco.logradouro,
                    endereco: endereco.endereco,
                    numero: endereco.numero,
                    complemento: endereco.complemento,
                    bairro: endereco.bairro,
                    municipio: endereco.municipio,
                    municipio_ibge: endereco.municipio_ibge,
                    estado: endereco.estado,
                    cep: endereco.cep,
                    situacao: 1,
                  },
                });
              }
            }

            // Atualizar contatos do responsável se fornecido
            if (updateCartorioDto.responsavel?.contatos?.length) {
              // Desativar contatos existentes
              await tx.pessoasContatos.updateMany({
                where: {
                  id_pessoa: pessoaFisica.id_pessoa,
                  situacao: 1,
                },
                data: {
                  situacao: 0,
                  updatedAt: new Date(),
                },
              });

              // Criar novos contatos
              for (const contato of updateCartorioDto.responsavel.contatos) {
                await tx.pessoasContatos.create({
                  data: {
                    id_pessoa: pessoaFisica.id_pessoa,
                    id_pessoa_contato_tipo: contato.id_pessoa_contato_tipo,
                    descricao: contato.descricao,
                    situacao: 1,
                  },
                });
              }
            }

            await syncDadosAdicionais(
              pessoaFisica.id_pessoa,
              updateCartorioDto.responsavel?.adicionais,
            );
          }
        }

        return true;
      });

      return {
        success: true,
        message: 'Cartório atualizado com sucesso',
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new BadRequestException(
        `Erro ao atualizar cartório: ${error.message}`,
      );
    }
  }

  /**
   * Remove (desativa) um cartório
   * @param id - ID do cartório
   * @param deleteData - Dados da exclusão incluindo motivo
   * @returns Confirmação de exclusão
   */
  async remove(id: number, deleteData: DeleteCartorioDto) {
    try {
      const cartorio = await this.prisma.pessoasJuridicas.findUnique({
        where: { id },
        include: {
          pessoasJuridicasFisicas: {
            where: {
              juridica_principal: 1,
              situacao: 1,
            },
            include: {
              pessoaFisica: {
                select: {
                  id: true,
                  id_pessoa: true,
                },
              },
            },
          },
        },
      });

      if (!cartorio) {
        throw new NotFoundException('Cartório não encontrado');
      }

      // Verifica se está ativo (situacao = 1)
      if (cartorio.situacao !== 1) {
        throw new BadRequestException('Cartório já está desativado');
      }

      // Verifica se não é registro global (id_pessoa = -1)
      if (Number(cartorio.id_pessoa) === -1) {
        throw new BadRequestException(
          'Nao e permitido remover registros globais (pessoa = -1)',
        );
      }

      // Desativa em transação todas as tabelas relacionadas
      await this.prisma.$transaction(async (tx) => {
        // 1. Desativar pessoa jurídica (cartório)
        await tx.pessoasJuridicas.update({
          where: { id },
          data: {
            situacao: 0,
            motivo: deleteData.motivo,
            updatedAt: new Date(),
          },
        });

        // 2. Desativar pessoa jurídica principal (cartório)
        await tx.pessoas.update({
          where: { id: cartorio.id_pessoa },
          data: {
            situacao: 0,
            motivo: deleteData.motivo,
            updatedAt: new Date(),
          },
        });

        // 3. Desativar endereços do cartório
        await tx.pessoasEnderecos.updateMany({
          where: {
            id_pessoa: cartorio.id_pessoa,
            situacao: 1,
          },
          data: {
            situacao: 0,
            motivo: deleteData.motivo,
            updatedAt: new Date(),
          },
        });

        // 4. Desativar contatos do cartório
        await tx.pessoasContatos.updateMany({
          where: {
            id_pessoa: cartorio.id_pessoa,
            situacao: 1,
          },
          data: {
            situacao: 0,
            motivo: deleteData.motivo,
            updatedAt: new Date(),
          },
        });

        // 5. Desativar vínculo cartório-responsável e pessoa física relacionada
        if (cartorio.pessoasJuridicasFisicas[0]) {
          const vinculo = cartorio.pessoasJuridicasFisicas[0];

          // Desativar vínculo
          await tx.pessoasJuridicasFisicas.update({
            where: { id: vinculo.id },
            data: {
              situacao: 0,
              motivo: deleteData.motivo,
              updatedAt: new Date(),
            },
          });

          if (vinculo.pessoaFisica) {
            // Desativar pessoa física (responsável)
            await tx.pessoasFisica.update({
              where: { id: vinculo.pessoaFisica.id },
              data: {
                situacao: 0,
                motivo: deleteData.motivo,
                updatedAt: new Date(),
              },
            });

            // Desativar pessoa do responsável
            await tx.pessoas.update({
              where: { id: vinculo.pessoaFisica.id_pessoa },
              data: {
                situacao: 0,
                motivo: deleteData.motivo,
                updatedAt: new Date(),
              },
            });

            // Desativar endereços do responsável
            await tx.pessoasEnderecos.updateMany({
              where: {
                id_pessoa: vinculo.pessoaFisica.id_pessoa,
                situacao: 1,
              },
              data: {
                situacao: 0,
                motivo: deleteData.motivo,
                updatedAt: new Date(),
              },
            });

            // Desativar contatos do responsável
            await tx.pessoasContatos.updateMany({
              where: {
                id_pessoa: vinculo.pessoaFisica.id_pessoa,
                situacao: 1,
              },
              data: {
                situacao: 0,
                motivo: deleteData.motivo,
                updatedAt: new Date(),
              },
            });

            // Desativar usuário do responsável
            await tx.pessoasUsuarios.updateMany({
              where: {
                id_pessoa_fisica: vinculo.pessoaFisica.id,
                situacao: 1,
              },
              data: {
                situacao: 0,
                motivo: deleteData.motivo,
                updatedAt: new Date(),
              },
            });
          }
        }

        // 6. Desativar vínculo cartório-empresa base
        await tx.pessoasJuridicasJuridicas.updateMany({
          where: {
            id_pessoa_juridica_filial: id,
            situacao: 1,
          },
          data: {
            situacao: 0,
            motivo: deleteData.motivo,
            updatedAt: new Date(),
          },
        });

        // 7. Desativar vínculo cartório-sistema
        await tx.pessoasJuridicasSistemas.updateMany({
          where: {
            id_pessoa_juridica: id,
            situacao: 1,
          },
          data: {
            situacao: 0,
            motivo: deleteData.motivo,
            updatedAt: new Date(),
          },
        });
      });

      return {
        success: true,
        message: 'Cartório desativado com sucesso',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Erro ao desativar cartório: ${error.message}`,
      );
    }
  }

  /**
   * Formata CNPJ para exibição
   */
  private formatarCNPJ(cnpj: string): string {
    if (!cnpj) return '';
    const numeros = cnpj.replace(/[^\d]/g, '');
    if (numeros.length !== 14) return cnpj;
    return numeros.replace(
      /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
      '$1.$2.$3/$4-$5',
    );
  }

  /**
   * Formata CPF para exibição
   */
  private formatarCPF(cpf: string): string {
    if (!cpf) return '';
    const numeros = cpf.replace(/[^\d]/g, '');
    if (numeros.length !== 11) return cpf;
    return numeros.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
  }

  /**
   * Valida se CNPJ tem formato válido
   */
  private validarFormatoCNPJ(cnpj: string): boolean {
    if (!cnpj) return false;
    const numeros = cnpj.replace(/[^\d]/g, '');
    return numeros.length === 14;
  }

  /**
   * Valida se CPF tem formato válido
   */
  private validarFormatoCPF(cpf: string): boolean {
    if (!cpf) return false;
    const numeros = cpf.replace(/[^\d]/g, '');
    return numeros.length === 11;
  }
}
