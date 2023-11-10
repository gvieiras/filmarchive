import {HttpClient} from "@angular/common/http";
import { Injectable } from "@angular/core";
import {Observable, map, tap} from "rxjs";

@Injectable({providedIn:"root"})
export class CountriesAPIService{
 
    baseURL:string = "https://restcountries.com/v3.1/all?fields=cca3,name"
    countries:Country[] = [];
    countriesPromise!:Observable<Country[]>;

    constructor(private http:HttpClient){}

    fetchCountries(){
        return this.countriesPromise = this.http.get<CountryResponseData[]>(this.baseURL).pipe(
            map(countries=>{
                return countries.map(country=>{
                    return new Country(country.cca3, country.name.common);
                });
            }),tap(countries=>{
                countries.sort((a,b)=>{
                    const nameA = a.name.toUpperCase();
                    const nameB = b.name.toUpperCase();
                    if(nameA<nameB)return -1;
                    if(nameA>nameB)return 1;
                    return 0;
                })
                this.countries = countries;
            })
        );
    }

    getCountry(cca3:string):Country | undefined{
        return this.countries.find(el=>el.cca3 == cca3);
    }
}

interface CountryResponseData{
    cca3:string;
    name:{common:string}
}

export class Country{
    constructor(public cca3:string, public name:string){}
}