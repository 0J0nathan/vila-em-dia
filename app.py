from flask import Flask, render_template, jsonify
import sqlite3
import time
import requests

app = Flask(__name__)

# Função para buscar os comércios no banco (Se você já tiver o banco.db)
def obter_locais():
    try:
        conexao = sqlite3.connect('banco.db')
        conexao.row_factory = sqlite3.Row
        cursor = conexao.cursor()
        cursor.execute('SELECT nome, categoria, latitude, longitude FROM comercios')
        locais = cursor.fetchall()
        conexao.close()
        return [dict(l) for l in locais]
    except Exception as e:
        print(f"Aviso: Banco de dados não encontrado ou vazio ({e}). Usando dados fixos.")
        # Caso o banco não exista, retorna os dados fixos da versão estática
        return [
            {'nome': 'Santos Store', 'categoria': 'comercio', 'latitude': -23.95144, 'longitude': -46.34041},
            {'nome': 'Café da Vila', 'categoria': 'comercio', 'latitude': -23.95144, 'longitude': -46.34041},
            {'nome': 'Bar do Zé', 'categoria': 'comercio', 'latitude': -23.95232, 'longitude': -46.33062}
        ]

# Rota 1: A sua página original (Produção)
@app.route('/')
def home():
    return render_template('index.html')

# Rota 2: A nova versão (Visual Times Square)
@app.route('/v2')
def home_v2():
    # Passamos os locais para o HTML caso você queira usar no futuro
    locais = obter_locais()
    return render_template('index_v2.html', pontos_mapa=locais)

# Rota 3: API do Clima (Otimização de Performance)
@app.route('/api/clima')
def api_clima():
    try:
        resp = requests.get(
            "https://api.open-meteo.com/v1/forecast",
            params={"latitude": -23.9518, "longitude": -46.3391, "current_weather": True},
            timeout=5
        )
        return jsonify(resp.json())
    except:
        return jsonify({"current_weather": {"temperature": 25}})

if __name__ == '__main__':
    # debug=True só para ambiente local
    app.run(debug=True)