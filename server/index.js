import "dotenv/config";
import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3001;

// Document photos can be a few MB once base64-encoded — raise the body limit.
app.use(cors());
app.use(express.json({ limit: "15mb" }));

// Reads GEMINI_API_KEY from the environment (server/.env). Never shipped to the app.
const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

// Structured output: clean Arabic fields the app can render directly,
// instead of parsing free-form prose. (Gemini-compatible schema — no
// `additionalProperties`; uses OpenAPI-subset types.)
const SCHEMA = {
  type: "object",
  properties: {
    document_type: {
      type: "string",
      description: "نوع المستند بالعربية، مثل: رسالة موعد، فاتورة، عقد، إشعار رسمي.",
    },
    is_appointment: {
      type: "boolean",
      description: "هل هذا المستند خاص بموعد؟",
    },
    title_ar: {
      type: "string",
      description: "عنوان قصير يلخص المستند بالعربية.",
    },
    date_ar: {
      type: "string",
      description: "تاريخ الموعد إن وُجد، وإلا اتركه فارغًا.",
    },
    time_ar: {
      type: "string",
      description: "وقت الموعد إن وُجد، وإلا اتركه فارغًا.",
    },
    location_ar: {
      type: "string",
      description: "مكان الموعد أو الجهة المُصدِرة إن وُجد، وإلا اتركه فارغًا.",
    },
    action_required_ar: {
      type: "string",
      description: "ما المطلوب من الشخص أن يفعله، إن وُجد.",
    },
    summary_ar: {
      type: "string",
      description: "شرح موجز وواضح للمستند بالعربية بجملتين أو ثلاث.",
    },
  },
  required: [
    "document_type",
    "is_appointment",
    "title_ar",
    "date_ar",
    "time_ar",
    "location_ar",
    "action_required_ar",
    "summary_ar",
  ],
};

const SYSTEM_PROMPT =
  "أنت مساعد يقرأ صور المستندات (بأي لغة) ويشرحها للمستخدم بالعربية الفصحى المبسطة. " +
  "اقرأ النص الموجود في الصورة بدقة. إذا كان المستند موعدًا، استخرج التاريخ والوقت والمكان والمطلوب من الشخص. " +
  "إذا لم تتوفر معلومة، اترك حقلها فارغًا ولا تختلق أي تفاصيل.";

app.get("/health", (_req, res) => res.json({ ok: true }));

app.post("/api/explain", async (req, res) => {
  const { image, mediaType } = req.body || {};

  if (!image || typeof image !== "string") {
    return res.status(400).json({ error: "الصورة مفقودة." });
  }

  if (!API_KEY) {
    console.error("explain error: GEMINI_API_KEY is not set");
    return res.status(500).json({ error: "إعداد الخادم غير صحيح (مفتاح API)." });
  }

  try {
    const response = await fetch(`${GEMINI_URL}?key=${API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [
          {
            role: "user",
            parts: [
              {
                inline_data: {
                  mime_type: mediaType || "image/jpeg",
                  data: image,
                },
              },
              {
                text: "اقرأ هذا المستند واشرحه بالعربية. حدّد نوعه، وإن كان موعدًا فاذكر التاريخ والوقت والمكان والمطلوب من الشخص.",
              },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: SCHEMA,
          maxOutputTokens: 2048,
          // gemini-2.5-flash is a "thinking" model; thoughts eat the output
          // budget and can truncate the JSON. Disable thinking for this task.
          thinkingConfig: { thinkingBudget: 0 },
        },
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error("explain error:", response.status, detail);
      if (response.status === 400 || response.status === 401 || response.status === 403) {
        return res.status(500).json({ error: "إعداد الخادم غير صحيح (مفتاح API)." });
      }
      if (response.status === 429) {
        return res.status(429).json({ error: "الخدمة مزدحمة حاليًا، حاول بعد قليل." });
      }
      return res.status(500).json({ error: "حدث خطأ أثناء تحليل الصورة." });
    }

    const result = await response.json();
    const candidate = result?.candidates?.[0];

    // Blocked by safety filters or no usable output.
    if (result?.promptFeedback?.blockReason || candidate?.finishReason === "SAFETY") {
      return res.status(422).json({
        error: "تعذّر تحليل هذه الصورة. الرجاء تجربة صورة أوضح لمستند.",
      });
    }

    const text = candidate?.content?.parts?.find((p) => typeof p.text === "string")?.text;
    if (!text) {
      return res.status(502).json({ error: "لم يصل رد صالح من المحلّل." });
    }

    const data = JSON.parse(text);
    return res.json(data);
  } catch (err) {
    console.error("explain error:", err?.message);
    return res.status(500).json({ error: "حدث خطأ أثناء تحليل الصورة." });
  }
});

app.listen(PORT, () => {
  console.log(`image-explainer proxy listening on http://localhost:${PORT}`);
});
