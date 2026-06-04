export default async function handler(req, res) {

    // Accepter uniquement POST
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Méthode non autorisée" });
    }

    const { titre, description } = req.body;

    const prompt = `
        Tu es un classificateur d'idées.
        Catégories : Pédagogie, Événement, Vie de campus, Amélioration technique
        Réponds uniquement avec une catégorie.
        Titre : ${titre}
        Description : ${description}
    `;

    const reponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            // La clé est lue côté serveur, jamais exposée au navigateur
            "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: "nvidia/nemotron-3-super-120b-a12b:free",
            messages: [{ role: "user", content: prompt }],
            temperature: 0
        })
    });

    const data = await reponse.json();
    const categorie = data.choices[0].message.content.trim();

    return res.status(200).json({ categorie });
}