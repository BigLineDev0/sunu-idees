const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

export async function suggererCategorie(titre, description) {

    const prompt = `
        Tu es un classificateur d'idées pour une plateforme universitaire.
        Réponds UNIQUEMENT avec l'une de ces catégories exactes :
        Pédagogie, Événement, Vie de campus, Amélioration technique
        Titre : ${titre}
        Description : ${description}
    `;

    const reponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: "nvidia/nemotron-3-super-120b-a12b:free",
            messages: [
                {
                    role: "system",
                    content: "Tu es un classificateur. Réponds uniquement avec la catégorie exacte, rien d'autre."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0
        })
    });

    if (!reponse.ok) {
        const erreur = await reponse.json();
        throw new Error(erreur.error?.message || "Erreur OpenRouter");
    }

    const data = await reponse.json();

    const categorie = data.choices[0].message.content.trim();

    return categorie.replace(/\s+/g, " ").trim();
 
}


// export async function modererDescription(description) {

//     const prompt = `
//         Analyse si ce texte est respectueux et approprié pour une plateforme universitaire.
        
//         Texte à analyser : "${description}"
        
//         Réponds UNIQUEMENT en JSON strict, sans markdown, sans explication :
//         {
//             "valide": true ou false,
//             "message": "message court et bienveillant pour l'étudiant"
//         }

//         valide = false si le texte contient :
//         - Insultes ou propos haineux
//         - Langage vulgaire ou offensant
//         - Attaques personnelles
//         - Propos discriminatoires
//         - Contenu menaçant

//         valide = true si le texte est respectueux et constructif.

//         Si valide = true  → message d'encouragement court.
//         Si valide = false → expliquer poliment pourquoi et inviter à reformuler.
//     `;

//     const reponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
//         method: "POST",
//         headers: {
//             "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
//             "Content-Type": "application/json"
//         },
//         body: JSON.stringify({
//             model: "nvidia/nemotron-3-super-120b-a12b:free",
//             messages: [
//                 {
//                     role: "system",
//                     content: "Tu es un modérateur bienveillant. Tu réponds TOUJOURS en JSON strict uniquement, sans markdown."
//                 },
//                 {
//                     role: "user",
//                     content: prompt
//                 }
//             ],
//             temperature: 0
//         })
//     });

//     if (!reponse.ok) {
//         const erreur = await reponse.json();
//         throw new Error(erreur.error?.message || "Erreur OpenRouter");
//     }

//     const data = await reponse.json();

//     const contenu = data.choices[0].message.content.trim();

//     // Nettoyage au cas où le modèle ajoute des balises markdown
//     const contenuNettoye = contenu.replace(/```json|```/g, "").trim();

//     return JSON.parse(contenuNettoye);

// }