import { HttpClient } from "@angular/common/http";
import { Injectable, Pipe, PipeTransform } from "@angular/core";
import { of } from "rxjs";
import { map, catchError } from "rxjs/operators"

@Pipe({
    name:"badImageURL",
    standalone:true
})
@Injectable({
    providedIn:'root'
})
export class BadImageURLPipe implements PipeTransform{
    constructor(private http:HttpClient){}
    transform(url:string) {
        return this.http.get(url, {responseType:'text'}).pipe(map(()=>{
            if(url === ''){
                return "./assets/large_movie_poster.png";
            }
            return url;
        }), catchError(err=>{
            return of("./assets/large_movie_poster.png");
        }))
    }
}