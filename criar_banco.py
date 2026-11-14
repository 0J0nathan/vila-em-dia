"""Cria (ou recria) o banco.db com as tabelas `comercios` e `eventos`.

Uso:  python criar_banco.py
Rode de novo sempre que alterar os dados abaixo e faça commit do banco.db.
"""
import sqlite3
from pathlib import Path

DB = Path(__file__).parent / "banco.db"

# nome, categoria, endereco, latitude, longitude
COMERCIOS = [
    ("Estádio Urbano Caldeira (Vila Belmiro)", "turismo", "Vila Belmiro, Santos-SP", -23.9512, -46.3388),
    ("Vila Bar", "comer", "R. Princesa Isabel, 114", -23.951065, -46.340082),
    ("Padaria Vila Belmiro", "comer", "R. Guararapes, 49", -23.952428, -46.339132),
    ("Prol Park - Unidade Vila Belmiro", "estacionamento", "R. Joaquim Távora, 233", -23.949101, -46.333735),
    ("Ponto de ônibus - Av. Sen. Pinheiro Machado, 425", "transporte", "Av. Sen. Pinheiro Machado, 425", -23.949927, -46.340430),
]

# mandante, visitante, data_hora (ISO), local, rodada
EVENTOS = [
    ("Coritiba", "Santos", "2026-11-18T19:30:00", "Couto Pereira (Curitiba)", "35ª"),
    ("Santos", "Grêmio", "2026-11-23T21:00:00", "MorumBIS (São Paulo)", "36ª"),
    ("Vitória", "Santos", "2026-11-29T16:00:00", "Barradão (Salvador)", "37ª"),
    ("Santos", "Botafogo", "2026-12-02T21:30:00", "Vila Belmiro (Santos)", "38ª"),
]

def main():
    con = sqlite3.connect(DB)
    cur = con.cursor()
    cur.executescript("""
        DROP TABLE IF EXISTS comercios;
        DROP TABLE IF EXISTS eventos;
        CREATE TABLE comercios (
            id        INTEGER PRIMARY KEY AUTOINCREMENT,
            nome      TEXT NOT NULL,
            categoria TEXT NOT NULL,
            endereco  TEXT,
            latitude  REAL NOT NULL,
            longitude REAL NOT NULL
        );
        CREATE TABLE eventos (
            id        INTEGER PRIMARY KEY AUTOINCREMENT,
            mandante  TEXT NOT NULL,
            visitante TEXT NOT NULL,
            data_hora TEXT NOT NULL,
            local     TEXT,
            rodada    TEXT
        );
    """)
    cur.executemany("INSERT INTO comercios (nome, categoria, endereco, latitude, longitude) VALUES (?,?,?,?,?)", COMERCIOS)
    cur.executemany("INSERT INTO eventos (mandante, visitante, data_hora, local, rodada) VALUES (?,?,?,?,?)", EVENTOS)
    con.commit()
    print(f"OK: {len(COMERCIOS)} locais e {len(EVENTOS)} jogos gravados em {DB.name}")
    con.close()

if __name__ == "__main__":
    main()
