import { Film } from "./film.model";
import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

@Injectable({providedIn:"root"})
export class FilmsService{
    filteredFilmsChanged = new Subject<Film[]>();

    filterByDirectorValue?:string;
    filterByTitleValue?:string;
    filterByCountryValue?:string;
    filterByYearFROM?:number;
    filterByYearTO?:number;

    constructor(){
        for(let i=0;i<19;i++){
            this.addFilm({...this.nonFilm,title:"generic film "+i.toString()});
        }
    }
        
    private nonFilm:Film = {
        title:"Nonexistent film", 
        yearReleased:1893,
        countryIssued:{cca3:"USA", name:"United States"},
        directorName:"???", 
        posterImg:"./assets/large_movie_poster.png", 
        plot:"This is the plot of a nonexistent film; tragedy and drama ensues.",
        genres:['History'],
        id:4,
        numberOfRatings:0,
        wholeScore:0,
        medianScore:0,
    }

    private films:Film[] = [
        {
            title:"All The Real Girls", 
            yearReleased:2003,
            countryIssued:{cca3:"USA", name:"United States"},
            directorName:"David Gordon Green",
            posterImg:"https://cdn11.bigcommerce.com/s-yzgoj/images/stencil/1280x1280/products/381453/4306961/apijwom6x__12623.1625666559.jpg", 
            plot:"Small-town love story of a young man with a reputation for womanizing and his best friend's sister.",
            genres:['Drama', 'Comedy'],
            id:0,
            numberOfRatings:0,
            wholeScore:0,
            medianScore:0,
        },
        {
            title:"All About Lily Chou-Chou", 
            yearReleased:2001,
            countryIssued:{cca3:"JPN", name:"Japan"},
            directorName:"Shunji Iwai", 
            posterImg:"https://m.media-amazon.com/images/M/MV5BMTQ0NjEyMzkwNl5BMl5BanBnXkFtZTcwMTIxODcyMQ@@._V1_.jpg", 
            plot:"The problematic lives of teenager students for whom the singer Lily Chou-Chou's dreamy music is the only way to escape an alienating, violent and insensitive society.",
            genres:['Drama', 'Music'],
            id:1,
            numberOfRatings:0,
            wholeScore:0,
            medianScore:0,
        },
        {
            title:"Swallowtail Butterfly", 
            yearReleased:1996,
            countryIssued:{cca3:"JPN", name:"Japan"},
            directorName:"Shunji Iwai", 
            posterImg:"https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327775791i/3153322.jpg", 
            plot:"The struggles of a group of immigrant outcasts living in an alternative-future, xenophobic Japanese metropolis..",
            genres:['Drama'],
            id:2,
            numberOfRatings:0,
            wholeScore:0,
            medianScore:0,
        },
        {
            title:"The Assassination of Jesse James by the Coward Robert Ford", 
            yearReleased:2007,
            countryIssued:{cca3:"USA", name:"United States"},
            directorName:"Andrew Dominik", 
            posterImg:"https://musicart.xboxlive.com/7/152a1200-0000-0000-0000-000000000002/504/image.jpg?w=1920&h=1080", 
            plot:"Robert Ford, who's idolized Jesse James since childhood, tries hard to join the reforming gang of the Missouri outlaw, but gradually becomes resentful of the bandit leader.",
            genres:['Drama','Action'],
            id:3,
            numberOfRatings:0,
            wholeScore:0,
            medianScore:0,
        },
        this.nonFilm,
    ];

    private filteredFilms:Film[] = [];

    getFilms(){
        return this.films.slice();
    }

    setFilter(type:string, value:string){
        switch(type){
            case "filterByTitle":
                this.filterByTitleValue = value;
            break;
            case "filterByDirector":
                this.filterByDirectorValue = value;
            break;
            case "filterByCountry":
                this.filterByCountryValue = value;
            break;
            case "filterByYearFROM":
                this.filterByYearFROM = +value;
            break;
            case "filterByYearTO":
                this.filterByYearTO = +value;
            break;
        }
    }

    filterFilms(){
        this.filteredFilms = this.getFilms();
        if(!this.filterByTitleValue && !this.filterByDirectorValue && !this.filterByCountryValue && !this.filterByYearFROM && !this.filterByYearTO){
            this.filteredFilmsChanged.next(this.filteredFilms.slice());
        }else{
            const filtered = 
            this.filteredFilms.slice().filter(film=>
                film.title.toLowerCase().includes(this.filterByTitleValue ? this.filterByTitleValue.toLowerCase() : '') &&
                film.directorName.toLowerCase().includes(this.filterByDirectorValue ? this.filterByDirectorValue.toLowerCase() : '') &&
                film.countryIssued.name.toLowerCase().includes(this.filterByCountryValue ? this.filterByCountryValue.toLowerCase() : '') &&
                film.yearReleased >= (this.filterByYearFROM ? this.filterByYearFROM : 1893) &&
                film.yearReleased <= (this.filterByYearTO ? this.filterByYearTO : 9999)
            );
            this.filteredFilmsChanged.next(filtered);
        }
    }

    getFilm(id:number):Film{
        return this.films[id];
    }

    addFilm(f:Film){     
        this.films.push({...f,id:this.getFilms().length});
    }

    setFilms(fs:Film[]){
        this.films = fs;
    }

    updateFilm(i:number, f:Film){
        this.films[i] = f;
    }

    removeFilm(id:number){
        this.films.splice(id,1);
    }

}