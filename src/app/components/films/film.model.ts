import { Country } from "src/app/shared/countries-api.service";

export class Film{
    constructor(
        public title:string, 
        public yearReleased:number,
        public countryIssued:Country,
        public directorName:string,
        public posterImg:string, 
        public plot:string,
        public genres:string[],

        public numberOfRatings:number,
        public wholeScore:number,
        public medianScore:number,

        public id:number,
        public uid?:string,

    ){}
}