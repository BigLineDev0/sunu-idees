export function setError(element, message) {

    const small = element.parentElement.querySelector("small");

    if (small) {
        small.innerText = message;
    }

    element.classList.remove("border-green-500");
    element.classList.add("border-red-500");
}

export function setSuccess(element) {

    const small = element.parentElement.querySelector("small");

    if (small) {
        small.innerText = "";
    }

    element.classList.remove("border-red-500");
    element.classList.add("border-green-500");
}

export function validerTitre(input) {

    const value = input.value.trim();

    if (value === "") {
        setError(input, "Titre obligatoire");
        return false;
    }

    if (value.length < 5) {
        setError(input, "Minimum 3 caractères");
        return false;
    }

    if (!value.match(/^[a-zA-Z]/)) {
        setError(input, "Titre doit commencé par une lettre.");
        return false;
    }

    setSuccess(input);
    return true;
}

export function validerDescription(input) {

    const value = input.value.trim();

    if (value.length < 10) {
        setError(input, "Minimum 10 caractères");
        return false;
    }

    if (value.length > 500) {
        setError(input, "Maximum 500 caractères");
    }

    setSuccess(input);
    return true;
}