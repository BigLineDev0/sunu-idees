import { validerTitre, validerDescription } from "./utils/validation.js";

import { afficherNombreIdees, getCategoryStyle, formaterDate, afficherToast } from "./utils/ui.js";

import { suggererCategorie } from "./api/openrouter.js";

import { addIdea, getIdeas, updateIdea, deleteIdea } from "./api/supabase.js";

let todos = [] // tableau idees
let editId;

const form = document.getElementById("idea-form");
const inputRecherche = document.getElementById("search-input");
const inputFiltre = document.getElementById("filter-categorie");
const titreInput = document.getElementById("titre");
const categorieSelect = document.getElementById("categorie");
const descriptionInput = document.getElementById("description");
const btn = document.getElementById("submit-btn");
const compteurCaractere = document.getElementById("compteur-Caractere");
const idees = document.getElementById("ideas-container");


form.addEventListener("submit", async function(e) {
    e.preventDefault();

    if (!validerForm()) return;

    // const moderation = await modererDescription(descriptionInput.value);

    // if (!moderation.valide) {
    //     setError(descriptionInput, moderation.message);
    //     btn.disabled = false;
    //     btn.textContent = "Publier l'idée";
    //     return;
    // }

    const titre = titreInput.value;
    const description = descriptionInput.value;

    // Loader
    btn.disabled = true;
    btn.innerHTML = `<span class="animate-spin inline-block mr-2">
        <i class="fa-solid fa-spinner"></i>
        </span> Analyse IA...
        `;

    let categorie;
    try {
        if (categorieSelect.value === "") {
            
            categorie = await suggererCategorie(titre, description);
        }
        else{
            categorie = categorieSelect.value
        }
    } catch (err) {
        console.error("Erreur IA :", err);
        categorie = categorieSelect.value;

    } finally {
        
        btn.disabled = false;
        btn.innerHTML = editId ? "Modifier l'idée" : "Publier l'idée";
    }

    categorieSelect.value = categorie;

    if (editId) {
        await updateIdea(editId, {titre,categorie,description});
        afficherToast("Idée modifiée avec succès !");

        editId = null;

    } else {
        try {

            await addIdea({titre, categorie, description});
            afficherToast("Idée publiée avec succès !");
            
        } catch(error) {
            console.error(error);
        }
    }

    await chargerTodos();

    form.reset();

    [titreInput, categorieSelect, descriptionInput].forEach(el => {
        el.classList.remove("border-green-500");
    });

    compteurCaractere.textContent = "500 caractères.";
    btn.textContent = "Publier l'idée";
});


// charger les idees depuis supabase
async function chargerTodos(){
    try {

        todos = await getIdeas();

        afficherNombreIdees(todos);
        afficherTodos();

    } catch(error) {

        console.error(error);
    }
}

// Afficher les idees
function afficherTodos(donnees = todos) {

    let html = "";

    if(todos.length === 0){
        html = `
            <div class="col-span-full flex flex-col items-center justify-center py-16 text-center">

                <div class="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                    <i class="fa-regular fa-lightbulb text-2xl text-slate-400"></i>
                </div>

                <h3 class="text-xl font-semibold text-slate-700 mb-2">
                    Aucune idée trouvée
                </h3>

                <p class="text-slate-500 max-w-md">
                    Aucune idée n'a encore été publiée.
                </p>

            </div>
        `;
    }
    else if(donnees.length === 0){
        html = `
            <div class="col-span-full flex flex-col items-center justify-center py-16 text-center">

                <div class="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                    <i class="fa-regular fa-lightbulb text-2xl text-slate-400"></i>
                </div>

                <h3 class="text-xl font-semibold text-slate-700 mb-2">
                    Aucune idée trouvée
                </h3>

                <p class="text-slate-500 max-w-md">
                    Aucune proposition ne correspond à votre recherche.
                </p>

            </div>
        `;
    }
    else{

        donnees.forEach(todo => {

            const styles = getCategoryStyle(todo.categorie);

            html += `
            
                <div class="bg-white rounded-2xl border-t-4 ${styles.border} p-5 shadow-sm">

                    <span class="inline-block px-3 py-1 rounded-full text-sm font-medium mb-4 ${styles.badge}">
                        ${todo.categorie}
                    </span>

                    <h3 class="text-xl font-bold text-slate-800 leading-tight mb-4">
                        ${todo.titre}
                    </h3>

                    <p class="text-slate-500 leading-relaxed mb-6">
                        ${todo.description}
                    </p>

                    <div class="pt-4 border-t border-slate-100 flex items-center justify-between">
                        <span class="text-sm text-slate-400">${formaterDate(todo.date)}</span>

                        <div class="flex gap-3">

                            <button onclick="modifierTodo(${todo.id})" class="border border-blue-300 text-blue-600 px-4 py-2 rounded-xl hover:bg-blue-50 transition">
                                Modifier
                            </button>

                            <button onclick="supprimerTodo(${todo.id})" class="border border-red-300 text-red-500 px-4 py-2 rounded-xl hover:bg-red-50 transition">
                                Supprimer
                            </button>

                        </div>
                    </div>

                </div>
            `;
        });
    }
    idees.innerHTML = html
}

// supprimer une idee
async function supprimerTodo(id) {

    const confirmation = confirm("Voulez-vous vraiment supprimer cette idée ?");

    // si l'utilisateur clique sur annuler
    if (!confirmation) {
        return;
    }

    try {

        await deleteIdea(id);
        afficherToast("Idée supprimée avec succès !")

        await chargerTodos();

    } catch(error) {

        console.error(error);
    }

}

// modifier une idee
function modifierTodo (id){

    const todo = todos.find(todo => todo.id === id);

    if (!todo) return;

    titreInput.value = todo.titre
    categorieSelect.value = todo.categorie
    descriptionInput.value = todo.description

    editId = id;

    btn.textContent = "Modifier l'idée";

}

// filter par categorie et recherche
const filterTodo = () => {
    const valeurRechercher = inputRecherche.value.toLowerCase();
    const filterCategorie = inputFiltre.value;

    // filtrage 
    const filtres = todos.filter(todo => {
        const rechercheCombines = (todo.titre || "").toLowerCase().includes(valeurRechercher) || (todo.description || "").toLowerCase().includes(valeurRechercher);

        const filtreParCategorie = filterCategorie === "Toutes" || todo.categorie === filterCategorie;

        // combinees les deux
        return rechercheCombines && filtreParCategorie
    });

    afficherNombreIdees(filtres)

    afficherTodos(filtres)

}

// Validation globale
function validerForm() {
    const titreValide = validerTitre(titreInput);
    // const categorieValide = validerCategorie();
    const descriptionValide = validerDescription(descriptionInput);

    return (titreValide && descriptionValide);
}

// Declencher les evenements
inputRecherche.addEventListener("input", filterTodo);

inputFiltre.addEventListener("change", filterTodo);

//validation en temps reel
titreInput.addEventListener("input", () => {
    validerTitre(titreInput);
});

descriptionInput.addEventListener("input", () => {
    validerDescription(descriptionInput);
    const caractereRestant = 500 - descriptionInput.value.length;
    compteurCaractere.textContent = `${caractereRestant} caractères.`;
});

// charger les idees au demarage
window.addEventListener("DOMContentLoaded", async () => {
    await chargerTodos();
});

// Acces global
window.modifierTodo = modifierTodo;
window.supprimerTodo = supprimerTodo;