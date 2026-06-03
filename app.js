const form = document.getElementById("idea-form");

let todos = [] // tableau idees
let editId;

const inputRecherche = document.getElementById("search-input");
const inputFiltre = document.getElementById("filter-categorie");


form.addEventListener("submit", function(e) {
    e.preventDefault(); //empecher le rechargement

    const titre = document.getElementById("titre").value;
    const categorie = document.getElementById("categorie").value;
    const description = document.getElementById("description").value;

    document.getElementById("submit-btn").textContent = "Publier l'idée";

    if (titre === "" || categorie === "" || description === "") {
        return alert("Veuillez remplir tous les champs");
    }

    // Mode modification
    if (editId) {
        todos = todos.map(todo => {
            if (todo.id === editId) {
                return {...todo, titre, categorie, description}
            }
            return todo;
        });

        editId = null;
    }

    // Mode d'ajout
    else{

        const todo = {
            'id': Date.now(),
            titre,
            categorie,
            description,
            date: new Date()
        }
        
        todos.push(todo);
    }

    console.log(todos);
     
    sauvegarderTodos()

    afficherNombreIdees()

    afficherTodos();

    // vider les champs
    form.reset();
    
    
});

// sauvegarder dans le localStorage
const sauvegarderTodos = () => {
    localStorage.setItem("todos", JSON.stringify(todos));
}

// charger les todos
const chargerTodos = () => {
    const donnees = localStorage.getItem("todos");

    if (donnees) {
        todos = JSON.parse(donnees);
    }

    afficherNombreIdees()
    afficherTodos();
}

// charger les todos au demarage
window.addEventListener(
    "DOMContentLoaded",
    chargerTodos,
);

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
function supprimerTodo(id) {

    const confirmation = confirm("Voulez-vous vraiment supprimer cette idée ?");

    // si l'utilisateur clique sur annuler
    if (!confirmation) {
        return;
    }

    todos = todos.filter(todo => todo.id !== id);

    sauvegarderTodos();

    afficherNombreIdees()

    afficherTodos();
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

    const prompt = `
        Tu es un classificateur d'idées.

        Catégories :

        - Pédagogie
        - Événement
        - Vie de campus
        - Amélioration technique

        Réponds uniquement avec une catégorie.

        Titre : ${titre}

        Description : ${description}
    `;

    const reponse = await fetch("http://localhost:11434/api/generate", 
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "mistral",
                prompt,
                stream: false
            })
        }
    );

    

    const data = await reponse.json();

     const categorie = data.response.trim();

    console.log("Catégorie suggérée :",categorie);

    document.getElementById("categorie").value = categorie;
    
    
}


document
    .getElementById("description")
    .addEventListener("blur", suggegerCategorie);
