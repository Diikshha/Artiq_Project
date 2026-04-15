// controllers/aadhaarController.js
const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function scanAadhaar(req, res) {
    try {
        const { imageBase64, mediaType } = req.body;

        if (!imageBase64) {
            return res.status(400).json({ message: "Image data is required." });
        }

        const validTypes = ["image/jpeg", "image/png", "image/webp"];
        const resolvedType = validTypes.includes(mediaType) ? mediaType : "image/jpeg";

        const response = await groq.chat.completions.create({
            model: "meta-llama/llama-4-scout-17b-16e-instruct",
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "image_url",
                            image_url: {
                                url: `data:${resolvedType};base64,${imageBase64}`
                            }
                        },
                        {
                            type: "text",
                            text: `This is an Aadhaar card image from India. Extract only these three fields and respond with ONLY a valid JSON object, no markdown, no explanation, no extra text:
{
  "aadharno": "12-digit Aadhaar number without spaces or dashes (or empty string if not found)",
  "dob": "date of birth in YYYY-MM-DD format (or empty string if not found)",
  "gender": "Male or Female or Other (or empty string if not found)"
}`
                        }
                    ]
                }
            ],
            max_tokens: 300
        });

        const rawText = response.choices[0]?.message?.content || "";
        const cleaned = rawText.replace(/```json|```/g, "").trim();

        let parsed = { aadharno: "", dob: "", gender: "" };
        try {
            parsed = JSON.parse(cleaned);
        } catch {
            const numMatch    = rawText.match(/\b\d{4}\s?\d{4}\s?\d{4}\b/);
            const dobMatch    = rawText.match(/\b(\d{2})[\/\-](\d{2})[\/\-](\d{4})\b/);
            const genderMatch = rawText.match(/\b(Male|Female|Other)\b/i);

            if (numMatch)    parsed.aadharno = numMatch[0].replace(/\s/g, "");
            if (dobMatch)    parsed.dob      = `${dobMatch[3]}-${dobMatch[2]}-${dobMatch[1]}`;
            if (genderMatch) parsed.gender   = genderMatch[1];
        }

        if (parsed.aadharno) {
            parsed.aadharno = parsed.aadharno.replace(/\D/g, "").slice(0, 12);
        }

        return res.status(200).json({
            aadharno: parsed.aadharno || "",
            dob:      parsed.dob      || "",
            gender:   parsed.gender   || ""
        });

    } catch (err) {
        console.error("[scanAadhaar]", err.message);
        return res.status(500).json({ message: "Failed to scan Aadhaar. Please fill details manually." });
    }
}

module.exports = { scanAadhaar };