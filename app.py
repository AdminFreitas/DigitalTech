import logging
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from config.database import get_db
from repositories.produto_repository import ProdutoRepository
from repositories.artigo_repository import ArtigoRepository
from repositories.noticia_repository import NoticiaRepository
from agents import publisher
from pipeline.gerar_artigos import gerar_e_processar_artigo
from pipeline.gerar_noticias import gerar_e_processar_noticia

logger = logging.getLogger("digitaltech")
logging.basicConfig(level=logging.INFO)

app = FastAPI(
    title="DigitalTech — Agente ADS",
    description="API de produtos e agente de publicação de artigos — Michel Freitas",
    version="2.2.0"
)

class ProdutoInput(BaseModel):
    nome: str = Field(..., min_length=2, max_length=100)
    descricao: str = Field(default="")
    preco: float = Field(..., gt=0)
    estoque: int = Field(..., ge=0)

class GerarArtigoInput(BaseModel):
    tema: str = Field(..., min_length=5, max_length=200, description="Tema do artigo a ser gerado")
    categoria: str = Field(default="Tecnologia", description="Categoria do artigo no blog")
    publicar_imediatamente: bool = Field(
        default=False,
        description="Se True, já publica no GitHub e marca como 'publicado'. Se False, entra como 'rascunho'."
    )

class GerarNoticiaInput(BaseModel):
    categoria: str = Field(default="Tecnologia", description="Categoria da notícia no blog")
    publicar_imediatamente: bool = Field(
        default=False,
        description="Se True, já publica no GitHub e marca como 'publicado'. Se False, entra como 'rascunho'."
    )

@app.get("/health", tags=["Sistema"])
def health_check():
    return {"status": "ok", "versao": "2.2.0", "projeto": "DigitalTech ADS"}

@app.get("/produtos", tags=["Produtos"])
def listar_produtos(db: Session = Depends(get_db)):
    repo = ProdutoRepository(db)
    return {"produtos": [dict(p._mapping) for p in repo.listar_todos()]}

@app.get("/produtos/{produto_id}", tags=["Produtos"])
def buscar_produto(produto_id: int, db: Session = Depends(get_db)):
    repo = ProdutoRepository(db)
    produto = repo.buscar_por_id(produto_id)
    if not produto:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    return dict(produto._mapping)

@app.post("/produtos", status_code=201, tags=["Produtos"])
def criar_produto(dados: ProdutoInput, db: Session = Depends(get_db)):
    repo = ProdutoRepository(db)
    repo.criar(dados.nome, dados.descricao, dados.preco, dados.estoque)
    return {"mensagem": "Produto criado com sucesso"}

@app.put("/produtos/{produto_id}", tags=["Produtos"])
def atualizar_produto(produto_id: int, dados: ProdutoInput, db: Session = Depends(get_db)):
    repo = ProdutoRepository(db)
    if not repo.buscar_por_id(produto_id):
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    repo.atualizar(produto_id, dados.nome, dados.descricao, dados.preco, dados.estoque)
    return {"mensagem": "Produto atualizado com sucesso"}

@app.delete("/produtos/{produto_id}", tags=["Produtos"])
def deletar_produto(produto_id: int, db: Session = Depends(get_db)):
    repo = ProdutoRepository(db)
    if not repo.buscar_por_id(produto_id):
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    repo.deletar(produto_id)
    return {"mensagem": "Produto desativado com sucesso"}

@app.post("/artigos/gerar", status_code=201, tags=["Agente de Artigos"])
def gerar_e_salvar_artigo(dados: GerarArtigoInput, db: Session = Depends(get_db)):
    """
    Roda a cadeia completa (pesquisador → editor → revisor → imagem →
    seo → publisher) e salva no Neon como 'rascunho'. Se
    publicar_imediatamente=True, também publica no GitHub em seguida.
    """
    try:
        resultado = gerar_e_processar_artigo(
            db,
            tema=dados.tema,
            categoria=dados.categoria,
            publicar_imediatamente=dados.publicar_imediatamente,
        )
    except ValueError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("Falha ao gerar artigo")
        raise HTTPException(status_code=502, detail="Erro ao gerar artigo.") from exc

    resultado["mensagem"] = "Artigo gerado e salvo no banco Neon com sucesso."
    return resultado

@app.post("/artigos/publicar/{artigo_id}", tags=["Agente de Artigos"])
def publicar_artigo_existente(artigo_id: int, db: Session = Depends(get_db)):
    """Publica no GitHub e muda o status de um artigo salvo como 'rascunho' para 'publicado'."""
    repo = ArtigoRepository(db)
    artigo = repo.buscar_por_id(artigo_id)
    if not artigo:
        raise HTTPException(status_code=404, detail="Artigo não encontrado")
    if artigo.status == "publicado":
        raise HTTPException(status_code=409, detail="Artigo já está publicado")

    try:
        resultado = publisher.publicar(db, artigo_id)
    except Exception as exc:
        logger.exception("Falha ao publicar no GitHub")
        raise HTTPException(status_code=502, detail="Erro ao publicar no GitHub.") from exc

    resultado["mensagem"] = "Artigo publicado com sucesso."
    return resultado

@app.post("/noticias/gerar", status_code=201, tags=["Agente de Notícias"])
def gerar_e_salvar_noticia(dados: GerarNoticiaInput):
    """
    Busca notícias recentes via RSS e roda a cadeia completa
    (editor → revisor → imagem → seo → publisher) para a primeira
    notícia ainda não publicada. Publicar depois usa o mesmo
    /artigos/publicar/{id} — notícias ficam na mesma tabela `artigos`.
    """
    try:
        resultado = gerar_e_processar_noticia(
            categoria=dados.categoria,
            publicar_imediatamente=dados.publicar_imediatamente,
        )
    except ValueError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("Falha ao gerar notícia")
        raise HTTPException(status_code=502, detail="Erro ao gerar notícia.") from exc

    resultado["mensagem"] = "Notícia gerada e salva no banco Neon com sucesso."
    return resultado

@app.post("/noticias/publicar/{noticia_id}", tags=["Agente de Notícias"])
def publicar_noticia_existente(noticia_id: int, db: Session = Depends(get_db)):
    """Muda uma notícia salva como 'rascunho' para 'publicado'."""
    repo = NoticiaRepository(db)
    noticia = repo.buscar_por_id(noticia_id)
    if not noticia:
        raise HTTPException(status_code=404, detail="Notícia não encontrada")
    if noticia.status == "publicado":
        raise HTTPException(status_code=409, detail="Notícia já está publicada")
    repo.publicar(noticia_id)
    return {
        "id": noticia_id,
        "slug": noticia.slug,
        "status": "publicado",
        "mensagem": "Notícia publicada com sucesso.",
    }

@app.get("/artigos", tags=["Agente de Artigos"])
def listar_artigos(db: Session = Depends(get_db)):
    repo = ArtigoRepository(db)
    artigos = repo.listar_todos()
    return {
        "artigos": [
            {
                "id": a.id, "slug": a.slug, "titulo": a.titulo,
                "categoria": a.categoria, "status": a.status,
                "data_publicacao": str(a.data_publicacao) if a.data_publicacao else None,
            }
            for a in artigos
        ]
    }

@app.get("/artigos/{artigo_id}", tags=["Agente de Artigos"])
def buscar_artigo(artigo_id: int, db: Session = Depends(get_db)):
    repo = ArtigoRepository(db)
    artigo = repo.buscar_por_id(artigo_id)
    if not artigo:
        raise HTTPException(status_code=404, detail="Artigo não encontrado")
    return dict(artigo._mapping)
