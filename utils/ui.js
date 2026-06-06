import { CATEGORY_STYLES } from "./constants.js";


export function getCategoryStyle(categorie) {

    return CATEGORY_STYLES[categorie] || {
        border: "border-slate-300",
        badge: "bg-slate-100 text-slate-600"
    };
}

export function formaterDate(date) {

    return new Date(date).toLocaleString(
        "fr-FR",
        {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}

export function afficherNombreIdees(todos) {

    document.getElementById("ideas-count").textContent = `${todos.length} ${todos.length > 1 ? "Idées" : "Idée"}`;
}

export function afficherToast(message, type = "success") {

    const toast = document.getElementById("toast");

    toast.textContent = message;

    // Couleur selon le type

    toast.classList.remove(
        "bg-green-500",
        "bg-red-500",
        "bg-orange-500"
    );

    if (type === "success") {
        toast.classList.add("bg-green-500");
    }

    if (type === "error") {
        toast.classList.add("bg-red-500");
    }

    if (type === "warning") {
        toast.classList.add("bg-orange-500");
    }

    // Afficher

    toast.classList.remove("translate-x-[400px]");
    toast.classList.add("translate-x-0");

    // Masquer après 3 secondes

    setTimeout(() => {

        toast.classList.remove("translate-x-0");
        toast.classList.add("translate-x-[400px]");

    }, 3000);
}