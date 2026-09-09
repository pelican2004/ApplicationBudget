const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const analyzeExpenseReceipt = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message:
          "Nu a fost încărcat niciun bon.",
      });
    }

    console.log(
      "Analizez bonul:",
      req.file.originalname
    );

    const base64File =
      req.file.buffer.toString("base64");

    let fileContent;
    if (
      req.file.mimetype ===
      "application/pdf"
    ) {
      fileContent = {
        type: "input_file",
        filename: req.file.originalname,

        file_data:
          `data:application/pdf;base64,${base64File}`,
      };
    }
    else {
      fileContent = {
        type: "input_image",

        image_url:
          `data:${req.file.mimetype};base64,${base64File}`,
      };
    }

    const response =
      await openai.responses.create({
        model: "gpt-5.6",

        input: [
          {
            role: "user",

            content: [
              fileContent,

              {
                type: "input_text",

                text: `
Analizează acest bon fiscal.

Extrage următoarele informații:

1. magazinul / comerciantul;
2. data cumpărăturii;
3. suma totală achitată;
4. fiecare produs cumpărat;
5. prețul fiecărui produs.

Returnează DOAR JSON valid în formatul:

{
  "store": "",
  "date": "",
  "totalAmount": 0,
  "products": [
    {
      "name": "",
      "price": 0
    }
  ]
}

Reguli:

- date trebuie să fie YYYY-MM-DD;
- totalAmount trebuie să fie număr;
- price trebuie să fie număr;
- nu include moneda în valori;
- nu inventa produse;
- nu inventa prețuri;
- dacă magazinul nu poate fi identificat, store trebuie să fie null;
- dacă data nu poate fi identificată, date trebuie să fie null;
- dacă suma totală nu poate fi identificată, totalAmount trebuie să fie null;
- ignoră subtotalurile dacă există o sumă finală de plată;
- dacă există reduceri, folosește prețul efectiv achitat atunci când acesta poate fi determinat;
- produsele trebuie extrase doar dacă apar pe bon.
                `,
              },
            ],
          },
        ],
      });

    const aiText =
      response.output_text;

    if (!aiText) {
      return res.status(500).json({
        success: false,
        message:
          "AI-ul nu a returnat informații despre bon.",
      });
    }

    const cleanedText =
      aiText
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

    let receiptData;

    try {
      receiptData =
        JSON.parse(cleanedText);
    } catch (parseError) {
      console.error(
        "JSON AI invalid:",
        cleanedText
      );

      return res.status(500).json({
        success: false,
        message:
          "Răspunsul AI nu a putut fi interpretat.",
      });
    }

    return res.json({
      success: true,

      message:
        "Bonul a fost analizat cu succes!",

      receipt: receiptData,
    });
  } catch (error) {
    console.error(
      "Eroare analiză bon AI:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Nu am putut analiza bonul.",

      error:
        process.env.NODE_ENV ===
        "development"
          ? error.message
          : undefined,
    });
  }
};

module.exports = {
  analyzeExpenseReceipt,
};
