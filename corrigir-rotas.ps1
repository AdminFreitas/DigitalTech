$map = @{
  'base64.tsx'            = '/ferramentas/base64'
  'canonical.tsx'         = '/ferramentas/canonical'
  'color-picker.tsx'      = '/ferramentas/color-picker'
  'hash.tsx'              = '/ferramentas/hash'
  'json-formatter.tsx'    = '/ferramentas/json-formatter'
  'keyword-density.tsx'   = '/ferramentas/keyword-density'
  'meta-tags.tsx'         = '/ferramentas/meta-tags'
  'open-graph.tsx'        = '/ferramentas/open-graph'
  'pixel-helper.tsx'      = '/ferramentas/pixel-helper'
  'prompt-generator.tsx'  = '/ferramentas/prompt-generator'
  'qr-code-generator.tsx' = '/ferramentas/qr-code-generator'
  'rewriter.tsx'          = '/ferramentas/rewriter'
  'robots.tsx'            = '/ferramentas/robots'
  'schema.tsx'            = '/ferramentas/schema'
  'sitemap.tsx'           = '/ferramentas/sitemap'
  'summarizer.tsx'        = '/ferramentas/summarizer'
  'translator.tsx'        = '/ferramentas/translator'
  'utm-builder.tsx'       = '/ferramentas/utm-builder'
  'uuid.tsx'              = '/ferramentas/uuid'
}

$pattern = 'export const Route = \{\s*component:\s*(\w+),\s*\};'

foreach ($file in $map.Keys) {
  $path = "src\routes\ferramentas\$file"
  $routePath = $map[$file]

  if (-not (Test-Path $path)) {
    Write-Host "AVISO: arquivo nao encontrado -> $path" -ForegroundColor Yellow
    continue
  }

  $content = Get-Content -Raw -Path $path
  $hasImport = $content -match 'createFileRoute'

  $evaluator = {
    param($m)
    "export const Route = createFileRoute('$routePath')({`n  component: $($m.Groups[1].Value),`n});"
  }

  $newContent = [regex]::Replace($content, $pattern, [System.Text.RegularExpressions.MatchEvaluator]$evaluator)

  if ($newContent -eq $content) {
    Write-Host "AVISO: padrao 'export const Route = { component: ... }' NAO encontrado em -> $path" -ForegroundColor Yellow
    continue
  }

  if (-not $hasImport) {
    $newContent = "import { createFileRoute } from '@tanstack/react-router';`n" + $newContent
  }

  Set-Content -Path $path -Value $newContent -Encoding UTF8
  Write-Host "Corrigido: $path" -ForegroundColor Green
}

Write-Host "`nConcluido. Verificando se sobrou algum arquivo quebrado..." -ForegroundColor Cyan
Get-ChildItem -Recurse -Include *.tsx -Path src\routes | Select-String -Pattern "export const Route = \{" -List
