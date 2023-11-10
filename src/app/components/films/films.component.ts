import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilmListComponent } from './film-list/film-list.component';
import { RouterModule } from '@angular/router';
import { DatabaseStorageService } from 'src/app/shared/database-storage.service';

@Component({
  selector: 'app-films',
  standalone: true,
  imports: [CommonModule, FilmListComponent, RouterModule],
  templateUrl: './films.component.html',
  styleUrls: ['./films.component.css']
})
export class FilmsComponent {
  constructor(private dbService:DatabaseStorageService){}

  private filterParams:{id:string,value:string}[] = [];

  get isThereParameters(){return this.filterParams.length>0};
  get isYearParam(){return Boolean(this.filterParams.findIndex(f=>f.id === "filterByYearFROM") !== -1) || Boolean(this.filterParams.findIndex(f=>f.id === "filterByYearTO") !== -1)};
  get isCountryParam(){return Boolean(this.filterParams.findIndex(f=>f.id === "filterByCountry") !== -1)};
  get isDirectorParam(){return Boolean(this.filterParams.findIndex(f=>f.id === "filterByDirector") !== -1)}

  onFilterParameter(filter:HTMLInputElement){
    const fid = this.filterParams.findIndex(f=>f.id === filter.id);
    if(fid !== -1){
      if(filter.value === ''){
        this.filterParams.splice(fid,1);
      }else{
        this.filterParams[fid] = {id:filter.id,value:filter.value};
      }
    }else{
      this.filterParams.push({id:filter.id,value:filter.value});
    }
    
    this.dbService.changeFilter(this.filterParams.slice());
  }
}
