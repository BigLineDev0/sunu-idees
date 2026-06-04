const supabaseUrl = "https://cpkfgakapuhsdybwsbxf.supabase.co";

const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwa2ZnYWthcHVoc2R5YndzYnhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1MDYxMzcsImV4cCI6MjA5NjA4MjEzN30.P54Vgddfw3b5jI5EV_NqHFypWNfzceY3LZlrVEQifcM";

export const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

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