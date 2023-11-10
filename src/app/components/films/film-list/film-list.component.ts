import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Film } from '../film.model';
import { RouterLink } from '@angular/router';
import { Observable, Subscription, mergeMap, switchMap, tap } from 'rxjs';
import { DatabaseStorageService } from 'src/app/shared/database-storage.service';
import { SpinnerComponent } from 'src/app/shared/spinner/spinner.component';

@Component({
  selector: 'app-film-list',
  standalone: true,
  imports: [CommonModule, RouterLink, SpinnerComponent],
  templateUrl: './film-list.component.html',
  styleUrls: ['./film-list.component.css']
})
export class FilmListComponent implements OnInit, OnDestroy{
  films!:Observable<Film[]>;
  filmsLength:number = 0;
  filmListMin:number = 0;
  filmListMax:number = 12;
  page:number = 1;
  loading:boolean = false;
  
  filmsSubscription = new Subscription;
  numberOfFilmsSubscription = new Subscription;
  queryExistsSubscription = new Subscription;

  disablePagination:boolean = false;
  
  constructor(private dbService:DatabaseStorageService){}

  // ngOnInit(): void {
  //   this.loading = true;
  //   this.dbService.getTotalNumberOfFilms().then(f=>{this.filmsLength = f;this.loading = false});
  //   this.dbService.filmsSubj.subscribe(o=>{this.films = o});
  //   this.dbService.getFilms();
  //   this.films.subscribe(()=>this.loading = false);
  // }

  ngOnInit(): void {
    this.loading = true;

    this.numberOfFilmsSubscription = this.dbService.numberOfFilms.subscribe(nof=>{this.filmsLength=nof});

    this.queryExistsSubscription = this.dbService.queryExists.subscribe(qe=>{this.disablePagination = qe});

    this.filmsSubscription = this.dbService.filmsSubj.pipe(
      mergeMap((f)=>this.films = f),
    ).subscribe(()=>this.loading = false);
    this.dbService.getFilms();
  }

  ngOnDestroy(): void {
    this.filmsSubscription.unsubscribe();
    this.numberOfFilmsSubscription.unsubscribe();
    this.queryExistsSubscription.unsubscribe();
  }

  onChangePage(operation:string){
    if(operation === "next"){
      this.onChangePagination(this.page+1);
    }else{
      this.onChangePagination(this.page-1);
    }
  }

  onChangePagination(pageNumber:number){
    this.loading = true;
    this.filmListMin = 12*(pageNumber-1);
    this.filmListMax = 12*pageNumber;
    this.page = pageNumber;
    this.dbService.getFilms(this.filmListMin);
  }

  get paginationLinks(){return Array(Math.ceil(this.filmsLength/12))}
  get totalFilmsShown(){return this.filmListMax>=this.filmsLength}
}
