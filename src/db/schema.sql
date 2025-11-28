-- Criar tabela
CREATE TABLE IF NOT EXISTS cronograma (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mes TEXT NOT NULL,
    atividade TEXT NOT NULL,
    categoria TEXT,
    inicio DATE,
    fim DATE
);

-- Inserir eventos
INSERT INTO cronograma (mes, atividade, categoria, inicio, fim) VALUES
('Janeiro', 'Levantamento de nomes dos embaixadores', 'Planejamento', '2025-01-01', '2025-01-31'),
('Fevereiro', 'Capacitação de Embaixadores - Campanhas de ideias', 'Capacitação', '2025-02-01', '2025-02-28'),
('Março', 'Capacitação de Embaixadores - Campanhas de ideias', 'Capacitação', '2025-03-01', '2025-03-31'),
('Abril', 'Inova + Saúde - Jornada da Inovação - Campanhas de ideias', 'Inovação', '2025-04-01', '2025-04-30'),
('Maio', 'Inova + Saúde - Acelera', 'Inovação', '2025-05-01', '2025-05-31'),
('Junho', 'Impulsione - SW', 'Inovação', '2025-06-01', '2025-06-30'),
('Julho', 'Impulsione - Simpósio', 'Inovação', '2025-07-01', '2025-07-31'),
('Agosto', 'Piloto Impulsione', 'Projeto Piloto', '2025-08-01', '2025-08-31'),
('Setembro', 'Piloto Impulsione', 'Projeto Piloto', '2025-09-01', '2025-09-30'),
('Outubro', 'Piloto Impulsione', 'Projeto Piloto', '2025-10-01', '2025-10-31'),
('Novembro', 'Oscar da Inovação', 'Evento', '2025-11-01', '2025-11-30'),
('Dezembro', 'Anúncio da Inovação', 'Evento', '2025-12-01', '2025-12-31');

