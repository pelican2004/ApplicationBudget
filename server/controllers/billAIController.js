const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const analyzeBill = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Nu a fost încărcat niciun PDF.",
      });
    }

    console.log(
      "Analizez factura:",
      req.file.originalname
    );
    const base64PDF = req.file.buffer.toString("base64");

    const response = await openai.responses.create({
      model: "gpt-5.6",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_file",
              filename: req.file.originalname,
              file_data: `data:application/pdf;base64,${base64PDF}`,
            },
            {
              type: "input_text",
              text: `
Analizează această factură și extrage următoarele informații:

1. furnizorul facturii
2. numărul facturii
3. data emiterii
4. data scadenței
5. suma totală de plată

Returnează DOAR un obiect JSON în următorul format:

{
  "provider": "",
  "invoiceNumber": "",
  "issueDate": "",
  "dueDate": "",
  "amount": 0
}

Reguli:
- datele trebuie returnate în format YYYY-MM-DD;
- amount trebuie să fie număr, fără "lei";
- dacă o informație nu poate fi găsită, folosește null;
- nu inventa informații;
- suma trebuie să fie suma totală pe care clientul trebuie să o plătească.
              `,
            },
          ],
        },
      ],
    });

    console.log(
      "Răspuns primit de la AI."
    );

    const aiText = response.output_text;

    console.log(
      "Răspuns AI:",
      aiText
    );
    const cleanedText = aiText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const invoiceData = JSON.parse(
      cleanedText
    );

    res.json({
      success: true,
      message:
        "Factura a fost analizată cu succes!",
      invoice: invoiceData,
    });

  } catch (error) {
    console.error(
      "Eroare analiza AI:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Nu am putut analiza factura.",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};

module.exports = {
  analyzeBill,
};
