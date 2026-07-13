/* ==========================================================================
   Calculadora de Juros Compostos
   Fórmula: M = P * (1 + i)^n + aportes mensais compostos
   ========================================================================== */

function formatBRL(value) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function parseNumberInput(value) {
  // aceita "1.500,50" ou "1500.50" ou "1500"
  const cleaned = String(value).replace(/\./g, "").replace(",", ".");
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}

function calcularJurosCompostos({ principal, aporteMensal, taxaAnual, periodoMeses }) {
  const taxaMensal = Math.pow(1 + taxaAnual / 100, 1 / 12) - 1;

  let saldo = principal;
  let totalAportado = principal;
  const serieMensal = [];

  for (let mes = 1; mes <= periodoMeses; mes++) {
    saldo = saldo * (1 + taxaMensal) + aporteMensal;
    totalAportado += aporteMensal;
    serieMensal.push({ mes, saldo });
  }

  const totalJuros = saldo - totalAportado;

  return {
    valorFinal: saldo,
    totalAportado,
    totalJuros,
    serieMensal,
  };
}

function initCalculadoraJuros() {
  const form = document.getElementById("form-juros-compostos");
  if (!form) return;

  const resultPanel = document.getElementById("resultado-juros");
  const elValorFinal = document.getElementById("res-valor-final");
  const elTotalAportado = document.getElementById("res-total-aportado");
  const elTotalJuros = document.getElementById("res-total-juros");

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const principal = parseNumberInput(document.getElementById("input-principal").value || "0");
    const aporteMensal = parseNumberInput(document.getElementById("input-aporte").value || "0");
    const taxaAnual = parseNumberInput(document.getElementById("input-taxa").value || "0");
    const periodoMeses = parseInt(document.getElementById("input-periodo").value || "0", 10);

    if (periodoMeses <= 0 || periodoMeses > 1200) {
      alert("Informe um período válido entre 1 e 1200 meses.");
      return;
    }

    const resultado = calcularJurosCompostos({ principal, aporteMensal, taxaAnual, periodoMeses });

    elValorFinal.textContent = formatBRL(resultado.valorFinal);
    elTotalAportado.textContent = formatBRL(resultado.totalAportado);
    elTotalJuros.textContent = formatBRL(resultado.totalJuros);

    resultPanel.classList.add("is-visible");
    resultPanel.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });
}

document.addEventListener("DOMContentLoaded", initCalculadoraJuros);
