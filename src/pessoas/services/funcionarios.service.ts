import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateFuncionariosDto,
  DeleteFuncionarioDto,
  UpdateFuncionarioDto,
} from '../dto/funcionario.dto';

@Injectable()
export class FuncionariosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateFuncionariosDto) {
    if (!dto?.pessoas || !Array.isArray(dto.pessoas)) {
      throw new BadRequestException('O campo "pessoas" precisa ser um array.');
    }

    const results: Array<{
      id_pessoa?: bigint;
      id_pessoa_fisica?: bigint;
      cpf?: string;
      nome?: string;
      status: string;
    }> = [];

    return this.prisma.$transaction(async (tx) => {
      for (const pessoaData of dto.pessoas) {
        // ✅ VALIDAÇÃO DOS CAMPOS OBRIGATÓRIOS
        if (
          pessoaData.id_pessoa_tipo === undefined ||
          pessoaData.id_pessoa_origem === undefined
        ) {
          throw new BadRequestException(
            'Campos id_pessoa_tipo e id_pessoa_origem são obrigatórios',
          );
        }

        // 1️⃣ Criação da pessoa
        const novaPessoa = await tx.pessoas.create({
          data: {
            pessoa: pessoaData.pessoa,
            id_pessoa_tipo: BigInt(pessoaData.id_pessoa_tipo),
            id_pessoa_origem: BigInt(pessoaData.id_pessoa_origem),
            codigo: pessoaData.codigo,
            situacao: pessoaData.situacao,
          },
          select: {
            id: true,
          },
        });

        // 2️⃣ Criação das pessoas físicas
        for (const pessoaFisicaData of pessoaData.pessoas_fisicas || []) {
          try {
            // ✅ VALIDAÇÃO DOS CAMPOS DA PESSOA FÍSICA
            if (
              pessoaFisicaData.id_pessoa_genero === undefined ||
              pessoaFisicaData.id_pessoa_estado_civil === undefined ||
              pessoaData.id_pessoa_juridica === undefined
            ) {
              throw new BadRequestException(
                'Campos obrigatórios da pessoa física não informados',
              );
            }

            // ✅ VERIFICAÇÃO ANTECIPADA DE CPF
            const cpfExistente = await tx.pessoasFisica.findFirst({
              where: {
                situacao: 1,
                cpf: pessoaFisicaData.cpf,
                pessoasJuridicasFisicas: {
                  some: {
                    id_pessoa_juridica: BigInt(pessoaData.id_pessoa_juridica),
                  },
                },
              },
              select: {
                id: true,
                cpf: true,
                nome_registro: true,
              },
            });

            if (cpfExistente) {
              results.push({
                cpf: pessoaFisicaData.cpf,
                status: 'duplicado',
                nome: `CPF já cadastrado para: ${cpfExistente.nome_registro}`,
              });
              continue;
            }

            // Verificação de datas

            // Verifica se as datas são validas
            // Nenhuma das datas pode ser maior que a data atual
            if (
              (pessoaFisicaData.data_nascimento &&
                !new Date(pessoaFisicaData.data_nascimento).getTime()) ||
              new Date(pessoaFisicaData.data_nascimento) > new Date()
            ) {
              throw new BadRequestException('Data de nascimento inválida');
            }

            if (
              (pessoaFisicaData.doc_data_emissao &&
                !new Date(pessoaFisicaData.doc_data_emissao).getTime()) ||
              new Date(pessoaFisicaData.doc_data_emissao) > new Date()
            ) {
              throw new BadRequestException(
                'Data de emissão do documento inválida',
              );
            }

            // Verifica se a data de emissão do documento é maior que a data de nascimento
            if (pessoaFisicaData.doc_data_emissao) {
              if (
                new Date(pessoaFisicaData.doc_data_emissao) <=
                new Date(pessoaFisicaData.data_nascimento)
              ) {
                throw new BadRequestException(
                  'Data de emissão do documento deve ser maior que a data de nascimento',
                );
              }
            }

            const novaPessoaFisica = await tx.pessoasFisica.create({
              data: {
                id_pessoa: novaPessoa.id,
                cpf: pessoaFisicaData.cpf,
                nome_registro: pessoaFisicaData.nome_registro,
                nome_social: pessoaFisicaData.nome_social,
                id_pessoa_genero: BigInt(pessoaFisicaData.id_pessoa_genero),
                id_pessoa_estado_civil: BigInt(
                  pessoaFisicaData.id_pessoa_estado_civil,
                ),
                cpf_justificativa: pessoaFisicaData.cpf_justificativa ?? 0,
                doc_numero: pessoaFisicaData.doc_numero,
                doc_emissor: pessoaFisicaData.doc_emissor,
                doc_data_emissao: pessoaFisicaData.doc_data_emissao
                  ? new Date(pessoaFisicaData.doc_data_emissao)
                  : null,
                nacionalidade: pessoaFisicaData.nacionalidade,
                naturalidade: pessoaFisicaData.naturalidade,
                data_nascimento: pessoaFisicaData.data_nascimento
                  ? new Date(pessoaFisicaData.data_nascimento)
                  : null,
              },
            });

            // 3️⃣ Vinculação com a pessoa jurídica
            await tx.pessoasJuridicasFisicas.create({
              data: {
                id_pessoa_juridica: BigInt(pessoaData.id_pessoa_juridica),
                id_pessoa_fisica: novaPessoaFisica.id,
                id_pessoa_juridica_perfil: BigInt(pessoaData.id_perfil || 3),
                juridica_principal: 1,
                situacao: 1,
              },
            });

            // 4️⃣ Endereços (OPCIONAL)
            for (const endereco of pessoaFisicaData.enderecos || []) {
              await tx.pessoasEnderecos.create({
                data: {
                  id_pessoa: novaPessoa.id,
                  id_pessoa_endereco_tipo: BigInt(
                    endereco.id_pessoa_endereco_tipo,
                  ),
                  logradouro: endereco.logradouro,
                  endereco: endereco.endereco,
                  numero: endereco.numero,
                  complemento: endereco.complemento,
                  bairro: endereco.bairro,
                  municipio: endereco.municipio,
                  municipio_ibge: endereco.municipio_ibge,
                  estado: endereco.estado,
                  cep: endereco.cep,
                },
              });
            }

            // 5️⃣ Contatos (OPCIONAL)
            for (const contato of pessoaFisicaData.contatos || []) {
              await tx.pessoasContatos.create({
                data: {
                  id_pessoa: novaPessoa.id,
                  id_pessoa_contato_tipo: BigInt(
                    contato.id_pessoa_contato_tipo,
                  ),
                  descricao: contato.descricao,
                },
              });
            }

            // 6️⃣ Dados adicionais (OPCIONAL)
            for (const dado of pessoaFisicaData.dados_adicionais || []) {
              await tx.pessoasDadosAdicionais.create({
                data: {
                  id_pessoa: novaPessoa.id,
                  id_pessoa_dado_adicional_tipo: BigInt(
                    dado.id_pessoa_dado_adicional_tipo,
                  ),
                  descricao: dado.descricao,
                },
              });
            }

            // 7️⃣ Registro no retorno
            results.push({
              id_pessoa: novaPessoa.id,
              id_pessoa_fisica: novaPessoaFisica.id,
              cpf: pessoaFisicaData.cpf,
              nome: pessoaFisicaData.nome_registro,
              status: 'criado',
            });
          } catch (err) {
            // CPF duplicado (fallback)
            if (
              err instanceof Prisma.PrismaClientKnownRequestError &&
              err.code === 'P2002'
            ) {
              results.push({
                cpf: pessoaFisicaData.cpf,
                status: 'duplicado',
                nome: 'Erro de duplicação (fallback)',
              });
              continue;
            }
            throw err;
          }
        }
      }
      return results;
    });
  }

  /**
   * Busca funcionários por id_pessoa_juridica
   * APENAS para id_pessoa_tipo = 6 (Funcionários)
   * Filtro opcional por id_pessoa_fisica
   */
  async findByPessoaJuridica(
    id_pessoa_juridica: number,
    id_pessoa_fisica?: number,
  ) {
    if (!id_pessoa_juridica || isNaN(id_pessoa_juridica)) {
      throw new BadRequestException(
        'ID da pessoa jurídica é obrigatório e deve ser um número',
      );
    }

    // Constrói o where clause dinamicamente
    const whereClause: any = {
      id_pessoa_juridica: BigInt(id_pessoa_juridica),
      situacao: 1,
      pessoaFisica: {
        pessoa: {
          id_pessoa_tipo: 6, // FILTRO PARA TIPO 6
        },
      },
    };

    // Adiciona filtro por id_pessoa_fisica se fornecido e válido
    if (
      id_pessoa_fisica !== undefined &&
      id_pessoa_fisica !== null &&
      !isNaN(id_pessoa_fisica)
    ) {
      whereClause.id_pessoa_fisica = BigInt(id_pessoa_fisica);
    }

    // Busca através da tabela de vinculação
    const vinculacoes = await this.prisma.pessoasJuridicasFisicas.findMany({
      where: whereClause,
      select: {
        id_pessoa_juridica_perfil: true,
        pessoaFisica: {
          include: {
            pessoasUsuarios: true,
            pessoa: {
              select: {
                id: true,
                pessoasContatos: true,
                pessoasEnderecos: true,
                pessoasDadosAdicionais: true,
              },
            },
          },
        },
        pessoaJuridica: true,
      },
    });

    if (!vinculacoes.length) {
      const message = id_pessoa_fisica
        ? `Nenhum funcionário (tipo 6) encontrado para a pessoa jurídica ID: ${id_pessoa_juridica} e pessoa física ID: ${id_pessoa_fisica}`
        : `Nenhum funcionário (tipo 6) encontrado para a pessoa jurídica ID: ${id_pessoa_juridica}`;

      throw new NotFoundException(message);
    }

    return vinculacoes;
  }

  async update(id: number, updateData: UpdateFuncionarioDto) {
    if (!id || isNaN(id)) {
      throw new BadRequestException('ID pessoa é obrigatório');
    }

    // Verifica se o funcionário existe
    const funcionarioExistente = await this.prisma.pessoas.findUnique({
      where: { id: BigInt(id) },
      include: {
        pessoaFisica: {
          include: {
            pessoasJuridicasFisicas: true,
          },
        },
        pessoasEnderecos: true,
        pessoasContatos: true,
        pessoasDadosAdicionais: true,
      },
    });

    if (!funcionarioExistente) {
      throw new NotFoundException(`Funcionário com ID ${id} não encontrado`);
    }

    return this.prisma.$transaction(async (tx) => {
      const updatePessoaData: any = {};
      const updatePessoaFisicaData: any = {};
      const camposAtualizados = {
        pessoa: [] as string[],
        pessoa_fisica: [] as string[],
        vinculacao: [] as string[],
        enderecos: [] as string[],
        contatos: [] as string[],
        dados_adicionais: [] as string[],
      };

      // Atualiza apenas os campos enviados da pessoa
      if (updateData.codigo !== undefined) {
        updatePessoaData.codigo = updateData.codigo;
        camposAtualizados.pessoa.push('codigo');
      }
      if (updateData.situacao !== undefined) {
        updatePessoaData.situacao = updateData.situacao;
        camposAtualizados.pessoa.push('situacao');
      }

      if (Object.keys(updatePessoaData).length > 0) {
        await tx.pessoas.update({
          where: { id: BigInt(id) },
          data: updatePessoaData,
        });
      }

      // Atualiza vinculação (id_perfil e/ou id_pessoa_juridica)
      if (
        funcionarioExistente.pessoaFisica?.pessoasJuridicasFisicas &&
        funcionarioExistente.pessoaFisica.pessoasJuridicasFisicas.length > 0
      ) {
        const vinculacao =
          funcionarioExistente.pessoaFisica.pessoasJuridicasFisicas[0];
        const updateVinculacaoData: any = {};

        if (updateData.id_perfil !== undefined) {
          updateVinculacaoData.id_pessoa_juridica_perfil = BigInt(
            updateData.id_perfil,
          );
          camposAtualizados.vinculacao.push('id_perfil');
        }

        if (updateData.id_pessoa_juridica !== undefined) {
          updateVinculacaoData.id_pessoa_juridica = BigInt(
            updateData.id_pessoa_juridica,
          );
          camposAtualizados.vinculacao.push('id_pessoa_juridica');
        }

        if (Object.keys(updateVinculacaoData).length > 0) {
          await tx.pessoasJuridicasFisicas.update({
            where: { id: vinculacao.id },
            data: updateVinculacaoData,
          });
        }
      }

      // Atualiza apenas os campos enviados da pessoa física se existir
      if (updateData.pessoa_fisica && funcionarioExistente.pessoaFisica) {
        const pfData = updateData.pessoa_fisica;
        if (pfData.nome_registro !== undefined) {
          updatePessoaFisicaData.nome_registro = pfData.nome_registro;
          camposAtualizados.pessoa_fisica.push('nome_registro');
        }
        if (pfData.nome_social !== undefined) {
          updatePessoaFisicaData.nome_social = pfData.nome_social;
          camposAtualizados.pessoa_fisica.push('nome_social');
        }
        if (pfData.id_pessoa_genero !== undefined) {
          updatePessoaFisicaData.id_pessoa_genero = BigInt(
            pfData.id_pessoa_genero,
          );
          camposAtualizados.pessoa_fisica.push('id_pessoa_genero');
        }
        if (pfData.id_pessoa_estado_civil !== undefined) {
          updatePessoaFisicaData.id_pessoa_estado_civil = BigInt(
            pfData.id_pessoa_estado_civil,
          );
          camposAtualizados.pessoa_fisica.push('id_pessoa_estado_civil');
        }
        if (pfData.doc_numero !== undefined) {
          updatePessoaFisicaData.doc_numero = pfData.doc_numero;
          camposAtualizados.pessoa_fisica.push('doc_numero');
        }
        if (pfData.doc_emissor !== undefined) {
          updatePessoaFisicaData.doc_emissor = pfData.doc_emissor;
          camposAtualizados.pessoa_fisica.push('doc_emissor');
        }
        if (
          pfData.doc_data_emissao !== undefined &&
          pfData.doc_data_emissao.trim().length > 0
        ) {
          updatePessoaFisicaData.doc_data_emissao = new Date(
            pfData.doc_data_emissao,
          );
          camposAtualizados.pessoa_fisica.push('doc_data_emissao');
        }
        if (pfData.nacionalidade !== undefined) {
          updatePessoaFisicaData.nacionalidade = pfData.nacionalidade;
          camposAtualizados.pessoa_fisica.push('nacionalidade');
        }
        if (pfData.naturalidade !== undefined) {
          updatePessoaFisicaData.naturalidade = pfData.naturalidade;
          camposAtualizados.pessoa_fisica.push('naturalidade');
        }
        if (pfData.data_nascimento !== undefined) {
          updatePessoaFisicaData.data_nascimento = new Date(
            pfData.data_nascimento,
          );
          camposAtualizados.pessoa_fisica.push('data_nascimento');
        }
        if (pfData.cpf_justificativa !== undefined) {
          updatePessoaFisicaData.cpf_justificativa = pfData.cpf_justificativa;
          camposAtualizados.pessoa_fisica.push('cpf_justificativa');
        }

        if (Object.keys(updatePessoaFisicaData).length > 0) {
          await tx.pessoasFisica.update({
            where: { id: funcionarioExistente.pessoaFisica.id },
            data: updatePessoaFisicaData,
          });
        }
      }

      // ATUALIZAÇÃO DE ENDEREÇOS - Agora mais específica
      if (updateData.enderecos !== undefined) {
        // Remove endereços existentes
        await tx.pessoasEnderecos.deleteMany({
          where: { id_pessoa: BigInt(id) },
        });

        // Cria novos endereços apenas se o array não estiver vazio
        if (
          Array.isArray(updateData.enderecos) &&
          updateData.enderecos.length > 0
        ) {
          for (const endereco of updateData.enderecos) {
            await tx.pessoasEnderecos.create({
              data: {
                id_pessoa: BigInt(id),
                id_pessoa_endereco_tipo: BigInt(
                  endereco.id_pessoa_endereco_tipo,
                ),
                logradouro: endereco.logradouro,
                endereco: endereco.endereco,
                numero: endereco.numero,
                complemento: endereco.complemento,
                bairro: endereco.bairro,
                municipio: endereco.municipio,
                municipio_ibge: endereco.municipio_ibge,
                estado: endereco.estado,
                cep: endereco.cep,
              },
            });
          }
          camposAtualizados.enderecos.push(
            `${updateData.enderecos.length} endereço(s)`,
          );
        } else {
          // Se o array estiver vazio, apenas remove os existentes
          camposAtualizados.enderecos.push('todos os endereços removidos');
        }
      }

      // ATUALIZAÇÃO DE CONTATOS - Agora mais específica
      if (updateData.contatos !== undefined) {
        // Remove contatos existentes
        await tx.pessoasContatos.deleteMany({
          where: { id_pessoa: BigInt(id) },
        });

        // Cria novos contatos apenas se o array não estiver vazio
        if (
          Array.isArray(updateData.contatos) &&
          updateData.contatos.length > 0
        ) {
          for (const contato of updateData.contatos) {
            await tx.pessoasContatos.create({
              data: {
                id_pessoa: BigInt(id),
                id_pessoa_contato_tipo: BigInt(contato.id_pessoa_contato_tipo),
                descricao: contato.descricao,
              },
            });
          }
          camposAtualizados.contatos.push(
            `${updateData.contatos.length} contato(s)`,
          );
        } else {
          // Se o array estiver vazio, apenas remove os existentes
          camposAtualizados.contatos.push('todos os contatos removidos');
        }
      }

      // ATUALIZAÇÃO DE DADOS ADICIONAIS - Agora mais específica
      if (updateData.dados_adicionais !== undefined) {
        // Remove dados adicionais existentes
        await tx.pessoasDadosAdicionais.deleteMany({
          where: { id_pessoa: BigInt(id) },
        });

        // Cria novos dados adicionais apenas se o array não estiver vazio
        if (
          Array.isArray(updateData.dados_adicionais) &&
          updateData.dados_adicionais.length > 0
        ) {
          for (const dado of updateData.dados_adicionais) {
            await tx.pessoasDadosAdicionais.create({
              data: {
                id_pessoa: BigInt(id),
                id_pessoa_dado_adicional_tipo: BigInt(
                  dado.id_pessoa_dado_adicional_tipo,
                ),
                descricao: dado.descricao,
              },
            });
          }
          camposAtualizados.dados_adicionais.push(
            `${updateData.dados_adicionais.length} dado(s) adicional(is)`,
          );
        } else {
          // Se o array estiver vazio, apenas remove os existentes
          camposAtualizados.dados_adicionais.push(
            'todos os dados adicionais removidos',
          );
        }
      }

      return {
        message: 'Funcionário atualizado com sucesso',
        id_pessoa: id,
        campos_atualizados: camposAtualizados,
      };
    });
  }

  /**
   * Remove um funcionário (soft delete - marca como inativo)
   */
  async remove(id: number, deleteData: DeleteFuncionarioDto, user: any) {
    if (!id || isNaN(id)) {
      throw new BadRequestException('ID pessoa é obrigatório');
    }

    if (!deleteData?.motivo) {
      throw new BadRequestException('Motivo da exclusão é obrigatório');
    }

    // Verifica se o funcionário existe e se pertence a mesma empresa do usuário
    const vinculacaoFuncionario =
      await this.prisma.pessoasJuridicasFisicas.findFirst({
        where: {
          id_pessoa_fisica: BigInt(id),
          id_pessoa_juridica: BigInt(user.id_pessoa_juridica),
        },
      });

    if (!vinculacaoFuncionario) {
      throw new NotFoundException(
        `Funcionário com ID ${id} não encontrado ou não pertence à empresa`,
      );
    }

    // Verifica se está ativo (situacao = 1)
    if (vinculacaoFuncionario.situacao !== 1) {
      throw new BadRequestException('Funcionário já está desativado');
    }
    // Busca o funcionário completo para atualizar suas vinculações
    return this.prisma.$transaction(async (tx) => {
      // Marca a pessoa física como inativa com motivo
      const fisica = await tx.pessoasFisica.update({
        where: { id: vinculacaoFuncionario.id_pessoa_fisica },
        data: {
          situacao: 0,
          motivo: deleteData.motivo,
          updatedAt: new Date(),
        },
      });

      if (!fisica) {
        throw new BadRequestException('Erro ao desativar o funcionário');
      }

      const pessoa = await tx.pessoas.update({
        where: { id: fisica.id_pessoa },
        data: {
          situacao: 0,
          motivo: deleteData.motivo,
          updatedAt: new Date(),
        },
      });
      if (!pessoa) {
        throw new BadRequestException('Erro ao desativar o funcionário');
      }

      // Marca a vinculação como inativa
      await tx.pessoasJuridicasFisicas.updateMany({
        where: { id_pessoa_fisica: fisica.id },
        data: {
          situacao: 0,
          motivo: deleteData.motivo,
          updatedAt: new Date(),
        },
      });

      return {
        message: 'Funcionário removido com sucesso',
        id_pessoa: id,
        motivo: deleteData.motivo,
      };
    });
  }
}
export { DeleteFuncionarioDto };
