import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent))
from app import app

client = app.test_client()


def test_home_ok():
    r = client.get("/")
    assert r.status_code == 200
    assert b"VILA BELMIRO VIVA" in r.data


def test_home_injeta_dados_do_banco():
    html = client.get("/").get_data(as_text=True)
    assert 'id="dados-locais"' in html and "Vila Bar" in html
    assert 'id="dados-jogos"' in html


def test_api_locais():
    dados = client.get("/api/locais").get_json()
    assert len(dados) >= 1
    assert {"nome", "categoria", "latitude", "longitude"} <= set(dados[0])


def test_api_jogos():
    dados = client.get("/api/jogos").get_json()
    assert all("data_hora" in j for j in dados)


def test_arquivos_estaticos():
    assert client.get("/app.js").status_code == 200
    assert client.get("/style.css").status_code == 200
