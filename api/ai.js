export default async function handler(req, res) {

    // Vérification méthode
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Méthode non autorisée" });
    }
    
    const { titre, description } = req.body;

    if (!titre || !description) {
        return res.status(400).json({ error: "Titre et description requis" });
    }

    try {
        const reponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "google/gemma-4-31b-it:freeze-2024-06-04",
                messages: [{ role: "user", content: `
                    Tu es un classificateur d'idées.
                    Catégories : Pédagogie, Événement, Vie de campus, Amélioration technique
                    Réponds uniquement avec une catégorie.
                    Titre : ${titre}
                    Description : ${description}
                `}],
                temperature: 0
            })
        });

        const data = await reponse.json();
        const categorie = data.choices[0].message.content.trim();

        return res.status(200).json({ categorie });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Erreur serveur IA" });
    }
}