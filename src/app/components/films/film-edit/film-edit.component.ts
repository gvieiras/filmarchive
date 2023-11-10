import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FilmsService } from '../films.service';
import { Film } from '../film.model';
import { CountriesAPIService, Country } from 'src/app/shared/countries-api.service';
import { BadImageURLPipe } from 'src/app/shared/bad-image-URL.pipe';
import { CustomValidators } from './custom-validators';
import { Subscription, switchMap } from "rxjs";
import { GenresService } from '../genres.service';
import { DatabaseStorageService } from 'src/app/shared/database-storage.service';
import { SpinnerComponent } from 'src/app/shared/spinner/spinner.component';


@Component({
  selector: 'app-film-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule , BadImageURLPipe, SpinnerComponent],
  templateUrl: './film-edit.component.html',
  styleUrls: ['./film-edit.component.css']
})
export class FilmEditComponent implements OnInit, OnDestroy{
  filmForm!:FormGroup;
  isEdit!:boolean;
  filmId!:number;
  countriesSub!: Subscription;
  docId!:string;
  countries!:Country[];
  @ViewChild('transformedUrl')transformedPosterUrl!:ElementRef;
  genres:string[] = [];
  filmGenres:string[] = [];
  loading:boolean = false;

  film?:Film;
  
  constructor
    (private activatedRoute:ActivatedRoute, private countriesAPIService:CountriesAPIService, private router:Router, private customValidators:CustomValidators, private genresService:GenresService, private dbService:DatabaseStorageService){}

  // ngOnInit(): void {
  //   this.genres = this.genresService.allGenres;
  //   this.onFetchCountries();
  //   this.activatedRoute.params.subscribe(params=>{
  //     this.filmId = +params['id'];
  //     // this.isEdit = !Number.isNaN(this.filmId);
  //     this.initForm();
  //   });
  // }

  ngOnInit(): void {
    this.genres = this.genresService.allGenres;
    this.onFetchCountries();

    this.loading = true;
    this.activatedRoute.params.pipe(switchMap(p=>{
      this.filmId = +p['id'];
      return this.dbService.getFilm(+p['id'])
    })
    ).subscribe(f=>{
      this.film = f[0];
      this.initForm();
    })
  }

  onFetchCountries(){
    this.countriesSub = this.countriesAPIService.fetchCountries().subscribe(countries=>{
      this.countries = countries
    });
  }

  ngOnDestroy(): void {
    if(this.countriesSub){
      this.countriesSub.unsubscribe();
    }
  }

  initForm(){
    this.loading = false;
    let filmTitle = '';
    let filmPlot = '';
    let countryIssued = null;
    let yearReleased = 1893;
    let directorName = '';
    let posterImg = '';

    if(this.film){
      filmTitle = this.film.title;
      filmPlot = this.film.plot;
      countryIssued = this.film.countryIssued.cca3;
      yearReleased = this.film.yearReleased;
      directorName = this.film.directorName;
      posterImg = this.film.posterImg;
      this.filmGenres = this.film.genres;
    }
    
    this.filmForm = new FormGroup({
      'title':new FormControl(filmTitle, Validators.required),
      'plot':new FormControl(filmPlot, Validators.required),
      'countryIssued':new FormControl(countryIssued, 
        [Validators.required, this.customValidators.validCountry()]),
      'directorName':new FormControl(directorName, Validators.required),
      'yearReleased':new FormControl(yearReleased, [Validators.required, Validators.min(1893)]),
      'posterImg':new FormControl(posterImg)
    });
  }

  disableForm(disable:boolean){
    for(const field in this.filmForm.controls){
      if(disable){
        this.filmForm.get(field)?.disable();
      }else{
        this.filmForm.get(field)?.enable();
      }
    }
  }

  get yearReleased(){return this.filmForm.get('yearReleased');}
  get title(){return this.filmForm.get('title');}
  get plot(){return this.filmForm.get('plot');}
  get directorName(){return this.filmForm.get('directorName');}
  get countryIssued(){return this.filmForm.get('countryIssued');}

  onSubmit(){
    this.disableForm(true);
    //dont know if this is the best way to do this as getCountry can return unassigned
    //but it'll work for now ;)
    const film:Film = {...this.filmForm.value,
      posterImg:this.transformedPosterUrl.nativeElement.currentSrc,
      genres:this.filmGenres,
      countryIssued:this.countriesAPIService.getCountry(this.filmForm.get('countryIssued')?.value)
    };

    if(this.film){
      film.id = this.filmId;
      film.genres = this.filmGenres;
      this.dbService.updateFilm(this.film!.uid!, film).then(()=>{console.log("film updated:"+this.film?.uid);this.disableForm(false);this.router.navigate(["../"],{relativeTo:this.activatedRoute})})
      .catch(err=>{console.log(err);this.disableForm(false)});
    }else{
      this.dbService.addNewFilm(film).then(()=>{
        this.disableForm(false);
        this.router.navigate(["../"],{relativeTo:this.activatedRoute})
      }).catch(err=>{
        this.disableForm(false);
        console.log(err);
      });
    }
  }

  onGenreClick(genreName:string){
    const genreId = this.filmGenres.findIndex(g=>g===genreName);
    if(genreId !== -1){
      this.filmGenres.splice(genreId,1);
    }else{
      this.filmGenres.push(genreName);
    }
  }

  onClear(){
    this.filmForm.reset();
  }

  onRemove(){
    if(window.confirm("Confirm deletion of '"+this.film?.title+"'")){
      this.disableForm(true);
      this.dbService.removeFilm(this.film?.uid!).then(()=>{
        this.disableForm(false);
        this.router.navigate(["../../"],{relativeTo:this.activatedRoute});
      });
    }
  }
}
