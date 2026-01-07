CREATE SCHEMA IF NOT EXISTS webzeus;

CREATE TABLE webzeus.chamado (
    id_chamado BIGSERIAL PRIMARY KEY,
    id_empresa BIGINT NOT NULL,
    id_sistema BIGINT NOT NULL,
    id_pessoa_empresa BIGINT NOT NULL,
    id_pessoa_usuario BIGINT NOT NULL,
    id_ocorrencia BIGINT NOT NULL,
    id_prioridade BIGINT NOT NULL,

    protocolo INTEGER,
    titulo VARCHAR(100) NOT NULL,
    descricao VARCHAR(500) NOT NULL,
    observacao VARCHAR(500) NOT NULL,

    situacao INTEGER DEFAULT 1,
    motivo VARCHAR(500),

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE webzeus.chamado_movimento (
    id_chamado_movimento BIGSERIAL PRIMARY KEY,
    id_chamado BIGINT NOT NULL,
    id_chamado_movimento_etapa BIGINT NOT NULL,
    id_pessoa_usuario BIGINT NOT NULL,

    ordem INTEGER,
    data_hora_inicio TIMESTAMP,
    data_hora_fim TIMESTAMP,
    descricao_acao VARCHAR(500) NOT NULL,
    observacao_tecnica VARCHAR(500) NOT NULL,

    situacao INTEGER DEFAULT 1,
    motivo VARCHAR(500),

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE webzeus.chamado_movimento_etapa (
    id_chamado_movimento_etapa BIGSERIAL PRIMARY KEY,
    id_empresa BIGINT NOT NULL,
    descricao VARCHAR(100) NOT NULL,

    situacao INTEGER DEFAULT 1,
    motivo VARCHAR(500),

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE webzeus.chamado_movimento_anexo (
    id_chamado_movimento_anexo BIGSERIAL PRIMARY KEY,
    id_chamado_movimento BIGINT NOT NULL,
    id_pessoa_usuario BIGINT NOT NULL,

    ordem INTEGER,
    descricao VARCHAR(100) NOT NULL,
    data_hora TIMESTAMP,
    caminho VARCHAR(150) NOT NULL,

    situacao INTEGER DEFAULT 1,
    motivo VARCHAR(500),

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE webzeus.chamado_movimento_mensagem (
    id_chamado_movimento_mensagem BIGSERIAL PRIMARY KEY,
    id_chamado_movimento BIGINT NOT NULL,
    id_pessoa_usuario_envio BIGINT NOT NULL,
    id_pessoa_usuario_leitura BIGINT NOT NULL,

    ordem INTEGER,
    descricao VARCHAR(500) NOT NULL,
    data_hora_envio TIMESTAMP,
    data_hora_leitura TIMESTAMP,

    situacao INTEGER DEFAULT 1,
    motivo VARCHAR(500),

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE webzeus.ocorrencia (
    id_ocorrencia BIGSERIAL PRIMARY KEY,
    id_ocorrencia_tipo BIGINT NOT NULL,
    id_empresa BIGINT NOT NULL,

    descricao VARCHAR(100) NOT NULL,
    situacao INTEGER DEFAULT 1,
    motivo VARCHAR(500),

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE webzeus.ocorrencia_tipo (
    id_ocorrencia_tipo BIGSERIAL PRIMARY KEY,
    id_empresa BIGINT NOT NULL,

    descricao VARCHAR(100) NOT NULL,
    situacao INTEGER DEFAULT 1,
    motivo VARCHAR(500),

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE webzeus.prioridade (
    id_prioridade BIGSERIAL PRIMARY KEY,
    id_empresa BIGINT NOT NULL,

    descricao VARCHAR(100) NOT NULL,
    cor VARCHAR(100) NOT NULL,
    tempo_resolucao TIME NOT NULL,

    situacao INTEGER DEFAULT 1,
    motivo VARCHAR(500),

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);
