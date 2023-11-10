import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Account, AuthService } from './auth.service';
import { SpinnerComponent } from 'src/app/shared/spinner/spinner.component';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule, SpinnerComponent],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent {

  
  constructor(private authService:AuthService){}
  
  formUsername:Account = new Account();
  logIn:boolean = true;
  loading:boolean = false;
  error:string | null = null;

  onSubmit(f:NgForm){
    this.loading = true;

    let authObservable = new Observable();

    if(this.logIn){
      authObservable = this.authService.logIn(f.value);
    }else{
      authObservable = this.authService.signUp(f.value);
    }

    authObservable.subscribe({
      next: ()=>{
        this.loading = false;
        this.error = null;
      },
      error: (err)=>{
        console.log(err);
        this.loading = false;
        this.error = err;
      }
    })
  }

  onSwitchMode(){
    this.logIn = !this.logIn;
  }
}
