# ============================================================
# LIMPEZA DE ARQUITETURA — DigitalTech
# Rode a partir da raiz do projeto. Cada grupo termina com
# um build de verificação — se algo quebrar, você sabe
# exatamente qual grupo causou.
# ============================================================

cd "C:\Users\miche\OneDrive\Documentos\digitaltech-clone\digitaltech"

# --- GRUPO A: duplicatas confirmadas (arquivos soltos em src/routes/noticias/ e contato1) ---
Remove-Item "src\routes\noticias\Footer.tsx" -ErrorAction SilentlyContinue
Remove-Item "src\routes\artigos\styles.css" -ErrorAction SilentlyContinue
Remove-Item "src\routes\noticias\home-index.tsx" -ErrorAction SilentlyContinue
Remove-Item "src\routes\contato1.tsx" -ErrorAction SilentlyContinue
Remove-Item "src\routes\noticias\static.yml" -ErrorAction SilentlyContinue
Remove-Item "src\routes\noticias\publicar-artigos-agente.yml" -ErrorAction SilentlyContinue
Remove-Item "src\routes\noticias\CONCLUSAO.md" -ErrorAction SilentlyContinue
Remove-Item "src\components\noticias\NewsFooter.tsx" -ErrorAction SilentlyContinue

Write-Host "`n=== GRUPO A removido. Rodando build de verificacao... ===`n"
bun run build

# ============================================================
# Pare aqui e confira se o build acima terminou sem erro antes
# de continuar. Se quebrou, rode "git diff --stat" pra ver o
# que mudou e me avise qual arquivo reclamou.
# ============================================================


# --- GRUPO B: pasta inteira de protoripos abandonados (_staging) ---
# 234 arquivos, 2.1MB, zero referencias confirmadas pelo knip.
Remove-Item "_staging" -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "`n=== GRUPO B (_staging) removido. Rodando build de verificacao... ===`n"
bun run build

# ============================================================
# Confira de novo antes do proximo grupo.
# ============================================================


# --- GRUPO C (OPCIONAL, faca em commit separado): componentes ---
# --- shadcn/ui nunca usados + dependencias correspondentes.   ---
# Descomente as linhas abaixo quando estiver pronto pra essa etapa.

# $componentesNaoUsados = @(
#   "accordion","alert-dialog","alert","aspect-ratio","avatar","badge","breadcrumb",
#   "button","calendar","card","carousel","chart","checkbox","collapsible","command",
#   "context-menu","dialog","drawer","dropdown-menu","form","hover-card","input-otp",
#   "input","label","menubar","navigation-menu","pagination","popover","progress",
#   "radio-group","resizable","scroll-area","select","separator","sheet","sidebar",
#   "skeleton","slider","sonner","switch","table","tabs","textarea","toggle-group",
#   "toggle","tooltip"
# )
# foreach ($c in $componentesNaoUsados) {
#   Remove-Item "src\components\ui\$c.tsx" -ErrorAction SilentlyContinue
# }
# Remove-Item "src\hooks\use-mobile.tsx" -ErrorAction SilentlyContinue
#
# bun remove @hookform/resolvers @radix-ui/react-accordion @radix-ui/react-alert-dialog `
#   @radix-ui/react-aspect-ratio @radix-ui/react-avatar @radix-ui/react-checkbox `
#   @radix-ui/react-collapsible @radix-ui/react-context-menu @radix-ui/react-dialog `
#   @radix-ui/react-dropdown-menu @radix-ui/react-hover-card @radix-ui/react-label `
#   @radix-ui/react-menubar @radix-ui/react-navigation-menu @radix-ui/react-popover `
#   @radix-ui/react-progress @radix-ui/react-radio-group @radix-ui/react-scroll-area `
#   @radix-ui/react-select @radix-ui/react-separator @radix-ui/react-slider `
#   @radix-ui/react-switch @radix-ui/react-tabs @radix-ui/react-toggle `
#   @radix-ui/react-toggle-group @radix-ui/react-tooltip class-variance-authority `
#   cmdk date-fns embla-carousel-react input-otp react-day-picker react-hook-form `
#   react-resizable-panels recharts sonner vaul zod
#
# bun run build


Write-Host "`n=== Limpeza concluida. Rode 'npx tsc --noEmit' pra conferir os erros de TypeScript. ===`n"
