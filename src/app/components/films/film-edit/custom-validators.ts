import { Injectable } from "@angular/core";
import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";
import { CountriesAPIService } from "src/app/shared/countries-api.service";

@Injectable({providedIn:'root'})
export class CustomValidators{
    constructor(private countriesAPIService:CountriesAPIService){};

    validCountry():ValidatorFn{
        return(control:AbstractControl):ValidationErrors | null => {
            const country = this.countriesAPIService.getCountry(control.value);
            return country ? null : {invalidCountry:{value:control.value}};
        }
    }
}
