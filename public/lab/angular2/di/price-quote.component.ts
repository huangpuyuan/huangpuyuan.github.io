import {Component, EventEmitter, OnDestroy, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-price-quote',
  templateUrl: './price-quote.component.html',
  styleUrls: ['./price-quote.component.css']
})
export class PriceQuoteComponent implements OnInit, OnDestroy {
  stockCode: string = "IBM";
  price: number;

  @Output('priceChange')
  lastPrice: EventEmitter<PriceQuote> = new EventEmitter();

  @Output('buyIt')
  buy: EventEmitter<PriceQuote> = new EventEmitter();

  private isIntervalStop: boolean = false;

  private myInterval;

  start() {
    this.myInterval = setInterval(() => {
      let priceQuote: PriceQuote = new PriceQuote(this.stockCode, 100 * Math.random());
      this.price = priceQuote.lastPrice;
      this.lastPrice.emit(priceQuote);
    }, 1000);
  }

  constructor() {
    this.start();
  }

  taggleIt() {
    if (!this.isIntervalStop) {
      clearInterval(this.myInterval);
      this.isIntervalStop = true;
    } else {
      this.start();
      this.isIntervalStop = false;
    }
  }

  ngOnInit() {
  }

  buyStock(event) {
    this.buy.emit(new PriceQuote(this.stockCode, this.price));
  }

  ngOnDestroy() {
    clearInterval(this.myInterval);
    this.isIntervalStop = true;
  }
}


export class PriceQuote {
  constructor(public stockCode: string,
              public lastPrice: number) {

  }
}
