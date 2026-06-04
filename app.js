import { validerTitre, validerDescription } from "./validation.js";

import { afficherNombreIdees, getCategoryStyle, formaterDate, suggererCategorie } from "./ui.js";

import { addIdea, getIdeas, updateIdea, deleteIdea } from "./supabase.js";

let todos = [] // tableau idees
let editId;

const form = document.getElementById("idea-form");
const inputRecherche = document.getElementById("search-input");
const inputFiltre = document.getElementById("filter-categorie");
const titreInput = document.getElementById("titre");
const categorieSelect = document.getElementById("categorie");
const descriptionInput = document.getElementById("description");
const btn = document.getElementById("submit-btn");


form.addEventListener("submit", async function(e) {
    e.preventDefault();

    if (!validerForm()) return;

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
        categorie = await suggererCategorie(titre, description);
    } catch (err) {
        console.error("Erreur IA :", err);
        //garder la catégorie choisie manuellement
        categorie = categorieSelect.value;
    } finally {
        // Toujours rétablir le bouton, même en cas d'erreur
        btn.disabled = false;
        btn.innerHTML = editId ? "Modifier l'idée" : "Publier l'idée";
    }

    categorieSelect.value = categorie;

    if (editId) {
        await updateIdea(editId, {titre,categorie,description});

        editId = null;

    } else {
        try {

                await addIdea({titre, categorie, description});

                await chargerTodos();

            } catch(error) {

                console.error(error);
            }
    }

    await chargerTodos();

    form.reset();

    [titreInput, categorieSelect, descriptionInput].forEach(el => {
        el.classList.remove("border-green-500");
    });
});

// Validation globale
function validerForm() {
    const titreValide = validerTitre(titreInput);
    // const categorieValide = validerCategorie();
    const descriptionValide = validerDescription(descriptionInput);

    return (titreValide && descriptionValide);
}

// charger les todos
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

    const todoList = document.getElementById("ideas-container");

    todoList.innerHTML = "";
    

    if (donnees.length === 0) {

        todoList.innerHTML = `
            <p>Aucune idée trouvée</p>
        `;

        return;
    }
    else{

        donnees.forEach(todo => {

            const styles = getCategoryStyle(todo.categorie);

            todoList.innerHTML += `
            
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

        await chargerTodos();

    } catch(error) {

        console.error(error);
    }

}

// modifier une idee
function modifierTodo (id){

    const todo = todos.find(todo => todo.id === id);

    document.getElementById("titre").value = todo.titre
    document.getElementById("categorie").value = todo.categorie
    document.getElementById("description").value = todo.description

    editId = id;

    document.getElementById("submit-btn").textContent = "Modifier l'idée";

}

// filter par categorie et recherche
const filterTodo = () => {
    const valeurRechercher = inputRecherche.value.toLowerCase();
    const filterCategorie = inputFiltre.value;

    // filtrage 
    const filtres = todos.filter(todo => {
        const rechercheCombines = todo.titre.toLowerCase().includes(valeurRechercher) || todo.description.toLowerCase().includes(valeurRechercher);

        const filtreParCategorie = filterCategorie === "Toutes" || todo.categorie === filterCategorie;

        // combinees les deux
        return rechercheCombines && filtreParCategorie
    });

    afficherNombreIdees(todos)

    afficherTodos(filtres)

}

// Declencher les evenements
inputRecherche.addEventListener(
    "input",
    filterTodo
);

inputFiltre.addEventListener(
    "change",
    filterTodo
);

//validation en temps reel
titreInput.addEventListener("input", () => {
    validerTitre(titreInput);
});

// categorieSelect.addEventListener("change", validerCategorie);

descriptionInput.addEventListener("input", () => {
    validerDescription(descriptionInput);
});

// charger les todos au demarage
window.addEventListener("DOMContentLoaded", async () => {
    await chargerTodos();
});

window.modifierTodo = modifierTodo;
window.supprimerTodo = supprimerTodo;