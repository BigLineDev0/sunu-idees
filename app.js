// import { API_KEY } from "./config.js";

const supabaseUrl = "https://cpkfgakapuhsdybwsbxf.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwa2ZnYWthcHVoc2R5YndzYnhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1MDYxMzcsImV4cCI6MjA5NjA4MjEzN30.P54Vgddfw3b5jI5EV_NqHFypWNfzceY3LZlrVEQifcM";


let todos = [] // tableau idees
let editId;

const form = document.getElementById("idea-form");
const inputRecherche = document.getElementById("search-input");
const inputFiltre = document.getElementById("filter-categorie");
const titreInput = document.getElementById("titre");
const categorieSelect = document.getElementById("categorie");
const descriptionInput = document.getElementById("description");

const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);


//Afficher le message d'erreur et la bordure red
function setError(element, message) {

    const formControl = element.parentElement;
    const small = formControl.querySelector("small");

    // Affichage du message
    if (small) {
        small.innerText = message;
    }

    // Bordure rouge
    element.classList.remove("border-green-500");
    element.classList.add("border-red-500");
}

// masquer le message et afficher la bordure green
function setSuccess(element) {

    const formControl = element.parentElement;
    const small = formControl.querySelector("small");

    // Affichage du message
    if (small) {
        small.innerText = '';
    }

    // Bordure verte
    element.classList.add("border-green-500");
    element.classList.remove("border-red-500");
}

// Valider le champ titre
function validerTitre() {

    const value = titreInput.value.trim();

    if (value === "") {

        setError(titreInput, "Le champ titre est obligatoire.");

        return false;
    }

    if (value.length < 3) {

        setError(titreInput, "Minimum 3 caractères.");

        return false;
    }

    if (!value.match(/^[a-zA-Z]/)) {
        setError(titreInput, "Le champ titre doit commence par une lettre.")
        return false;
    }

    setSuccess(titreInput);
    return true;

}

// Validation du champ select categorie
function validerCategorie() {
     
    if (categorieSelect.value === "") {
        setError(categorieSelect, "Veuillez selectionner une categorie.");
        return false;
    }

    setSuccess(categorieSelect);
    return true;
}

// Validation du champ description
function validerDescription(){
    if (descriptionInput.value === "" || descriptionInput.value.length < 10) {
        setError(descriptionInput, "Le champ description doit contenir au mois 10 caractere.");
        return false;
    }

    setSuccess(descriptionInput);
    return true;
    
}


form.addEventListener("submit", async function(e) {
    e.preventDefault();

    if (!validerForm()) return;

    const titre = titreInput.value;
    const description = descriptionInput.value;
    const btn = document.getElementById("submit-btn");

    // Loader clair avec spinner Unicode
    btn.disabled = true;
    btn.innerHTML = `<span class="animate-spin inline-block mr-2">
        <i class="fa-solid fa-spinner"></i>
        </span> Analyse IA...`;

    let categorie;
    try {
        categorie = await suggegerCategorie();
    } catch (err) {
        console.error("Erreur IA :", err);
        // Fallback : garder la catégorie choisie manuellement
        categorie = categorieSelect.value;
    } finally {
        // Toujours rétablir le bouton, même en cas d'erreur
        btn.disabled = false;
        btn.innerHTML = editId ? "Modifier l'idée" : "Publier l'idée";
    }

    categorieSelect.value = categorie;

    if (editId) {
        const { error } = await supabase
            .from("ideas")
            .update({ titre, categorie, description })
            .eq("id", editId);

        if (error) { console.error(error); return; }
        editId = null;

    } else {
        const { data, error } = await supabase
            .from("ideas")
            .insert([{ titre, categorie, description }]);

        if (error) { 
            console.error(error); return; 
        }
    }

    await chargerTodos(); // Un seul appel suffit

    form.reset();
    [titreInput, categorieSelect, descriptionInput].forEach(el => {
        el.classList.remove("border-green-500");
    });
});

// Validation globale
function validerForm() {
    const titreValide = validerTitre();
    // const categorieValide = validerCategorie();
    const descriptionValide = validerDescription();

    return (titreValide && descriptionValide);
}

// charger les todos
async function chargerTodos(){
    const { data, error } = await supabase
        .from("ideas")
        .select("*")
        .order("date", { ascending: false });

    if(error){
        console.error(error);
        return;
    }

    todos = data;

    afficherNombreIdees()
    afficherTodos();
}


// afficher le nombres idees
function afficherNombreIdees() {

    const count = todos.length;

    document.getElementById("ideas-count").textContent = `${count} ${count > 1 ? "Idées" : "Idée"}`;
}

// formater la date
function formaterDate(date) {

    return new Date(date).toLocaleString(
        "fr-FR",
        {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }
    );
}

// afficher la couleur de la categorie et bordure 
function getCategoryStyle(categorie) {

    switch(categorie) {

        case "Pédagogie":
            return {
                border: "border-blue-500",
                badge: "bg-blue-100 text-blue-600"
            };

        case "Événement":
            return {
                border: "border-purple-500",
                badge: "bg-purple-100 text-purple-600"
            };

        case "Vie de campus":
            return {
                border: "border-green-500",
                badge: "bg-green-100 text-green-600"
            };

        case "Amélioration technique":
            return {
                border: "border-orange-500",
                badge: "bg-orange-100 text-orange-600"
            };

        default:
            return {
                border: "border-slate-300",
                badge: "bg-slate-100 text-slate-600"
            };
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

    const { error } = await supabase
        .from("ideas")
        .delete()
        .eq("id", id);

    if (error) {
        console.error(error);
        return;
    }

    await chargerTodos();

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

    afficherNombreIdees()

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

// Suggeger categorie par l'IA
async function suggegerCategorie() {

    const titre = document.getElementById("titre").value;
    const description = document.getElementById("description").value;

    const reponse = await fetch("api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titre, description })
    });

    const data = await reponse.json();
    return data.categorie;
    
}

//validation en temps reel
titreInput.addEventListener("input", validerTitre);
categorieSelect.addEventListener("change", validerCategorie);
descriptionInput.addEventListener("input", validerDescription);

// charger les todos au demarage
window.addEventListener("DOMContentLoaded", async () => {
    await chargerTodos();
});

// document
//     .getElementById("description")
//     .addEventListener("blur", suggegerCategorie);

window.modifierTodo = modifierTodo;
window.supprimerTodo = supprimerTodo;
