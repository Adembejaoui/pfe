  // Fetch genres
export async function fetchGenres() {
    const res = await fetch(`https://api.rawg.io/api/genres?key=5c81f11f33604f3aa7ff020c04803606`);
    const data = await res.json();
    return data.results;
  }
  
  // Fetch games by genre (Action = id 4)
  export async function fetchGamesByGenre(genreId: number) {
    const res = await fetch(`https://api.rawg.io/api/games?key=5c81f11f33604f3aa7ff020c04803606&genres=${genreId}`);
    const data = await res.json();
    return data.results;
  }
  
  // Fetch single game by slug
  export async function fetchGameDetails(slug: string) {
    const res = await fetch(`https://api.rawg.io/api/games/${slug}?key=5c81f11f33604f3aa7ff020c04803606`);
    const data = await res.json();
    return data;
  }
  
  // Fetch screenshots for carousel
  export async function fetchGameScreenshots(slug: string) {
    const res = await fetch(`https://api.rawg.io/api/games/${slug}/screenshots?key=5c81f11f33604f3aa7ff020c04803606`);
    const data = await res.json();
    return data.results;
  }
  