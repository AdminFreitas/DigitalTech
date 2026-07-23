import { createFileRoute } from "@tanstack/react-router";
import { useState, useCallback, useRef } from "react";

export const Route = createFileRoute("/ferramentas/conversor-imagens")({
  head: () => ({
    meta: [
      { title: "Conversor de Imagens — DIGITALTECH" },
      { name: "description", content: "Converta imagens entre JPG, PNG, WebP, AVIF e mais. 100% no navegador, sem uploads." },
    ],
  }),
  component: ConversorPage,
});

// ─── Types ────────────────────────────────────────────────────────────────────

type OutFormat  = "jpeg" | "png" | "webp" | "avif";
type ItemStatus = "idle" | "processing" | "done" | "error";

interface ImageItem {
  id: string;
  file: File;
  name: string;
  originalUrl: string;
  convertedUrl: string | null;
  originalSize: number;
  convertedSize: number | null;
  origW: number; origH: number;
  convW: number | null; convH: number | null;
  origFormat: string;
  hasTransparency: boolean;
  status: ItemStatus;
  error?: string;
}

interface Settings {
  outFormat: OutFormat;
  quality: number;
  bgColor: string;
  keepTransparency: boolean;
  resize: { enabled: boolean; w: string; h: string; pct: string; lock: boolean; mode: "pixels" | "pct" };
  removeExif: boolean;
  autoOrient: boolean;
}

interface Stats {
  total: number;
  done: number;
  totalOrig: number;
  totalConv: number;
  startedAt: number | null;
  endedAt: number | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const uid = () => Math.random().toString(36).slice(2, 10);
const fmt = (b: number) => b < 1024 ? `${b} B` : b < 1_048_576 ? `${(b/1024).toFixed(1)} KB` : `${(b/1_048_576).toFixed(2)} MB`;
const pct = (o: number, c: number) => o > 0 ? ((o - c) / o * 100).toFixed(1) : "0";

const MIME: Record<OutFormat, string> = {
  jpeg: "image/jpeg", png: "image/png", webp: "image/webp", avif: "image/avif",
};
const EXT: Record<OutFormat, string> = { jpeg: "jpg", png: "png", webp: "webp", avif: "avif" };
const ACCEPTS = ".jpg,.jpeg,.png,.webp,.avif,.gif,.bmp,.tiff,.tif,.svg";

const COMPAT: Record<string, { bg: boolean; quality: boolean; note?: string }> = {
  "jpeg": { bg: true,  quality: true  },
  "png":  { bg: false, quality: false, note: "Lossless — qualidade não afeta PNG" },
  "webp": { bg: false, quality: true  },
  "avif": { bg: false, quality: true, note: "Suporte varia por navegador" },
};

// ─── Conversion engine ────────────────────────────────────────────────────────

async function convertImage(
  item: ImageItem,
  settings: Settings,
): Promise<{ blob: Blob; w: number; h: number }> {
  const imgEl = new Image();
  await new Promise<void>((res, rej) => {
    imgEl.onload  = () => res();
    imgEl.onerror = rej;
    imgEl.src     = item.originalUrl;
  });

  // Calculate target dimensions
  let tw = item.origW, th = item.origH;
  if (settings.resize.enabled && item.origW > 0) {
    if (settings.resize.mode === "pct") {
      const p = parseFloat(settings.resize.pct) / 100 || 1;
      tw = Math.round(item.origW * p);
      th = Math.round(item.origH * p);
    } else {
      const rw = parseInt(settings.resize.w) || 0;
      const rh = parseInt(settings.resize.h) || 0;
      const ratio = item.origW / item.origH;
      if (settings.resize.lock) {
        if (rw && !rh)       { tw = rw; th = Math.round(rw / ratio); }
        else if (rh && !rw)  { th = rh; tw = Math.round(rh * ratio); }
        else if (rw && rh)   { tw = rw; th = rh; }
      } else {
        if (rw) tw = rw;
        if (rh) th = rh;
      }
    }
  }
  tw = Math.max(1, tw); th = Math.max(1, th);

  const canvas = document.createElement("canvas");
  canvas.width = tw; canvas.height = th;
  const ctx = canvas.getContext("2d")!;

  // Fill background for JPEG (removes transparency)
  if (settings.outFormat === "jpeg" && !settings.keepTransparency) {
    ctx.fillStyle = settings.bgColor;
    ctx.fillRect(0, 0, tw, th);
  }

  ctx.drawImage(imgEl, 0, 0, tw, th);

  const mime    = MIME[settings.outFormat];
  const quality = settings.outFormat === "png" ? undefined : settings.quality / 100;

  const blob = await new Promise<Blob>((res, rej) =>
    canvas.toBlob((b) => b ? res(b) : rej(new Error("Falha na conversão")), mime, quality)
  );

  return { blob, w: tw, h: th };
}

// ─── Components ───────────────────────────────────────────────────────────────

function DropZone({ onFiles }: { onFiles: (f: File[]) => void }) {
  const [drag, setDrag] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  const handle = (files: FileList | null) => {
    if (!files) return;
    onFiles(Array.from(files).filter((f) => f.type.startsWith("image/") || f.name.endsWith(".svg")));
  };
  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => { e.preventDefault(); setDrag(false); handle(e.dataTransfer.files); }}
      onClick={() => ref.current?.click()}
      className={`flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed cursor-pointer transition-all py-16 text-center select-none ${
        drag
          ? "border-[color:var(--primary-cyan)] bg-[color:var(--primary-cyan)]/5 scale-[1.01]"
          : "border-[var(--glass-border)] bg-[var(--bg-secondary)] hover:border-[color:var(--primary-cyan)]/40"
      }`}
    >
      <div className="w-16 h-16 rounded-2xl bg-[color:var(--primary-cyan)]/10 border border-[color:var(--primary-cyan)]/20 flex items-center justify-center">
        <svg className="w-7 h-7 text-[color:var(--primary-cyan)]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"/>
        </svg>
      </div>
      <div>
        <p className="text-[var(--text-primary)] font-semibold">
          Arraste imagens ou <span className="text-[color:var(--primary-cyan)]">clique para selecionar</span>
        </p>
        <p className="text-sm text-[var(--text-muted)] mt-1">JPG, PNG, WebP, AVIF, GIF, BMP, TIFF, SVG · Múltiplos arquivos</p>
      </div>
      <input ref={ref} type="file" multiple accept={ACCEPTS} className="hidden"
        onChange={(e) => handle(e.target.files)} />
    </div>
  );
}

function FormatBar({ value, onChange }: { value: OutFormat; onChange: (f: OutFormat) => void }) {
  const opts: { id: OutFormat; label: string; sub: string }[] = [
    { id: "jpeg", label: "JPG",  sub: "Menor tamanho" },
    { id: "png",  label: "PNG",  sub: "Sem perdas" },
    { id: "webp", label: "WebP", sub: "Melhor web" },
    { id: "avif", label: "AVIF", sub: "Mais moderno" },
  ];
  return (
    <div className="rounded-xl border border-[var(--glass-border)] bg-[var(--bg-secondary)] p-4 mb-4">
      <p className="text-[11px] uppercase tracking-widest text-[var(--text-muted)] mb-3">Converter para</p>
      <div className="grid grid-cols-4 gap-2">
        {opts.map((o) => (
          <button key={o.id} onClick={() => onChange(o.id)}
            className={`flex flex-col items-center py-3 rounded-xl text-xs font-bold uppercase tracking-wide transition-all border ${
              value === o.id
                ? "bg-[color:var(--primary-cyan)]/15 border-[color:var(--primary-cyan)]/50 text-[color:var(--primary-cyan)]"
                : "border-[var(--glass-border)] text-[var(--text-secondary)] hover:border-[color:var(--primary-cyan)]/25 hover:text-[var(--text-primary)]"
            }`}>
            <span className="text-base mb-1">{o.label}</span>
            <span className="text-[9px] opacity-60 normal-case font-normal">{o.sub}</span>
          </button>
        ))}
      </div>
      {COMPAT[value]?.note && (
        <p className="mt-2 text-[11px] text-[color:var(--secondary-jade)] flex items-center gap-1.5">
          <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd"/></svg>
          {COMPAT[value].note}
        </p>
      )}
    </div>
  );
}

function SettingsPanel({ s, set }: { s: Settings; set: (v: Settings) => void }) {
  const upd   = (p: Partial<Settings>) => set({ ...s, ...p });
  const updR  = (p: Partial<Settings["resize"]>) => upd({ resize: { ...s.resize, ...p } });
  const compat = COMPAT[s.outFormat];
  return (
    <div className="space-y-5">
      {compat.quality && (
        <div>
          <div className="flex justify-between mb-1.5">
            <p className="text-[11px] uppercase tracking-widest text-[var(--text-muted)]">Qualidade</p>
            <span className="text-sm font-mono font-semibold text-[color:var(--primary-cyan)]">{s.quality}%</span>
          </div>
          <input type="range" min="1" max="100" value={s.quality}
            onChange={(e) => upd({ quality: +e.target.value })} className="w-full accent-[#00D4FF]" />
          <div className="flex justify-between text-[9px] text-[var(--text-muted)] mt-0.5">
            <span>Menor arquivo</span><span>Melhor qualidade</span>
          </div>
        </div>
      )}

      {/* Transparency / BG color */}
      <div>
        <p className="text-[11px] uppercase tracking-widest text-[var(--text-muted)] mb-2">Transparência</p>
        {s.outFormat === "jpeg" ? (
          <div className="space-y-2">
            <p className="text-xs text-[var(--text-secondary)]">JPG não suporta transparência. Escolha a cor de fundo:</p>
            <div className="flex items-center gap-3">
              <input type="color" value={s.bgColor} onChange={(e) => upd({ bgColor: e.target.value })}
                className="w-10 h-8 rounded cursor-pointer border border-[var(--glass-border)]" />
              <div className="flex gap-2">
                {["#ffffff","#000000","#f5f5f5","#1a1a2e"].map((c) => (
                  <button key={c} onClick={() => upd({ bgColor: c })}
                    className={`w-7 h-7 rounded-lg border-2 transition-all ${s.bgColor === c ? "border-[color:var(--primary-cyan)]" : "border-transparent"}`}
                    style={{ background: c }} title={c} />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <label className="flex items-center gap-2.5 cursor-pointer text-sm text-[var(--text-secondary)]">
            <input type="checkbox" checked={s.keepTransparency} onChange={(e) => upd({ keepTransparency: e.target.checked })} className="accent-[#00D4FF]" />
            Manter transparência
          </label>
        )}
      </div>

      {/* Resize */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-[11px] uppercase tracking-widest text-[var(--text-muted)]">Redimensionar</p>
          <button onClick={() => updR({ enabled: !s.resize.enabled })}
            className={`w-8 h-4 rounded-full transition-all relative ${s.resize.enabled ? "bg-[color:var(--primary-cyan)]" : "bg-[var(--glass-border)]"}`}>
            <span className="absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all"
              style={{ left: s.resize.enabled ? "18px" : "2px" }} />
          </button>
        </div>
        {s.resize.enabled && (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-1.5">
              {(["pixels","pct"] as const).map((m) => (
                <button key={m} onClick={() => updR({ mode: m })}
                  className={`py-1.5 rounded-lg text-xs font-medium transition-all border ${
                    s.resize.mode === m
                      ? "bg-[color:var(--primary-cyan)]/10 border-[color:var(--primary-cyan)]/40 text-[color:var(--primary-cyan)]"
                      : "border-[var(--glass-border)] text-[var(--text-muted)]"
                  }`}>
                  {m === "pixels" ? "Pixels" : "Porcentagem"}
                </button>
              ))}
            </div>
            {s.resize.mode === "pixels" ? (
              <div className="grid grid-cols-2 gap-2">
                {([["w","Largura"],["h","Altura"]] as const).map(([k, label]) => (
                  <div key={k}>
                    <label className="text-[10px] text-[var(--text-muted)] block mb-0.5">{label} (px)</label>
                    <input type="number" min="1" placeholder="Auto" value={s.resize[k]}
                      onChange={(e) => updR({ [k]: e.target.value })}
                      className="w-full rounded-lg border border-[var(--glass-border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] text-sm px-2.5 py-1.5 focus:outline-none focus:border-[color:var(--primary-cyan)]/50" />
                  </div>
                ))}
                <label className="col-span-2 flex items-center gap-2 cursor-pointer text-xs text-[var(--text-secondary)]">
                  <input type="checkbox" checked={s.resize.lock} onChange={(e) => updR({ lock: e.target.checked })} className="accent-[#00D4FF]" />
                  Manter proporção
                </label>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <input type="number" min="1" max="500" value={s.resize.pct}
                  onChange={(e) => updR({ pct: e.target.value })}
                  className="w-20 rounded-lg border border-[var(--glass-border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] text-sm px-2.5 py-1.5 focus:outline-none" />
                <span className="text-sm text-[var(--text-muted)]">% do original</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Optimization */}
      <div>
        <p className="text-[11px] uppercase tracking-widest text-[var(--text-muted)] mb-2">Otimização</p>
        {[
          { key: "removeExif" as const, label: "Remover metadados EXIF" },
          { key: "autoOrient" as const, label: "Corrigir orientação automática" },
        ].map(({ key, label }) => (
          <label key={key} className="flex items-center gap-2.5 cursor-pointer text-sm text-[var(--text-secondary)] mb-2">
            <input type="checkbox" checked={s[key]} onChange={(e) => upd({ [key]: e.target.checked })} className="accent-[#00D4FF]" />
            {label}
          </label>
        ))}
      </div>
    </div>
  );
}

function ComparisonSlider({ before, after, alt }: { before: string; after: string; alt: string }) {
  const [pos, setPos]   = useState(50);
  const [drag, setDrag] = useState(false);
  const ref             = useRef<HTMLDivElement>(null);
  const update = useCallback((x: number) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setPos(Math.max(2, Math.min(98, ((x - r.left) / r.width) * 100)));
  }, []);
  return (
    <div ref={ref}
      className="relative select-none overflow-hidden rounded-xl border border-[var(--glass-border)] cursor-col-resize"
      onMouseDown={() => setDrag(true)}
      onMouseMove={(e) => drag && update(e.clientX)}
      onMouseUp={() => setDrag(false)}
      onMouseLeave={() => setDrag(false)}
      onTouchMove={(e) => update(e.touches[0].clientX)}>
      <img src={after}  alt="convertida" className="w-full block"  draggable={false} />
      <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ width: `${pos}%` }}>
        <img src={before} alt="original" className="block" draggable={false}
          style={{ width: ref.current ? `${ref.current.offsetWidth}px` : "100%" }} />
      </div>
      <div className="absolute top-0 bottom-0 w-0.5 bg-white/80 pointer-events-none" style={{ left: `${pos}%` }}>
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-white shadow-xl flex items-center justify-center pointer-events-none">
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M8 9l-3 3 3 3M16 9l3 3-3 3"/>
          </svg>
        </div>
      </div>
      <span className="absolute top-2 left-2 text-[10px] font-bold text-white bg-black/50 rounded px-1.5 py-0.5 pointer-events-none">ORIGINAL</span>
      <span className="absolute top-2 right-2 text-[10px] font-bold text-white bg-[color:var(--primary-cyan)]/80 rounded px-1.5 py-0.5 pointer-events-none">CONVERTIDA</span>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

function ConversorPage() {
  const [images, setImages]   = useState<ImageItem[]>([]);
  const [active, setActive]   = useState<string | null>(null);
  const [proc, setProc]       = useState(false);
  const [stats, setStats]     = useState<Stats>({ total: 0, done: 0, totalOrig: 0, totalConv: 0, startedAt: null, endedAt: null });
  const [settings, setSettings] = useState<Settings>({
    outFormat: "webp", quality: 82, bgColor: "#ffffff",
    keepTransparency: true, removeExif: true, autoOrient: true,
    resize: { enabled: false, mode: "pixels", w: "", h: "", pct: "100", lock: true },
  });

  const activeItem = images.find((i) => i.id === active) ?? images[0] ?? null;

  const addFiles = useCallback((files: File[]) => {
    const items: ImageItem[] = files.map((f) => ({
      id: uid(), file: f, name: f.name,
      originalUrl: URL.createObjectURL(f),
      convertedUrl: null, originalSize: f.size, convertedSize: null,
      origW: 0, origH: 0, convW: null, convH: null,
      origFormat: f.type || "image/svg+xml", hasTransparency: f.type === "image/png" || f.type === "image/webp",
      status: "idle",
    }));
    items.forEach((item) => {
      const img = new Image();
      img.onload = () =>
        setImages((p) => p.map((i) => i.id === item.id ? { ...i, origW: img.naturalWidth, origH: img.naturalHeight } : i));
      img.src = item.originalUrl;
    });
    setImages((p) => [...p, ...items]);
    if (!active && items.length) setActive(items[0].id);
  }, [active]);

  const runOne = useCallback(async (id: string) => {
    const item = images.find((i) => i.id === id);
    if (!item) return;
    setImages((p) => p.map((i) => i.id === id ? { ...i, status: "processing" } : i));
    try {
      const { blob, w, h } = await convertImage(item, settings);
      const url = URL.createObjectURL(blob);
      setImages((p) => p.map((i) => i.id === id ? {
        ...i, status: "done", convertedUrl: url, convertedSize: blob.size, convW: w, convH: h,
      } : i));
      setStats((s) => ({ ...s, done: s.done + 1, totalConv: s.totalConv + blob.size }));
    } catch (e) {
      setImages((p) => p.map((i) => i.id === id ? { ...i, status: "error", error: String(e) } : i));
    }
  }, [images, settings]);

  const runAll = useCallback(async () => {
    setProc(true);
    const t0 = Date.now();
    setStats({ total: images.length, done: 0, totalOrig: images.reduce((a, i) => a + i.originalSize, 0), totalConv: 0, startedAt: t0, endedAt: null });
    for (const item of images) await runOne(item.id);
    setStats((s) => ({ ...s, endedAt: Date.now() }));
    setProc(false);
  }, [images, runOne]);

  const downloadOne = (item: ImageItem) => {
    if (!item.convertedUrl) return;
    const base = item.name.replace(/\.[^.]+$/, "");
    const a = document.createElement("a");
    a.href = item.convertedUrl;
    a.download = `${base}.${EXT[settings.outFormat]}`;
    a.click();
  };

  const downloadAll = async () => {
    for (const item of images.filter((i) => i.status === "done")) {
      downloadOne(item);
      await new Promise((r) => setTimeout(r, 300));
    }
  };

  const remove = (id: string) =>
    setImages((p) => { const n = p.filter((i) => i.id !== id); if (active === id) setActive(n[0]?.id ?? null); return n; });

  const done = images.filter((i) => i.status === "done");

  return (
    <div className="mx-auto max-w-7xl px-4 pt-[var(--header-clearance)] pb-20 md:px-6">
      {/* Page header */}
      <div className="mb-6">
        <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--text-secondary)]">Ferramentas</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-[var(--text-primary)] md:text-3xl">
          Conversor de Imagens
        </h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          JPG, PNG, WebP, AVIF e mais · 100% no navegador · sem uploads · sem servidores
        </p>
      </div>

      {/* Format selector always visible */}
      {images.length > 0 && <FormatBar value={settings.outFormat} onChange={(f) => setSettings((s) => ({ ...s, outFormat: f }))} />}

      {images.length === 0 ? (
        <>
          <DropZone onFiles={addFiles} />
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { from: "JPG/JPEG", to: "WebP", desc: "30–40% menor" },
              { from: "PNG",      to: "WebP", desc: "Mantém transparência" },
              { from: "PNG",      to: "JPG",  desc: "Substitui fundo branco" },
              { from: "WebP",     to: "JPG",  desc: "Compatibilidade máxima" },
            ].map((c) => (
              <div key={c.from + c.to} className="rounded-xl border border-[var(--glass-border)] bg-[var(--bg-secondary)] p-3 text-center">
                <p className="text-xs font-mono font-bold text-[var(--text-primary)]">{c.from} → {c.to}</p>
                <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{c.desc}</p>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-[280px_1fr_260px] gap-4">

          {/* ── Lista de imagens ── */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[var(--text-muted)]">{images.length} imagem{images.length !== 1 ? "ns" : ""}</span>
              <div className="flex gap-3">
                <button onClick={() => setImages([])} className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">Limpar</button>
                <label className="text-xs text-[color:var(--primary-cyan)] cursor-pointer">
                  + Adicionar
                  <input type="file" multiple accept={ACCEPTS} className="hidden"
                    onChange={(e) => addFiles(Array.from(e.target.files ?? []))} />
                </label>
              </div>
            </div>

            <div className="space-y-1.5 mb-3">
              {images.map((item) => (
                <div key={item.id} onClick={() => setActive(item.id)}
                  className={`group flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                    active === item.id
                      ? "border-[color:var(--primary-cyan)]/50 bg-[color:var(--primary-cyan)]/5"
                      : "border-[var(--glass-border)] bg-[var(--bg-secondary)] hover:border-[color:var(--primary-cyan)]/25"
                  }`}>
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-[var(--bg-primary)] shrink-0 border border-[var(--glass-border)]">
                    <img src={item.originalUrl} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-[var(--text-primary)] truncate">{item.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] text-[var(--text-muted)] font-mono">{item.origFormat.replace("image/","")}</span>
                      <span className="text-[10px] text-[var(--text-muted)]">→</span>
                      <span className="text-[10px] font-mono font-semibold text-[color:var(--primary-cyan)]">{EXT[settings.outFormat]}</span>
                      {item.convertedSize && (
                        <span className="text-[10px] text-[color:var(--secondary-jade)]">-{pct(item.originalSize, item.convertedSize)}%</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {item.status === "idle" && (
                      <button onClick={(e) => { e.stopPropagation(); runOne(item.id); }}
                        className="text-[10px] px-2 py-0.5 rounded bg-[color:var(--primary-cyan)]/10 text-[color:var(--primary-cyan)] border border-[color:var(--primary-cyan)]/20 hover:bg-[color:var(--primary-cyan)]/20">
                        Converter
                      </button>
                    )}
                    {item.status === "processing" && (
                      <svg className="w-4 h-4 text-[color:var(--primary-cyan)] animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                    )}
                    {item.status === "done" && (
                      <div className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5 text-[color:var(--secondary-jade)]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
                        <button onClick={(e) => { e.stopPropagation(); downloadOne(item); }}
                          className="text-[color:var(--primary-cyan)] hover:opacity-70 transition-opacity">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                        </button>
                      </div>
                    )}
                    {item.status === "error" && <span className="text-[10px] text-red-400">Erro</span>}
                    <button onClick={(e) => { e.stopPropagation(); remove(item.id); }}
                      className="opacity-0 group-hover:opacity-100 text-[var(--text-muted)] hover:text-red-400 transition-all">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Batch buttons */}
            <div className="space-y-2">
              <button onClick={runAll} disabled={proc}
                className="w-full py-2.5 rounded-xl bg-[color:var(--primary-cyan)] text-[#0B1020] text-sm font-semibold hover:opacity-90 disabled:opacity-50 active:scale-[.98] transition-all flex items-center justify-center gap-2">
                {proc
                  ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Convertendo...</>
                  : `Converter tudo para ${EXT[settings.outFormat].toUpperCase()}`}
              </button>
              {done.length > 0 && (
                <button onClick={downloadAll}
                  className="w-full py-2 rounded-xl border border-[var(--glass-border)] text-[var(--text-secondary)] text-sm font-medium hover:border-[color:var(--primary-cyan)]/40 hover:text-[var(--text-primary)] transition-all flex items-center justify-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                  Baixar tudo ({done.length})
                </button>
              )}
            </div>

            {/* Session stats */}
            {stats.done > 0 && (
              <div className="mt-4 rounded-xl border border-[var(--glass-border)] bg-[var(--bg-secondary)] p-3 space-y-1.5 text-xs">
                <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-2">Estatísticas da sessão</p>
                <div className="flex justify-between"><span className="text-[var(--text-muted)]">Convertidas</span><span className="font-mono text-[var(--text-primary)]">{stats.done}</span></div>
                <div className="flex justify-between"><span className="text-[var(--text-muted)]">Processado</span><span className="font-mono text-[var(--text-primary)]">{fmt(stats.totalOrig)}</span></div>
                <div className="flex justify-between"><span className="text-[var(--text-muted)]">Resultado</span><span className="font-mono text-[color:var(--secondary-jade)]">{fmt(stats.totalConv)}</span></div>
                {stats.totalOrig > stats.totalConv && (
                  <div className="flex justify-between"><span className="text-[var(--text-muted)]">Economia</span><span className="font-mono font-semibold text-[color:var(--secondary-jade)]">{fmt(stats.totalOrig - stats.totalConv)} ({pct(stats.totalOrig, stats.totalConv)}%)</span></div>
                )}
                {stats.startedAt && stats.endedAt && (
                  <div className="flex justify-between"><span className="text-[var(--text-muted)]">Tempo</span><span className="font-mono text-[var(--text-primary)]">{((stats.endedAt - stats.startedAt) / 1000).toFixed(1)}s</span></div>
                )}
              </div>
            )}
          </div>

          {/* ── Central: comparação ── */}
          <div>
            {activeItem ? (
              <div className="space-y-4">
                {activeItem.convertedUrl ? (
                  <>
                    <ComparisonSlider before={activeItem.originalUrl} after={activeItem.convertedUrl} alt={activeItem.name} />
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: "Original", value: fmt(activeItem.originalSize), color: "text-[var(--text-secondary)]" },
                        { label: "Convertida", value: fmt(activeItem.convertedSize ?? 0), color: "text-[color:var(--primary-cyan)]" },
                        { label: "Economia", value: activeItem.convertedSize ? `-${pct(activeItem.originalSize, activeItem.convertedSize)}%` : "—", color: "text-[color:var(--secondary-jade)]" },
                      ].map((c) => (
                        <div key={c.label} className="rounded-xl border border-[var(--glass-border)] bg-[var(--bg-secondary)] p-3 text-center">
                          <p className="text-[10px] text-[var(--text-muted)] mb-1">{c.label}</p>
                          <p className={`text-base font-mono font-bold ${c.color}`}>{c.value}</p>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-xl border border-[var(--glass-border)] bg-[var(--bg-secondary)] p-4">
                      <div className="grid grid-cols-2 gap-y-1.5 text-xs">
                        {[
                          ["Formato original", activeItem.origFormat.replace("image/","")],
                          ["Formato convertido", EXT[settings.outFormat].toUpperCase()],
                          ["Dimensões originais", activeItem.origW ? `${activeItem.origW}×${activeItem.origH}` : "—"],
                          ["Dimensões finais", activeItem.convW ? `${activeItem.convW}×${activeItem.convH}` : "—"],
                        ].map(([k, v]) => (
                          <><span key={k+"k"} className="text-[var(--text-muted)]">{k}</span><span key={k+"v"} className="font-mono text-[var(--text-primary)]">{v}</span></>
                        ))}
                      </div>
                      <div className="mt-3 pt-3 border-t border-[var(--glass-border)] flex justify-end">
                        <button onClick={() => downloadOne(activeItem)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[color:var(--primary-cyan)] text-[#0B1020] text-xs font-bold hover:opacity-90 active:scale-95 transition-all">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                          Baixar {EXT[settings.outFormat].toUpperCase()}
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="relative rounded-xl overflow-hidden border border-[var(--glass-border)]">
                    <img src={activeItem.originalUrl} alt="Original" className="w-full block" />
                    {activeItem.status !== "processing" && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                        <button onClick={() => runOne(activeItem.id)}
                          className="px-6 py-3 rounded-xl bg-[color:var(--primary-cyan)] text-[#0B1020] font-semibold text-sm hover:opacity-90 shadow-lg">
                          Converter para {EXT[settings.outFormat].toUpperCase()}
                        </button>
                      </div>
                    )}
                    {activeItem.status === "processing" && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm gap-3">
                        <svg className="w-10 h-10 text-[color:var(--primary-cyan)] animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                        </svg>
                        <p className="text-sm text-white">Convertendo...</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center rounded-xl border border-dashed border-[var(--glass-border)] text-[var(--text-muted)] text-sm">
                Selecione uma imagem
              </div>
            )}
          </div>

          {/* ── Settings ── */}
          <div className="rounded-xl border border-[var(--glass-border)] bg-[var(--bg-secondary)] p-4 h-fit">
            <p className="text-[11px] uppercase tracking-widest text-[var(--text-muted)] mb-4">Configurações</p>
            <SettingsPanel s={settings} set={setSettings} />
          </div>
        </div>
      )}

      <p className="mt-6 text-center text-xs text-[var(--text-muted)]">
        🔒 Todo processamento ocorre localmente no seu navegador. Nenhuma imagem é enviada para servidores.
      </p>
    </div>
  );
}
