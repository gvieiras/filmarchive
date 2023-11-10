import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subscription, combineLatest, exhaustMap, map,  mergeMap,  switchMap } from 'rxjs';
import { Film } from '../film.model';
import { AddCommaPipe } from 'src/app/shared/add-comma.pipe';
import { DatabaseStorageService } from 'src/app/shared/database-storage.service';
import { SpinnerComponent } from 'src/app/shared/spinner/spinner.component';
import { AuthService, User } from '../../auth/auth.service';

@Component({
  selector: 'app-film-details',
  standalone: true,
  imports: [CommonModule, RouterModule, AddCommaPipe, SpinnerComponent],
  templateUrl: './film-details.component.html',
  styleUrls: ['./film-details.component.css']
})
export class FilmDetailsComponent implements OnInit, OnDestroy{
  routeSub?:Subscription;
  filmSub?:Subscription;
  thisFilm!:Film;
  loading:boolean = false;
  user?:User|null;
  authSub?:Subscription;
  filmRatingMedian:number | string = '?';
  savingRating:boolean = false;
  selectedScore?:number;
  obsSub?:Subscription;

  constructor(private route:ActivatedRoute, private router:Router, private dbService:DatabaseStorageService, private authService:AuthService){}

  ngOnInit(): void {
    this.loading = true;
    this.obsSub = combineLatest([
      this.authService.user,
      this.route.params,
    ]).pipe(map(([user,params])=>{
      this.user = user;
      return +params['id'];
    }),exhaustMap(fid=>this.dbService.getFilm(fid))).subscribe(f=>{
      if(f.length === 0){
        this.loading = false;
        this.router.navigate(['/notfound']);
      }else{
        this.loading = false;
        this.thisFilm = f[0];
        this.filmRatingMedian = this.thisFilm.medianScore ? this.thisFilm.medianScore : '?';
        
        if(!this.user || !this.user.films){return;}
        const ratedFilmId = this.user.films.findIndex(f=>f.filmUid === this.thisFilm.uid);
        
        if(ratedFilmId !== -1){
          this.selectedScore = this.user.films[ratedFilmId!].score;
        }
      }
    })
  }

  ngOnDestroy(): void {
    if(this.obsSub){
      this.obsSub.unsubscribe();
    }
  }

  onFilmEdit(){
    if(!this.user || !this.user.admin){
      window.confirm("Only admins can edit entries.");
      return;
    }
    this.router.navigate(['edit'],{relativeTo:this.route});
  }

  onSaveRating(score:number){
    if(!this.user || !this.thisFilm){
      return;
    }
    this.savingRating = true;
    this.dbService.rateFilm(this.user!.id!,this.thisFilm.uid!, score).then(()=>{
      if(score === -1){
        this.selectedScore = undefined;
      }else{
        this.selectedScore = score;
      }
      this.savingRating = false;
    });
  }
}
