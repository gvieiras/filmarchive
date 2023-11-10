import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Film } from '../films/film.model';
import { RouterModule } from '@angular/router';
import { SpinnerComponent } from 'src/app/shared/spinner/spinner.component';
import { DatabaseStorageService } from 'src/app/shared/database-storage.service';
import { Subscription } from 'rxjs'
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule, SpinnerComponent],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})
export class LandingComponent implements OnInit, OnDestroy{
  popularFilms:Film[]=[];
  loading:boolean = false;
  filmSub?:Subscription;
  alreadyLogged:boolean = false;

  private auth:AuthService = inject(AuthService);

  constructor(private dbService:DatabaseStorageService){
  };

  ngOnInit(): void {
    this.loading = true;
    this.dbService.getPopularFilms().subscribe(f=>{
      this.popularFilms = f;
      this.loading = false;
    })
    this.alreadyLogged = this.auth.user.value?true:false;
  }

  ngOnDestroy(): void {
    this.filmSub?.unsubscribe();
  }
}
