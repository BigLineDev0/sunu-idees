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