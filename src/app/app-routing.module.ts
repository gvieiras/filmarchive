import { NgModule } from "@angular/core";
import { Route, RouterModule } from "@angular/router";
import { LandingComponent } from "./components/landing/landing.component";
import { BadRoutesComponent } from "./components/bad-routes/bad-routes.component";

const routes:Route[] = [
    {
        path:'',
        component:LandingComponent,
    },
    {
        path:'films',
        loadChildren:()=>import("./components/films/filmRoutes").then(mod=>mod.FILM_ROUTES)
    },
    {
        path:'login',
        loadChildren:()=>import("./components/auth/authRoutes").then(mod=>mod.AUTH_ROTES)
    },
    {
        path:"**",
        component:BadRoutesComponent
    }
];

@NgModule({
    imports:[RouterModule.forRoot(routes)],
    exports:[RouterModule]
})

export class AppRoutingModule{
}