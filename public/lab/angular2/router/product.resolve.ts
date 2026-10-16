import {ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot} from "@angular/router";
import {Product} from "../product/product.component";
import {Observable} from "rxjs/Observable";
import {Injectable} from "@angular/core";
/**
 * Created by Kaitai on 2017/4/16.
 */

@Injectable()
export class ProductResolve implements Resolve<Product> {
  constructor(private router: Router) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Product> | Promise<Product> | Product {
    let productId: number = route.params["id"];
    if (productId == 1) {
      return new Product(1, "iPhone7");
    } else {
      // return new Product(2, "iPhone3213");
      this.router.navigate(['/home']);
      return undefined;
    }
  }

}
