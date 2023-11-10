import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from "@angular/router";
import { Film } from "./film.model";
import { inject } from "@angular/core";
import { FilmsService } from "./films.service";

export const filmsResolver:ResolveFn<Film[]> = (route:ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    return inject(FilmsService).getFilms();
    // const films = inject(FilmsService).getFilms();
    // if(films.length === 0){
    //     return inject(DatabaseStorageService).fetchFilms();
    // }
    // return films;
}
