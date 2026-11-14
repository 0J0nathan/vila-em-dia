from pathlib import Path
import sqlite3

import requests
from flask import Flask, jsonify, render_template

BASE_DIR = Path(__file__).resolve().parent
DB_URI = BASE_DIR.joinpath("banco.db").as_uri() + "?mode=ro"  # somente leitura (compatível com a Vercel)

# Na Vercel os arquivos estáticos vêm da pasta public/. Usar a mesma pasta
# localmente mantém os dois ambientes iguais.
app = Flask(__name__, static_folder="public", static_url_path="")


def consultar(sql):
    """Executa um SELECT no banco.db e devolve uma lista de dicionários."""
    try:
        con = sqlite3.connect(DB_URI, uri=True)
        con.row_factory = sqlite3.Row
        linhas = [dict(r) for r in con.execute(sql).fetchall()]
        con.close()
        return linhas
    except sqlite3.Error as erro:
        print(f"Aviso: não consegui ler o banco.db ({erro}). Rode: python criar_banco.py")
        return []


def obter_locais():
    return consultar("SELECT id, nome, categoria, endereco, latitude, longitude FROM comercios ORDER BY nome")


def obter_jogos():
    return consultar("SELECT id, mandante, visitante, data_hora, local, rodada FROM eventos ORDER BY data_hora")


@app.route("/")
@app.route("/v2")
def home():
    return render_template("index_v2.html", pontos_mapa=obter_locais(), jogos=obter_jogos())


@app.route("/api/locais")
def api_locais():
    return jsonify(obter_locais())


@app.route("/api/jogos")
def api_jogos():
    return jsonify(obter_jogos())


@app.route("/api/clima")
def api_clima():
    try:
        resp = requests.get(
            "https://api.open-meteo.com/v1/forecast",
            params={"latitude": -23.9518, "longitude": -46.3391, "current_weather": True},
            timeout=5,
        )
        resp.raise_for_status()
        return jsonify(resp.json())
    except requests.RequestException:
        return jsonify({"erro": "clima indisponível"}), 503


if __name__ == "__main__":
    app.run(debug=True)
