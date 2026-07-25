import { createFileRoute } from "@tanstack/react-router";
import { useState, useCallback, useRef, useEffect } from "react";

export const Route = createFileRoute("/ferramentas/conversor-imagens")({
  head: () => ({
    meta: [
      { title: "Conversor de Imagens — DIGITALTECH" },
      { name: "description", content: "Converta, corte, redimensione e otimize imagens entre JPG, PNG, WebP, AVIF e ICO. 100% no navegador, sem uploads." },
    ],
  }),
  component: ConversorPage,
});

// ─── Types ────────────────────────────────────────────────────────────────────

type OutFormat  = "jpeg" | "png" | "webp" | "avif" | "ico";
type ItemStatus = "idle" | "processing" | "done" | "error" | "canceled";
type CropAspect = "free" | "1:1" | "16:9" | "9:16" | "4:5";
type WatermarkPos = "tl" | "tr" | "bl" | "br" | "center";

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
  rotate: 0 | 90 | 180 | 270;
  flipH: boolean;
  flipV: boolean;
  crop: { enabled: boolean; aspect: CropAspect };
  targetSize: { enabled: boolean; kb: string };
  adjust: { brightness: number; contrast: number; saturation: number };
  watermark: { enabled: boolean; text: string; position: WatermarkPos; opacity: number; fontSize: number; color: string };
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

const MIME: Partial<Record<OutFormat, string>> = {
  jpeg: "image/jpeg", png: "image/png", webp: "image/webp", avif: "image/avif",
};
const EXT: Record<OutFormat, string> = { jpeg: "jpg", png: "png", webp: "webp", avif: "avif", ico: "ico" };
const ACCEPTS = ".jpg,.jpeg,.png,.webp,.avif,.gif,.bmp,.tiff,.tif,.svg,.heic,.heif";

const COMPAT: Record<OutFormat, { bg: boolean; quality: boolean; note?: string }> = {
  "jpeg": { bg: true,  quality: true  },
  "png":  { bg: false, quality: false, note: "Lossless — qualidade não afeta PNG" },
  "webp": { bg: false, quality: true  },
  "avif": { bg: false, quality: true, note: "Suporte varia por navegador" },
  "ico":  { bg: false, quality: false, note: "Gera favicon com 16, 32, 48 e 64px (corte quadrado automático)" },
};

const SETTINGS_KEY = "digitaltech:conversor-imagens:settings";

const DEFAULT_SETTINGS: Settings = {
  outFormat: "webp", quality: 82, bgColor: "#ffffff",
  keepTransparency: true, removeExif: true, autoOrient: true,
  resize: { enabled: false, mode: "pixels", w: "", h: "", pct: "100", lock: true },
  rotate: 0, flipH: false, flipV: false,
  crop: { enabled: false, aspect: "1:1" },
  targetSize: { enabled: false, kb: "200" },
  adjust: { brightness: 100, contrast: 100, saturation: 100 },
  watermark: { enabled: false, text: "", position: "br", opacity: 70, fontSize: 28, color: "#ffffff" },
};

function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    // Merge com defaults para tolerar versões antigas salvas no navegador do usuário
    return {
      ...DEFAULT_SETTINGS, ...parsed,
      resize: { ...DEFAULT_SETTINGS.resize, ...parsed.resize },
      crop: { ...DEFAULT_SETTINGS.crop, ...parsed.crop },
      targetSize: { ...DEFAULT_SETTINGS.targetSize, ...parsed.targetSize },
      adjust: { ...DEFAULT_SETTINGS.adjust, ...parsed.adjust },
      watermark: { ...DEFAULT_SETTINGS.watermark, ...parsed.watermark },
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

// ─── Presets ──────────────────────────────────────────────────────────────────

type PresetId = "web" | "whatsapp" | "instagram" | "facebook" | "youtube" | "wallpaper" | "print" | "highQuality";

const PRESETS: { id: PresetId; label: string; apply: (s: Settings) => Settings }[] = [
  { id: "web", label: "Web", apply: (s) => ({ ...s, outFormat: "webp", quality: 80, crop: { ...s.crop, enabled: false } }) },
  { id: "whatsapp", label: "WhatsApp", apply: (s) => ({ ...s, outFormat: "jpeg", quality: 78, crop: { ...s.crop, enabled: false }, resize: { ...s.resize, enabled: true, mode: "pixels", w: "1600", h: "", lock: true } }) },
  { id: "instagram", label: "Instagram", apply: (s) => ({ ...s, outFormat: "jpeg", quality: 85, crop: { enabled: true, aspect: "1:1" }, resize: { ...s.resize, enabled: true, mode: "pixels", w: "1080", h: "1080", lock: false } }) },
  { id: "facebook", label: "Facebook", apply: (s) => ({ ...s, outFormat: "jpeg", quality: 85, crop: { ...s.crop, enabled: false }, resize: { ...s.resize, enabled: true, mode: "pixels", w: "1200", h: "", lock: true } }) },
  { id: "youtube", label: "Miniatura YouTube", apply: (s) => ({ ...s, outFormat: "jpeg", quality: 90, crop: { enabled: true, aspect: "16:9" }, resize: { ...s.resize, enabled: true, mode: "pixels", w: "1280", h: "720", lock: false } }) },
  { id: "wallpaper", label: "Wallpaper", apply: (s) => ({ ...s, outFormat: "png", crop: { ...s.crop, enabled: false }, resize: { ...s.resize, enabled: false } }) },
  { id: "print", label: "Impressão", apply: (s) => ({ ...s, outFormat: "png", crop: { ...s.crop, enabled: false }, resize: { ...s.resize, enabled: false } }) },
  { id: "highQuality", label: "Alta Qualidade", apply: (s) => ({ ...s, quality: 96 }) },
];

// ─── Binary utilities: ZIP e ICO gerados sem dependências externas ────────────
// As imagens já saem comprimidas (JPEG/PNG/WebP), então o ZIP usa o método
// STORE (sem recompressão) — suficiente e evita adicionar uma lib de deflate.

function crc32(buf: Uint8Array): number {
  let c: number, crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    c = (crc ^ buf[i]) & 0xFF;
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    crc = (crc >>> 8) ^ c;
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

async function createZip(files: { name: string; blob: Blob }[]): Promise<Blob> {
  const encoder = new TextEncoder();
  const localParts: (Uint8Array)[] = [];
  const centralParts: Uint8Array[] = [];
  let offset = 0;

  const d = new Date();
  const dosTime = ((d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1)) & 0xFFFF;
  const dosDate = (((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate()) & 0xFFFF;

  for (const f of files) {
    const nameBytes = encoder.encode(f.name);
    const data = new Uint8Array(await f.blob.arrayBuffer());
    const crc = crc32(data);
    const size = data.length;

    const localHeader = new Uint8Array(30 + nameBytes.length);
    const lv = new DataView(localHeader.buffer);
    lv.setUint32(0, 0x04034b50, true);
    lv.setUint16(4, 20, true);
    lv.setUint16(6, 0, true);
    lv.setUint16(8, 0, true); // 0 = sem compressão (store)
    lv.setUint16(10, dosTime, true);
    lv.setUint16(12, dosDate, true);
    lv.setUint32(14, crc, true);
    lv.setUint32(18, size, true);
    lv.setUint32(22, size, true);
    lv.setUint16(26, nameBytes.length, true);
    lv.setUint16(28, 0, true);
    localHeader.set(nameBytes, 30);
    localParts.push(localHeader, data);

    const centralHeader = new Uint8Array(46 + nameBytes.length);
    const cv = new DataView(centralHeader.buffer);
    cv.setUint32(0, 0x02014b50, true);
    cv.setUint16(4, 20, true);
    cv.setUint16(6, 20, true);
    cv.setUint16(8, 0, true);
    cv.setUint16(10, 0, true);
    cv.setUint16(12, dosTime, true);
    cv.setUint16(14, dosDate, true);
    cv.setUint32(16, crc, true);
    cv.setUint32(20, size, true);
    cv.setUint32(24, size, true);
    cv.setUint16(28, nameBytes.length, true);
    cv.setUint16(30, 0, true);
    cv.setUint16(32, 0, true);
    cv.setUint16(34, 0, true);
    cv.setUint16(36, 0, true);
    cv.setUint32(38, 0, true);
    cv.setUint32(42, offset, true);
    centralHeader.set(nameBytes, 46);
    centralParts.push(centralHeader);

    offset += localHeader.length + data.length;
  }

  const centralSize = centralParts.reduce((a, p) => a + p.length, 0);
  const centralOffset = offset;

  const end = new Uint8Array(22);
  const ev = new DataView(end.buffer);
  ev.setUint32(0, 0x06054b50, true);
  ev.setUint16(4, 0, true);
  ev.setUint16(6, 0, true);
  ev.setUint16(8, files.length, true);
  ev.setUint16(10, files.length, true);
  ev.setUint32(12, centralSize, true);
  ev.setUint32(16, centralOffset, true);
  ev.setUint16(20, 0, true);

  return new Blob([...localParts, ...centralParts, end] as BlobPart[], { type: "application/zip" });
}

// ICO com imagens PNG embutidas (suportado desde o Windows Vista) — evita ter
// que reimplementar um encoder BMP para cada resolução.
async function createIco(pngs: { size: number; blob: Blob }[]): Promise<Blob> {
  const datas = await Promise.all(pngs.map((p) => p.blob.arrayBuffer()));
  const header = new Uint8Array(6);
  const hv = new DataView(header.buffer);
  hv.setUint16(0, 0, true);
  hv.setUint16(2, 1, true);
  hv.setUint16(4, pngs.length, true);

  const entries: Uint8Array[] = [];
  const dataParts: Uint8Array[] = [];
  let offset = 6 + pngs.length * 16;

  pngs.forEach((p, i) => {
    const data = new Uint8Array(datas[i]);
    const entry = new Uint8Array(16);
    const ev = new DataView(entry.buffer);
    entry[0] = p.size >= 256 ? 0 : p.size;
    entry[1] = p.size >= 256 ? 0 : p.size;
    entry[2] = 0;
    entry[3] = 0;
    ev.setUint16(4, 1, true);
    ev.setUint16(6, 32, true);
    ev.setUint32(8, data.length, true);
    ev.setUint32(12, offset, true);
    entries.push(entry);
    dataParts.push(data);
    offset += data.length;
  });

  return new Blob([header, ...entries, ...dataParts] as BlobPart[], { type: "image/x-icon" });
}

// ─── Corte por proporção (centralizado, sem necessidade de arrastar handles) ──

function computeCropRect(sw: number, sh: number, aspect: CropAspect): { sx: number; sy: number; sw: number; sh: number } {
  if (aspect === "free") return { sx: 0, sy: 0, sw, sh };
  const [aw, ah] = aspect.split(":").map(Number);
  const targetRatio = aw / ah;
  const srcRatio = sw / sh;
  let cw = sw, ch = sh;
  if (srcRatio > targetRatio) cw = sh * targetRatio;
  else ch = sw / targetRatio;
  return { sx: (sw - cw) / 2, sy: (sh - ch) / 2, sw: cw, sh: ch };
}

// ─── Conversion engine ────────────────────────────────────────────────────────

// Decodifica o arquivo já aplicando a orientação EXIF via createImageBitmap
// (API nativa do navegador) — corrige de fato o problema de `autoOrient` que
// antes só existia na interface. Fallback para <img> em navegadores antigos.
async function prepareBitmap(item: ImageItem, settings: Settings): Promise<ImageBitmap> {
  try {
    return await createImageBitmap(item.file, {
      imageOrientation: settings.autoOrient ? "from-image" : "none",
    } as ImageBitmapOptions);
  } catch {
    const imgEl = new Image();
    await new Promise<void>((res, rej) => {
      imgEl.onload = () => res();
      imgEl.onerror = rej;
      imgEl.src = item.originalUrl;
    });
    return await createImageBitmap(imgEl);
  }
}

interface RenderOpts { forceSquare?: boolean; forceSize?: number }

function renderCanvas(bitmap: ImageBitmap, settings: Settings, opts: RenderOpts = {}): { canvas: HTMLCanvasElement; tw: number; th: number } {
  const bw = bitmap.width, bh = bitmap.height;
  const aspect: CropAspect = opts.forceSquare ? "1:1" : (settings.crop.enabled ? settings.crop.aspect : "free");
  const crop = computeCropRect(bw, bh, aspect);

  let tw = crop.sw, th = crop.sh;
  if (opts.forceSize) {
    tw = th = opts.forceSize;
  } else if (settings.resize.enabled) {
    if (settings.resize.mode === "pct") {
      const p = parseFloat(settings.resize.pct) / 100 || 1;
      tw = Math.round(crop.sw * p);
      th = Math.round(crop.sh * p);
    } else {
      const rw = parseInt(settings.resize.w) || 0;
      const rh = parseInt(settings.resize.h) || 0;
      const ratio = crop.sw / crop.sh;
      if (settings.resize.lock) {
        if (rw && !rh)      { tw = rw; th = Math.round(rw / ratio); }
        else if (rh && !rw) { th = rh; tw = Math.round(rh * ratio); }
        else if (rw && rh)  { tw = rw; th = rh; }
      } else {
        if (rw) tw = rw;
        if (rh) th = rh;
      }
    }
  }
  tw = Math.max(1, Math.round(tw));
  th = Math.max(1, Math.round(th));

  const rotated = settings.rotate === 90 || settings.rotate === 270;
  const canvas = document.createElement("canvas");
  canvas.width = rotated ? th : tw;
  canvas.height = rotated ? tw : th;
  const ctx = canvas.getContext("2d")!;

  if (settings.outFormat === "jpeg" && !settings.keepTransparency) {
    ctx.fillStyle = settings.bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((settings.rotate * Math.PI) / 180);
  ctx.scale(settings.flipH ? -1 : 1, settings.flipV ? -1 : 1);
  ctx.filter = `brightness(${settings.adjust.brightness}%) contrast(${settings.adjust.contrast}%) saturate(${settings.adjust.saturation}%)`;
  ctx.drawImage(bitmap, crop.sx, crop.sy, crop.sw, crop.sh, -tw / 2, -th / 2, tw, th);
  ctx.restore();

  if (settings.watermark.enabled && settings.watermark.text.trim()) {
    ctx.save();
    ctx.filter = "none";
    ctx.globalAlpha = settings.watermark.opacity / 100;
    ctx.fillStyle = settings.watermark.color;
    ctx.font = `${settings.watermark.fontSize}px sans-serif`;
    ctx.textBaseline = "bottom";
    const m = ctx.measureText(settings.watermark.text);
    const pad = 14;
    let x = pad, y = canvas.height - pad;
    if (settings.watermark.position.includes("r")) x = canvas.width - m.width - pad;
    if (settings.watermark.position === "center") { x = (canvas.width - m.width) / 2; y = canvas.height / 2; }
    if (settings.watermark.position.includes("t")) y = settings.watermark.fontSize + pad;
    ctx.fillText(settings.watermark.text, x, y);
    ctx.restore();
  }

  return { canvas, tw: canvas.width, th: canvas.height };
}

// Busca binária de qualidade até encontrar o menor arquivo <= tamanho-alvo.
async function compressToTarget(canvas: HTMLCanvasElement, mime: string, targetBytes: number): Promise<Blob> {
  let lo = 1, hi = 100, best: Blob | null = null;
  for (let i = 0; i < 7 && lo <= hi; i++) {
    const q = Math.round((lo + hi) / 2);
    const blob = await new Promise<Blob>((res, rej) =>
      canvas.toBlob((b) => b ? res(b) : rej(new Error("Falha na conversão")), mime, q / 100)
    );
    if (blob.size <= targetBytes) { best = blob; lo = q + 1; } else { hi = q - 1; }
  }
  if (!best) {
    best = await new Promise<Blob>((res, rej) =>
      canvas.toBlob((b) => b ? res(b) : rej(new Error("Falha na conversão")), mime, 0.01)
    );
  }
  return best;
}

async function convertImage(item: ImageItem, settings: Settings): Promise<{ blob: Blob; w: number; h: number }> {
  const bitmap = await prepareBitmap(item, settings);

  try {
    if (settings.outFormat === "ico") {
      const sizes = [16, 32, 48, 64];
      const pngs = await Promise.all(sizes.map(async (size) => {
        const { canvas } = renderCanvas(bitmap, settings, { forceSquare: true, forceSize: size });
        const blob = await new Promise<Blob>((res, rej) =>
          canvas.toBlob((b) => b ? res(b) : rej(new Error("Falha ao gerar PNG")), "image/png")
        );
        return { size, blob };
      }));
      const icoBlob = await createIco(pngs);
      return { blob: icoBlob, w: 64, h: 64 };
    }

    const { canvas, tw, th } = renderCanvas(bitmap, settings);
    const mime = MIME[settings.outFormat]!;
    const isLossy = settings.outFormat === "jpeg" || settings.outFormat === "webp" || settings.outFormat === "avif";

    let blob: Blob;
    if (isLossy && settings.targetSize.enabled && parseFloat(settings.targetSize.kb) > 0) {
      blob = await compressToTarget(canvas, mime, parseFloat(settings.targetSize.kb) * 1024);
    } else {
      const quality = settings.outFormat === "png" ? undefined : settings.quality / 100;
      blob = await new Promise<Blob>((res, rej) =>
        canvas.toBlob((b) => b ? res(b) : rej(new Error("Falha na conversão")), mime, quality)
      );
    }

    return { blob, w: tw, h: th };
  } finally {
    bitmap.close();
  }
}

// ─── Components ───────────────────────────────────────────────────────────────

function DropZone({ onFiles }: { onFiles: (f: File[]) => void }) {
  const [drag, setDrag] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  const handle = (files: FileList | null) => {
    if (!files) return;
    onFiles(Array.from(files).filter((f) => f.type.startsWith("image/") || /\.(svg|heic|heif)$/i.test(f.name)));
  };
  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => { e.preventDefault(); setDrag(false); handle(e.dataTransfer.files); }}
      onClick={() => ref.current?.click()}
      role="button"
      tabIndex={0}
      aria-label="Arraste imagens aqui ou clique para selecionar arquivos"
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") ref.current?.click(); }}
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
        <p className="text-sm text-[var(--text-muted)] mt-1">JPG, PNG, WebP, AVIF, GIF, BMP, TIFF, SVG, HEIC · Múltiplos arquivos</p>
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
    { id: "ico",  label: "ICO",  sub: "Favicon" },
  ];
  return (
    <div className="rounded-xl border border-[var(--glass-border)] bg-[var(--bg-secondary)] p-4 mb-4">
      <p className="text-[11px] uppercase tracking-widest text-[var(--text-muted)] mb-3">Converter para</p>
      <div className="grid grid-cols-5 gap-2">
        {opts.map((o) => (
          <button key={o.id} onClick={() => onChange(o.id)}
            aria-pressed={value === o.id}
            className={`flex flex-col items-center py-3 rounded-xl text-xs font-bold uppercase tracking-wide transition-all border focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color:var(--primary-cyan)] ${
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

function PresetBar({ onApply }: { onApply: (id: PresetId) => void }) {
  return (
    <div className="rounded-xl border border-[var(--glass-border)] bg-[var(--bg-secondary)] p-4 mb-4">
      <p className="text-[11px] uppercase tracking-widest text-[var(--text-muted)] mb-3">Presets rápidos</p>
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button key={p.id} onClick={() => onApply(p.id)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--glass-border)] text-[var(--text-secondary)] hover:border-[color:var(--primary-cyan)]/40 hover:text-[color:var(--primary-cyan)] transition-all">
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function SettingsPanel({ s, set }: { s: Settings; set: (v: Settings) => void }) {
  const upd  = (p: Partial<Settings>) => set({ ...s, ...p });
  const updR = (p: Partial<Settings["resize"]>) => upd({ resize: { ...s.resize, ...p } });
  const updC = (p: Partial<Settings["crop"]>) => upd({ crop: { ...s.crop, ...p } });
  const updT = (p: Partial<Settings["targetSize"]>) => upd({ targetSize: { ...s.targetSize, ...p } });
  const updA = (p: Partial<Settings["adjust"]>) => upd({ adjust: { ...s.adjust, ...p } });
  const updW = (p: Partial<Settings["watermark"]>) => upd({ watermark: { ...s.watermark, ...p } });
  const compat = COMPAT[s.outFormat];
  const isIco = s.outFormat === "ico";

  return (
    <div className="space-y-5">
      {compat.quality && !s.targetSize.enabled && (
        <div>
          <div className="flex justify-between mb-1.5">
            <p className="text-[11px] uppercase tracking-widest text-[var(--text-muted)]">Qualidade</p>
            <span className="text-sm font-mono font-semibold text-[color:var(--primary-cyan)]">{s.quality}%</span>
          </div>
          <input type="range" min="1" max="100" value={s.quality} aria-label="Qualidade da conversão"
            onChange={(e) => upd({ quality: +e.target.value })} className="w-full accent-[#00D4FF]" />
          <div className="flex justify-between text-[9px] text-[var(--text-muted)] mt-0.5">
            <span>Menor arquivo</span><span>Melhor qualidade</span>
          </div>
        </div>
      )}

      {/* Compressão por tamanho-alvo */}
      {(s.outFormat === "jpeg" || s.outFormat === "webp" || s.outFormat === "avif") && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] uppercase tracking-widest text-[var(--text-muted)]">Tamanho-alvo</p>
            <button onClick={() => updT({ enabled: !s.targetSize.enabled })}
              aria-pressed={s.targetSize.enabled}
              className={`w-8 h-4 rounded-full transition-all relative ${s.targetSize.enabled ? "bg-[color:var(--primary-cyan)]" : "bg-[var(--glass-border)]"}`}>
              <span className="absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all" style={{ left: s.targetSize.enabled ? "18px" : "2px" }} />
            </button>
          </div>
          {s.targetSize.enabled && (
            <div className="flex items-center gap-2">
              <input type="number" min="1" value={s.targetSize.kb} onChange={(e) => updT({ kb: e.target.value })}
                className="w-24 rounded-lg border border-[var(--glass-border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] text-sm px-2.5 py-1.5 focus:outline-none" />
              <span className="text-sm text-[var(--text-muted)]">KB máximo (ajusta a qualidade automaticamente)</span>
            </div>
          )}
        </div>
      )}

      {/* Transparency / BG color */}
      {!isIco && (
        <div>
          <p className="text-[11px] uppercase tracking-widest text-[var(--text-muted)] mb-2">Transparência</p>
          {s.outFormat === "jpeg" ? (
            <div className="space-y-2">
              <p className="text-xs text-[var(--text-secondary)]">JPG não suporta transparência. Escolha a cor de fundo:</p>
              <div className="flex items-center gap-3">
                <input type="color" value={s.bgColor} onChange={(e) => upd({ bgColor: e.target.value })}
                  aria-label="Cor de fundo"
                  className="w-10 h-8 rounded cursor-pointer border border-[var(--glass-border)]" />
                <div className="flex gap-2">
                  {["#ffffff","#000000","#f5f5f5","#1a1a2e"].map((c) => (
                    <button key={c} onClick={() => upd({ bgColor: c })} aria-label={`Cor de fundo ${c}`}
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
      )}

      {/* Corte */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-[11px] uppercase tracking-widest text-[var(--text-muted)]">Corte {isIco && "(favicon é sempre quadrado)"}</p>
          {!isIco && (
            <button onClick={() => updC({ enabled: !s.crop.enabled })} aria-pressed={s.crop.enabled}
              className={`w-8 h-4 rounded-full transition-all relative ${s.crop.enabled ? "bg-[color:var(--primary-cyan)]" : "bg-[var(--glass-border)]"}`}>
              <span className="absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all" style={{ left: s.crop.enabled ? "18px" : "2px" }} />
            </button>
          )}
        </div>
        {(s.crop.enabled && !isIco) && (
          <div className="grid grid-cols-4 gap-1.5">
            {(["1:1","16:9","9:16","4:5"] as CropAspect[]).map((a) => (
              <button key={a} onClick={() => updC({ aspect: a })}
                className={`py-1.5 rounded-lg text-xs font-medium transition-all border ${
                  s.crop.aspect === a
                    ? "bg-[color:var(--primary-cyan)]/10 border-[color:var(--primary-cyan)]/40 text-[color:var(--primary-cyan)]"
                    : "border-[var(--glass-border)] text-[var(--text-muted)]"
                }`}>
                {a}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Rotação / Espelhamento */}
      <div>
        <p className="text-[11px] uppercase tracking-widest text-[var(--text-muted)] mb-2">Rotação e espelhamento</p>
        <div className="flex gap-1.5 mb-2">
          {[0, 90, 180, 270].map((r) => (
            <button key={r} onClick={() => upd({ rotate: r as Settings["rotate"] })} aria-pressed={s.rotate === r}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                s.rotate === r
                  ? "bg-[color:var(--primary-cyan)]/10 border-[color:var(--primary-cyan)]/40 text-[color:var(--primary-cyan)]"
                  : "border-[var(--glass-border)] text-[var(--text-muted)]"
              }`}>
              {r}°
            </button>
          ))}
        </div>
        <div className="flex gap-1.5">
          <button onClick={() => upd({ flipH: !s.flipH })} aria-pressed={s.flipH}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all border ${s.flipH ? "bg-[color:var(--primary-cyan)]/10 border-[color:var(--primary-cyan)]/40 text-[color:var(--primary-cyan)]" : "border-[var(--glass-border)] text-[var(--text-muted)]"}`}>
            Espelhar ↔
          </button>
          <button onClick={() => upd({ flipV: !s.flipV })} aria-pressed={s.flipV}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all border ${s.flipV ? "bg-[color:var(--primary-cyan)]/10 border-[color:var(--primary-cyan)]/40 text-[color:var(--primary-cyan)]" : "border-[var(--glass-border)] text-[var(--text-muted)]"}`}>
            Espelhar ↕
          </button>
        </div>
      </div>

      {/* Ajustes */}
      <div>
        <p className="text-[11px] uppercase tracking-widest text-[var(--text-muted)] mb-2">Ajustes</p>
        <div className="space-y-2.5">
          {([
            ["brightness", "Brilho"],
            ["contrast", "Contraste"],
            ["saturation", "Saturação"],
          ] as const).map(([k, label]) => (
            <div key={k}>
              <div className="flex justify-between mb-0.5">
                <span className="text-xs text-[var(--text-secondary)]">{label}</span>
                <span className="text-xs font-mono text-[var(--text-muted)]">{s.adjust[k]}%</span>
              </div>
              <input type="range" min="50" max="150" value={s.adjust[k]}
                onChange={(e) => updA({ [k]: +e.target.value })} className="w-full accent-[#00D4FF]" />
            </div>
          ))}
        </div>
      </div>

      {/* Resize */}
      {!isIco && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] uppercase tracking-widest text-[var(--text-muted)]">Redimensionar</p>
            <button onClick={() => updR({ enabled: !s.resize.enabled })} aria-pressed={s.resize.enabled}
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
      )}

      {/* Marca d'água */}
      {!isIco && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] uppercase tracking-widest text-[var(--text-muted)]">Marca d'água</p>
            <button onClick={() => updW({ enabled: !s.watermark.enabled })} aria-pressed={s.watermark.enabled}
              className={`w-8 h-4 rounded-full transition-all relative ${s.watermark.enabled ? "bg-[color:var(--primary-cyan)]" : "bg-[var(--glass-border)]"}`}>
              <span className="absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all" style={{ left: s.watermark.enabled ? "18px" : "2px" }} />
            </button>
          </div>
          {s.watermark.enabled && (
            <div className="space-y-2">
              <input type="text" placeholder="Texto da marca d'água" value={s.watermark.text}
                onChange={(e) => updW({ text: e.target.value })}
                className="w-full rounded-lg border border-[var(--glass-border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] text-sm px-2.5 py-1.5 focus:outline-none" />
              <div className="grid grid-cols-5 gap-1">
                {([["tl","↖"],["tr","↗"],["center","•"],["bl","↙"],["br","↘"]] as const).map(([p, icon]) => (
                  <button key={p} onClick={() => updW({ position: p as WatermarkPos })} aria-label={`Posição ${p}`}
                    className={`py-1.5 rounded-lg text-sm border ${s.watermark.position === p ? "border-[color:var(--primary-cyan)]/50 text-[color:var(--primary-cyan)]" : "border-[var(--glass-border)] text-[var(--text-muted)]"}`}>
                    {icon}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input type="color" value={s.watermark.color} onChange={(e) => updW({ color: e.target.value })}
                  className="w-9 h-8 rounded cursor-pointer border border-[var(--glass-border)]" />
                <input type="range" min="10" max="100" value={s.watermark.opacity}
                  onChange={(e) => updW({ opacity: +e.target.value })} className="flex-1 accent-[#00D4FF]" />
                <span className="text-[10px] text-[var(--text-muted)] w-8 text-right">{s.watermark.opacity}%</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Optimization */}
      <div>
        <p className="text-[11px] uppercase tracking-widest text-[var(--text-muted)] mb-2">Otimização</p>
        <label className="flex items-center gap-2.5 cursor-pointer text-sm text-[var(--text-secondary)] mb-2">
          <input type="checkbox" checked disabled className="accent-[#00D4FF] opacity-60" />
          Metadados EXIF removidos automaticamente
        </label>
        <label className="flex items-center gap-2.5 cursor-pointer text-sm text-[var(--text-secondary)] mb-2">
          <input type="checkbox" checked={s.autoOrient} onChange={(e) => upd({ autoOrient: e.target.checked })} className="accent-[#00D4FF]" />
          Corrigir orientação automática
        </label>
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
      <img src={after}  alt={`${alt} convertida`} className="w-full block"  draggable={false} />
      <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ width: `${pos}%` }}>
        <img src={before} alt={`${alt} original`} className="block" draggable={false}
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
  const [images, setImages]     = useState<ImageItem[]>([]);
  const [active, setActive]     = useState<string | null>(null);
  const [proc, setProc]         = useState(false);
  const [dragId, setDragId]     = useState<string | null>(null);
  const [stats, setStats]       = useState<Stats>({ total: 0, done: 0, totalOrig: 0, totalConv: 0, startedAt: null, endedAt: null });
  const [settings, setSettingsState] = useState<Settings>(DEFAULT_SETTINGS);
  const cancelRef  = useRef(false);
  const topFileRef = useRef<HTMLInputElement>(null);

  // Carrega configurações salvas (apenas no cliente)
  useEffect(() => { setSettingsState(loadSettings()); }, []);

  const setSettings = useCallback((updater: Settings | ((s: Settings) => Settings)) => {
    setSettingsState((prev) => {
      const next = typeof updater === "function" ? (updater as (s: Settings) => Settings)(prev) : updater;
      try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(next)); } catch { /* armazenamento indisponível — segue sem persistir */ }
      return next;
    });
  }, []);

  const activeItem = images.find((i) => i.id === active) ?? images[0] ?? null;
  const done = images.filter((i) => i.status === "done");

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
    cancelRef.current = false;
    setProc(true);
    const t0 = Date.now();
    setStats({ total: images.length, done: 0, totalOrig: images.reduce((a, i) => a + i.originalSize, 0), totalConv: 0, startedAt: t0, endedAt: null });
    for (const item of images) {
      if (cancelRef.current) break;
      await runOne(item.id);
    }
    setStats((s) => ({ ...s, endedAt: Date.now() }));
    setProc(false);
  }, [images, runOne]);

  const cancelAll = () => { cancelRef.current = true; };

  const downloadOne = (item: ImageItem) => {
    if (!item.convertedUrl) return;
    const base = item.name.replace(/\.[^.]+$/, "");
    const a = document.createElement("a");
    a.href = item.convertedUrl;
    a.download = `${base}.${EXT[settings.outFormat]}`;
    a.click();
  };

  const downloadZip = async () => {
    const items = images.filter((i) => i.status === "done" && i.convertedUrl);
    if (!items.length) return;
    const used = new Set<string>();
    const files = await Promise.all(items.map(async (item) => {
      const res = await fetch(item.convertedUrl!);
      const blob = await res.blob();
      const base = item.name.replace(/\.[^.]+$/, "");
      let name = `${base}.${EXT[settings.outFormat]}`;
      let n = 1;
      while (used.has(name)) name = `${base}-${++n}.${EXT[settings.outFormat]}`;
      used.add(name);
      return { name, blob };
    }));
    const zip = await createZip(files);
    const url = URL.createObjectURL(zip);
    const a = document.createElement("a");
    a.href = url;
    a.download = `imagens-convertidas.zip`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  };

  const remove = useCallback((id: string) =>
    setImages((p) => { const n = p.filter((i) => i.id !== id); if (active === id) setActive(n[0]?.id ?? null); return n; })
  , [active]);

  const moveItem = (id: string, dir: -1 | 1) => {
    setImages((p) => {
      const idx = p.findIndex((i) => i.id === id);
      const swap = idx + dir;
      if (idx === -1 || swap < 0 || swap >= p.length) return p;
      const arr = [...p];
      [arr[idx], arr[swap]] = [arr[swap], arr[idx]];
      return arr;
    });
  };

  const handleDropReorder = (overId: string) => {
    if (!dragId || dragId === overId) { setDragId(null); return; }
    setImages((prev) => {
      const arr = [...prev];
      const from = arr.findIndex((i) => i.id === dragId);
      const to = arr.findIndex((i) => i.id === overId);
      if (from === -1 || to === -1) return prev;
      const [moved] = arr.splice(from, 1);
      arr.splice(to, 0, moved);
      return arr;
    });
    setDragId(null);
  };

  const applyPreset = (id: PresetId) => {
    const preset = PRESETS.find((p) => p.id === id);
    if (preset) setSettings((s) => preset.apply(s));
  };

  // Atalhos de teclado: Ctrl/Cmd+O adicionar, Ctrl/Cmd+Enter converter,
  // Ctrl/Cmd+D baixar tudo, Delete remove a imagem selecionada.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      const target = e.target as HTMLElement;
      const typing = target?.tagName === "INPUT" || target?.tagName === "TEXTAREA";
      if (mod && e.key.toLowerCase() === "o") { e.preventDefault(); topFileRef.current?.click(); }
      else if (mod && e.key === "Enter") { e.preventDefault(); if (!proc && images.length) runAll(); }
      else if (mod && e.key.toLowerCase() === "d") { e.preventDefault(); if (done.length) downloadZip(); }
      else if (e.key === "Delete" && active && !typing) { remove(active); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proc, images.length, active, done.length]);

  return (
    <div className="mx-auto max-w-7xl px-4 pt-[var(--header-clearance)] pb-20 md:px-6">
      {/* Page header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--text-secondary)]">Ferramentas</p>
          <h1 className="mt-1 font-display text-2xl font-bold text-[var(--text-primary)] md:text-3xl">
            Conversor de Imagens
          </h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            JPG, PNG, WebP, AVIF, ICO e mais · 100% no navegador · sem uploads · sem servidores
          </p>
        </div>
        <input ref={topFileRef} type="file" multiple accept={ACCEPTS} className="hidden"
          onChange={(e) => addFiles(Array.from(e.target.files ?? []))} />
      </div>

      {/* Format selector + presets sempre visíveis quando há imagens */}
      {images.length > 0 && (
        <>
          <FormatBar value={settings.outFormat} onChange={(f) => setSettings((s) => ({ ...s, outFormat: f }))} />
          <PresetBar onApply={applyPreset} />
        </>
      )}

      {images.length === 0 ? (
        <>
          <DropZone onFiles={addFiles} />
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { from: "JPG/JPEG", to: "WebP", desc: "30–40% menor" },
              { from: "PNG",      to: "WebP", desc: "Mantém transparência" },
              { from: "PNG",      to: "JPG",  desc: "Substitui fundo branco" },
              { from: "PNG",      to: "ICO",  desc: "Gera favicon" },
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
                  draggable
                  onDragStart={() => setDragId(item.id)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => { e.stopPropagation(); handleDropReorder(item.id); }}
                  className={`group flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${
                    active === item.id
                      ? "border-[color:var(--primary-cyan)]/50 bg-[color:var(--primary-cyan)]/5"
                      : "border-[var(--glass-border)] bg-[var(--bg-secondary)] hover:border-[color:var(--primary-cyan)]/25"
                  }`}>
                  <span className="text-[var(--text-muted)] cursor-grab select-none opacity-0 group-hover:opacity-60 transition-opacity" title="Arraste para reordenar">⋮⋮</span>
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
                  <div className="flex items-center gap-1 shrink-0">
                    <div className="hidden group-hover:flex flex-col">
                      <button onClick={(e) => { e.stopPropagation(); moveItem(item.id, -1); }} aria-label="Mover para cima"
                        className="text-[var(--text-muted)] hover:text-[var(--text-primary)] leading-none text-[10px]">▲</button>
                      <button onClick={(e) => { e.stopPropagation(); moveItem(item.id, 1); }} aria-label="Mover para baixo"
                        className="text-[var(--text-muted)] hover:text-[var(--text-primary)] leading-none text-[10px]">▼</button>
                    </div>
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
                        <button onClick={(e) => { e.stopPropagation(); downloadOne(item); }} aria-label="Baixar imagem"
                          className="text-[color:var(--primary-cyan)] hover:opacity-70 transition-opacity">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                        </button>
                      </div>
                    )}
                    {item.status === "error" && <span className="text-[10px] text-red-400" title={item.error}>Erro</span>}
                    <button onClick={(e) => { e.stopPropagation(); remove(item.id); }} aria-label="Remover imagem"
                      className="opacity-0 group-hover:opacity-100 text-[var(--text-muted)] hover:text-red-400 transition-all">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Batch progress */}
            {proc && (
              <div className="mb-2">
                <div className="h-1.5 rounded-full bg-[var(--glass-border)] overflow-hidden">
                  <div className="h-full bg-[color:var(--primary-cyan)] transition-all"
                    style={{ width: `${stats.total ? (stats.done / stats.total) * 100 : 0}%` }} />
                </div>
                <p className="text-[10px] text-[var(--text-muted)] mt-1">{stats.done} / {stats.total} convertidas</p>
              </div>
            )}

            {/* Batch buttons */}
            <div className="space-y-2">
              <button onClick={runAll} disabled={proc}
                className="w-full py-2.5 rounded-xl bg-[color:var(--primary-cyan)] text-[#0B1020] text-sm font-semibold hover:opacity-90 disabled:opacity-50 active:scale-[.98] transition-all flex items-center justify-center gap-2">
                {proc
                  ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Convertendo...</>
                  : `Converter tudo para ${EXT[settings.outFormat].toUpperCase()}`}
              </button>
              {proc && (
                <button onClick={cancelAll}
                  className="w-full py-2 rounded-xl border border-red-400/40 text-red-400 text-sm font-medium hover:bg-red-400/10 transition-all">
                  Cancelar
                </button>
              )}
              {done.length > 0 && !proc && (
                <button onClick={downloadZip}
                  className="w-full py-2 rounded-xl border border-[var(--glass-border)] text-[var(--text-secondary)] text-sm font-medium hover:border-[color:var(--primary-cyan)]/40 hover:text-[var(--text-primary)] transition-all flex items-center justify-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                  Baixar tudo em ZIP ({done.length})
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

            <p className="mt-3 text-[10px] text-[var(--text-muted)] leading-relaxed">
              Atalhos: <kbd className="px-1 rounded bg-[var(--glass-border)]">Ctrl+O</kbd> adicionar ·{" "}
              <kbd className="px-1 rounded bg-[var(--glass-border)]">Ctrl+Enter</kbd> converter ·{" "}
              <kbd className="px-1 rounded bg-[var(--glass-border)]">Ctrl+D</kbd> baixar ZIP ·{" "}
              <kbd className="px-1 rounded bg-[var(--glass-border)]">Del</kbd> remover selecionada
            </p>
          </div>

          {/* ── Central: comparação ── */}
          <div>
            {activeItem ? (
              <div className="space-y-4">
                {activeItem.convertedUrl ? (
                  <>
                    {settings.outFormat === "ico" ? (
                      <div className="rounded-xl border border-[var(--glass-border)] bg-[var(--bg-secondary)] p-6 flex items-center justify-center gap-6">
                        <img src={activeItem.convertedUrl} alt="Favicon gerado" className="w-16 h-16" style={{ imageRendering: "pixelated" }} />
                        <div className="text-sm text-[var(--text-secondary)]">
                          <p className="font-semibold text-[var(--text-primary)]">Favicon .ico gerado</p>
                          <p className="text-xs text-[var(--text-muted)] mt-1">Contém as resoluções 16×16, 32×32, 48×48 e 64×64px</p>
                        </div>
                      </div>
                    ) : (
                      <ComparisonSlider before={activeItem.originalUrl} after={activeItem.convertedUrl} alt={activeItem.name} />
                    )}
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
                          <>
                            <span key={k+"k"} className="text-[var(--text-muted)]">{k}</span>
                            <span key={k+"v"} className="font-mono text-[var(--text-primary)]">{v}</span>
                          </>
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
          <div className="rounded-xl border border-[var(--glass-border)] bg-[var(--bg-secondary)] p-4 h-fit max-h-[85vh] overflow-y-auto">
            <p className="text-[11px] uppercase tracking-widest text-[var(--text-muted)] mb-4">Configurações</p>
            <SettingsPanel s={settings} set={setSettings} />
          </div>
        </div>
      )}

      <p className="mt-6 text-center text-xs text-[var(--text-muted)]">
        🔒 Todo processamento ocorre localmente no seu navegador. Nenhuma imagem é enviada para servidores.
      </p>

      {/* Limitações conhecidas — transparência sobre o que ainda não está implementado */}
      <details className="mt-4 text-xs text-[var(--text-muted)]">
        <summary className="cursor-pointer hover:text-[var(--text-secondary)]">Limitações conhecidas desta versão</summary>
        <ul className="mt-2 space-y-1 list-disc list-inside">
          <li>HEIC/HEIF: a decodificação depende do suporte nativo do navegador (bom no Safari, limitado no Chrome/Firefox). Para garantia total, é recomendável adicionar a biblioteca <code>heic2any</code>.</li>
          <li>GIF e WebP animados: apenas o primeiro frame é convertido; extração de todos os frames exige um parser de GIF dedicado.</li>
          <li>Remoção de fundo por IA: não incluída — exigiria um modelo de segmentação (ex.: TensorFlow.js) ou uma API externa.</li>
          <li>Processamento roda na thread principal via <code>createImageBitmap</code>/Canvas; para lotes muito grandes, migrar para Web Workers evitaria qualquer travamento de interface.</li>
          <li>Corte é sempre centralizado por proporção fixa — não há alça de arraste para corte livre manual.</li>
        </ul>
      </details>
    </div>
  );
}
