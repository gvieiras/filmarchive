import { Route } from "@angular/router";
import { FilmsComponent } from "./films.component";
import { FilmListComponent } from "./film-list/film-list.component";
import { FilmDetailsComponent } from "./film-details/film-details.component";
import { FilmEditComponent } from "./film-edit/film-edit.component";
import { authCanActivate } from "../auth/auth.guard";

export const FILM_ROUTES:Route[] = [
    {path:'',component:FilmsComponent, children:[
        {path:'',component:FilmListComponent,pathMatch:'full'},
        {path:'add',component:FilmEditComponent, 
            canActivate:[authCanActivate]},
        {path:':id',component:FilmDetailsComponent, 
        },
        {path:':id/edit',component:FilmEditComponent, 
            canActivate:[authCanActivate]
        },
    ]},
]