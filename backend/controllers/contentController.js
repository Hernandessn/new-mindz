import Content from "../models/Content.js";
import Groq from "groq-sdk";
import { PDFParse } from "pdf-parse";
import dotenv from "dotenv";

dotenv.config();

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

const content = async (req, res) => {
    try {
        const title = req.body?.title || "Sem título";
        const userId = req.user.id;

        if (!req.file) {
            return res.status(400).json({
                msg: "No PDF uploaded",
            });
        }

        const parser = new PDFParse({
            data: req.file.buffer,
        });

        const pdfResult = await parser.getText();
        const extractedText = pdfResult.text;

        if (!extractedText?.trim()) {
            return res.status(400).json({
                msg: "Não foi possível extrair texto do PDF",
            });
        }

        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            temperature: 0.2,
            messages: [
                {
                    role: "system",
                    content: `
    Você é um sistema de extração de conhecimento educacional.

    Dado o texto enviado, extraia os conceitos principais e as conexões entre eles.

    Retorne APENAS um JSON válido no formato:

    {
    "neurons": [
        {
        "concept": "nome do conceito",
        "connections": [
            "conceito relacionado 1",
            "conceito relacionado 2"
        ]
        }
    ]
    }

    Regras:
    - Extraia entre 5 e 40 conceitos
    - Conceitos devem ser termos específicos
    - Não use frases longas
    - O campo connections deve conter apenas conceitos existentes na resposta
    - Ignore exemplos e informações secundárias
    - Não adicione texto antes ou depois do JSON
    `,
                },
                {
                    role: "user",
                    content: extractedText.slice(0, 50000),
                },
            ],
        });

  const responseText =
    completion.choices?.[0]?.message?.content || "";

  const jsonMatch = responseText.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    throw new Error("Nenhum JSON encontrado na resposta da IA");
  }

  const parsed = JSON.parse(jsonMatch[0]);

  // Validação da estrutura
  if (!parsed.neurons || !Array.isArray(parsed.neurons)) {
    throw new Error("Resposta inválida da IA");
  }

  // Lista de conceitos existentes
  const concepts = new Set(
    parsed.neurons.map((neuron) => neuron.concept)
  );

  // Remove conexões inválidas, duplicadas e auto-conexões
  for (const neuron of parsed.neurons) {
    neuron.connections = [
      ...new Set(
        neuron.connections.filter(
          (connection) =>
            concepts.has(connection) &&
            connection !== neuron.concept
        )
      ),
    ];
  }

  console.log(
    `JSON recebido com ${parsed.neurons.length} neurônios`
  );

  return res.status(200).json(parsed);
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            msg: "Internal error",
            error: error.message,
        });
    }
};

export default content;
