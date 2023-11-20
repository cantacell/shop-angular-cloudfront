import { Injectable, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from './cart.service';
import { ProductsService } from '../products/products.service';
import { Observable } from 'rxjs';
import { ProductCheckout } from '../products/product.interface';
import { map, switchMap, tap } from 'rxjs/operators';
import { ApiService } from '../core/api.service';
import { NotificationService } from '../core/notification.service';

@Injectable({
  providedIn: 'root',
})
export class CheckoutService extends ApiService {
  constructor(
    protected readonly injector: Injector,
    private readonly cartService: CartService,
    private readonly productsService: ProductsService,
    private notificationService: NotificationService,
    private router: Router
  ) {
    super(injector);
  }

  getProductsForCheckout(): Observable<ProductCheckout[]> {
    return this.cartService.cart$.pipe(
      switchMap((cart) =>
        this.productsService.getProductsForCheckout(Object.keys(cart)).pipe(
          map((products) =>
            products.map((product) => {
              console.log(
                'checking ordered count must be less or equal to availability'
              );
              const orderedCount =
                cart[product.id] <= product.count
                  ? cart[product.id]
                  : product.count;
              return {
                ...product,
                orderedCount,
                totalPrice: +(orderedCount * product.price).toFixed(2),
              };
            })
          )
        )
      )
    );
  }

  cartCheckout(checkout: {
    payment: object;
    delivery: {
      address: string;
      firstName: string;
      lastName: string;
    };
    comments: string;
  }) {
    const userId = localStorage.getItem('userId');
    const url = this.getUrl(
      'cart',
      'api/profile/cart/checkout?userId=' + userId
    );
    return this.http.post<any>(url, checkout).pipe(
      tap((response) => {
        this.cartService.empty();
        this.notificationService.showSuccess('Your order is received!');
        this.router.navigate(['/']);
      })
    );
  }
}
