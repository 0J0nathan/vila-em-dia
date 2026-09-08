# Importa a biblioteca do banco de dados
import sqlite3

# 1. Abre a conexão com a nossa "planilha"
conexao = sqlite3.connect('banco.db')
cursor = conexao.cursor()

# 2. Criamos uma lista com os dados reais: Nome, Categoria, Latitude e Longitude
# As coordenadas são pontos reais no entorno da Vila Belmiro
lista_de_locais = [
    ('Memorial das Conquistas', 'Turismo', -23.9385, -46.3419),
    ('Padaria da Vila', 'Comer e Beber', -23.9372, -46.3405),
    ('Estacionamento do Peixe', 'Estacionamento', -23.9395, -46.3428)
]

# 3. O comando executemany repete o INSERT automaticamente para cada item da lista acima
cursor.executemany('''
    INSERT INTO comercios (nome, categoria, latitude, longitude)
    VALUES (?, ?, ?, ?)
''', lista_de_locais)

# 4. Salva (commit) e fecha o banco
conexao.commit()
conexao.close()

# 5. Confirmação no terminal
print("Locais reais inseridos com sucesso no banco de dados!")