// Import propre via NPM, plus de CDN
import { createClient } from "@supabase/supabase-js";

// Variables d'environnement Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

// Initialisation Supabase
export const supabase = createClient(supabaseUrl, supabaseKey);

export async function getIdeas() {

    const { data, error } = await supabase
        .from("ideas")
        .select("*")
        .order("date", { ascending: false });

    if (error) throw error;

    return data;
}


export async function addIdea(idea) {

    const { error } = await supabase
        .from("ideas")
        .insert([idea]);

    if (error) throw error;
}

export async function updateIdea(id, idea) {

    const { error } = await supabase
        .from("ideas")
        .update(idea)
        .eq("id", id);

    if (error) throw error;
}

export async function deleteIdea(id) {

    const { error } = await supabase
        .from("ideas")
        .delete()
        .eq("id", id);

    if (error) throw error;
}