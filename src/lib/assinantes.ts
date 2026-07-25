import { createServerFn } from "@tanstack/react-start";
import { sql } from "./db";

type CadastroAssinante = {
  nome: string;
  email?: string;
  telefone?: string;
  receberEmail: boolean;
  receberWhatsapp: boolean;
  origem?: string;
};

export const cadastrarAssinante = createServerFn({ method: "POST" })
  .validator((data: CadastroAssinante) => data)
  .handler(async ({ data }) => {
    const { nome, email, telefone, receberEmail, receberWhatsapp, origem } = data;

    // Verificar se já existe
    if (email) {
      const existe = await sql`
        SELECT id FROM assinantes WHERE email = ${email} LIMIT 1
      `;
      if (existe.length > 0) {
        return { ok: false, mensagem: "Este e-mail já está cadastrado." };
      }
    }

    if (telefone) {
      const existe = await sql`
        SELECT id FROM assinantes WHERE telefone = ${telefone} LIMIT 1
      `;
      if (existe.length > 0) {
        return { ok: false, mensagem: "Este número já está cadastrado." };
      }
    }

    await sql`
      INSERT INTO assinantes (nome, email, telefone, receber_email, receber_whatsapp, origem, confirmado)
      VALUES (
        ${nome},
        ${email ?? null},
        ${telefone ?? null},
        ${receberEmail},
        ${receberWhatsapp},
        ${origem ?? "footer"},
        true
      )
    `;

    return { ok: true, mensagem: "Inscrição realizada com sucesso!" };
  });
