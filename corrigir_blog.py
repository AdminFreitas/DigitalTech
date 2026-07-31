"""
corrigir_blog.py
Faz duas coisas, cada uma com confirmação separada:
  1) Commit + push das mudanças pendentes do blog (páginas de categoria,
     filtro por categoria, lib categorias.ts).
  2) Conserta o erro "Cannot find module 'vitefu/src/index.js'" limpando
     cache do npm e reinstalando node_modules do zero.

Como usar:
  1. Copie este arquivo para dentro de C:\\Projetos\\digitaltech
  2. No terminal, nessa pasta, rode: python corrigir_blog.py
"""

import os
import shutil
import subprocess
import sys


def rodar(comando, check=True):
    print(f"\n$ {' '.join(comando)}")
    resultado = subprocess.run(comando, shell=False)
    if check and resultado.returncode != 0:
        print(f"ERRO: comando falhou com código {resultado.returncode}.")
        sys.exit(1)
    return resultado.returncode


def perguntar(mensagem):
    resposta = input(f"\n{mensagem} (digite 'sim' para continuar): ")
    return resposta.strip().lower() == "sim"


# --- 0. Confere a pasta -------------------------------------------------
if not os.path.isfile("package.json"):
    print("ERRO: não encontrei package.json aqui.")
    print("Rode este script DE DENTRO da pasta do repositório digitaltech (o blog).")
    sys.exit(1)

with open("package.json", "r", encoding="utf-8") as f:
    if '"name": "digitaltech"' not in f.read():
        print("AVISO: este package.json não parece ser o do projeto 'digitaltech'.")
        if not perguntar("Continuar mesmo assim?"):
            sys.exit(0)

# =========================================================================
# PARTE 1 — Commit e push das mudanças pendentes
# =========================================================================
print("\n===== PARTE 1: commit das mudanças pendentes =====")
rodar(["git", "status"])

if perguntar(
    "Essas são as mudanças das páginas de categoria (Fase 3). "
    "Commitar e enviar tudo para o GitHub?"
):
    rodar(["git", "add", "-A"])
    mensagem = (
        "feat: páginas de categoria com busca real no banco\n\n"
        "Adiciona src/lib/categorias.ts (getCategoriaPorSlug, getSubcategorias,\n"
        "getArtigosPorCategoria, getNoticiasPorCategoria, getCategoriasComFilhas).\n"
        "Reescreve src/routes/categorias/$categoria.tsx com abas Artigos/Notícias\n"
        "e chips de subcategoria. Adiciona filtro por categoria em\n"
        "src/routes/artigos/index.tsx. Ajusta src/lib/artigos.ts (JOIN com\n"
        "categorias via categoria_id)."
    )
    rodar(["git", "commit", "-m", mensagem])
    rodar(["git", "push", "origin", "main"])
    print("\nOK: mudanças do blog commitadas e enviadas.")
else:
    print("Pulei o commit. Nada foi enviado.")

# =========================================================================
# PARTE 2 — Corrige o ambiente npm (erro do vitefu)
# =========================================================================
print("\n===== PARTE 2: corrigir ambiente npm (erro do vitefu) =====")
print(
    "Isso vai: limpar o cache do npm, apagar a pasta node_modules e o\n"
    "package-lock.json, e reinstalar tudo do zero. Pode demorar alguns minutos."
)

if perguntar("Quer rodar essa correção agora?"):
    rodar(["npm", "cache", "clean", "--force"])

    if os.path.isdir("node_modules"):
        print("\nApagando node_modules...")
        shutil.rmtree("node_modules")
        print("OK: node_modules removido.")

    if os.path.isfile("package-lock.json"):
        print("Apagando package-lock.json...")
        os.remove("package-lock.json")
        print("OK: package-lock.json removido.")

    rodar(["npm", "install"])

    print("\nOK: ambiente reinstalado.")
    print("Rode 'npm run dev' para conferir se o servidor sobe normalmente.")

    # Verifica se o reinstall gerou um package-lock.json diferente do
    # que já estava commitado (se a Parte 1 tiver rodado).
    resultado = subprocess.run(
        ["git", "status", "--short", "package-lock.json"],
        capture_output=True,
        text=True,
    )
    if resultado.stdout.strip():
        print("\nO package-lock.json mudou depois da reinstalação.")
        if perguntar("Commitar essa atualização do package-lock.json também?"):
            rodar(["git", "add", "package-lock.json"])
            rodar(
                [
                    "git",
                    "commit",
                    "-m",
                    "chore: atualiza package-lock.json após reinstalação limpa (correção do vitefu)",
                ]
            )
            rodar(["git", "push", "origin", "main"])
            print("OK: package-lock.json atualizado e enviado.")
else:
    print("Pulei a correção do npm.")

print("\nTudo pronto. Boa noite!")
