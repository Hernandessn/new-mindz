import Content from "../models/Content.js";
import Neuron from "../models/Neurons.js";
import Groq from "groq-sdk";
import { PDFParse } from "pdf-parse";
import dotenv from "dotenv";

dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// PDF -> IA -> neurônios
const content = async (req, res) => {
  try {
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
        msg: "It was not possible to extract text from the PDF",
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
      throw new Error(
        "No JSON found in the AI response"
      );
    }

    const parsed = JSON.parse(jsonMatch[0]);

    if (!parsed.neurons || !Array.isArray(parsed.neurons)) {
      throw new Error("Invalid AI response");
    }

    // Lista de conceitos existentes
    const concepts = new Set(
      parsed.neurons.map(
        (neuron) => neuron.concept
      )
    );

    // Remove conexões inválidas, duplicadas e auto-conexões
    for (const neuron of parsed.neurons) {
      const connections = neuron.connections || [];

      neuron.connections = [
        ...new Set(
          connections.filter(
            (connection) =>
              concepts.has(connection) &&
              connection !== neuron.concept
          )
        ),
      ];
    }

    console.log(
      `JSON received with ${parsed.neurons.length} neurons`
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

// neurônios -> MongoDB
const confirmContent = async (req, res) => {
  try {
    const { title, neurons } = req.body;
    const userId = req.user.id;

    if (!title || !neurons || !Array.isArray(neurons)) {
      return res.status(400).json({
        msg: "Dados inválidos",
      });
    }

    // Cria Content primeiro
    const createdContent = await Content.create({
      userId,
      title,
      neurons: [],
    });

    // concept -> ObjectId
    const neuronMap = new Map();

    const createdNeurons = [];

    // Cria todos os neurônios sem conexões
    for (const neuron of neurons) {
      const createdNeuron = await Neuron.create({
        userId,
        contentId: createdContent._id,
        concept: neuron.concept,

        performanceStatus: "red",
        memoryStatus: "black",
        score: 0,

        connections: [],
        interactions: [],
      });

      neuronMap.set(
        neuron.concept,
        createdNeuron._id
      );

      createdNeurons.push(createdNeuron);
    }

    // Atualiza conexões usando os IDs reais
    for (const neuron of neurons) {
      const neuronId = neuronMap.get(
        neuron.concept
      );

      const connectionIds =
        (neuron.connections || [])
          .map((connection) =>
            neuronMap.get(connection)
          )
          .filter(Boolean);

      await Neuron.findByIdAndUpdate(
        neuronId,
        {
          connections: connectionIds,
        }
      );
    }

    // Liga os neurônios ao conteúdo
    createdContent.neurons =
      createdNeurons.map(
        (neuron) => neuron._id
      );

    await createdContent.save();

    return res.status(201).json({
      msg: "Conteúdo confirmado com sucesso",
      contentId: createdContent._id,
      neurons: createdNeurons.length,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      msg: "Internal error",
      error: error.message,
    });
  }
};

export { content, confirmContent };