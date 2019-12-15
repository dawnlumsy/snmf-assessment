import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.css']
})
export class CarouselComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }
  
  images = [1, 2, 3, 4].map((n) => `https://dawn123.sgp1.digitaloceanspaces.com/boutique/${n}.jpg`);

}
