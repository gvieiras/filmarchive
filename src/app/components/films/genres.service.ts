import { Injectable } from "@angular/core";

@Injectable({providedIn:'root'})
export class GenresService{
    genres:string[]=[
        "Action",
        "Adult",
        "Adventure",
        "Animation",
        "Biography",
        "Comedy",
        "Crime",
        "Documentary",
        "Drama",
        "Family",
        "Fantasy",
        "Film Noir",
        "History",
        "Horror",
        "Musical",
        "Music",
        "Mystery",
        "Romance",
        "Sci-fi",
        "Thriller",
        "War",
        "Western",
    ];

    get allGenres(){return this.genres.slice()}
}