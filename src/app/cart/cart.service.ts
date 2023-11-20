import { Injectable, Injector } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

import { ApiService } from '../core/api.service';

@Injectable({
  providedIn: 'root',
})
export class CartService extends ApiService {
  /** Key - item id, value - ordered amount */
  #cartSource = new BehaviorSubject<Record<string, number>>({});

  // eslint-disable-next-line @typescript-eslint/member-ordering
  cart$ = this.#cartSource.asObservable();

  // eslint-disable-next-line @typescript-eslint/member-ordering
  totalInCart$: Observable<number> = this.cart$.pipe(
    map((cart) => {
      const values = Object.values(cart);

      if (!values.length) {
        return 0;
      }

      return values.reduce((acc, val) => acc + val, 0);
    }),
    shareReplay({
      refCount: true,
      bufferSize: 1,
    })
  );

  constructor(protected readonly injector: Injector) {
    super(injector);

    // Retrieve the cart or create a new one
    let userId = localStorage.getItem('userId') || '';
    console.log('userId' + userId);
    const url = this.getUrl('cart', 'api/profile/cart?userId=' + userId);
    this.http.get<any>(url).subscribe((response) => {
      console.log('subscribe cart received', response);
      userId = response.data.cart.user_id;
      localStorage.setItem('userId', '' + userId);
      const cart: Record<string, number> = {};
      response.data.cart.items.map(
        (item: any) => (cart[item.product_id] = item.count)
      );
      this.#cartSource.next(cart);
    });
  }

  addItem(id: string): void {
    this.updateCount(id, 'add');
  }

  removeItem(id: string): void {
    this.updateCount(id, 'remove');
  }

  empty(): void {
    this.#cartSource.next({});
  }

  updateCart(newCart: Record<string, number>) {
    const userId = localStorage.getItem('userId') || '';
    const url = this.getUrl('cart', 'api/profile/cart?userId=' + userId);
    const currentCart = newCart;
    const newCartItems: {
      cartItems: Array<{ product_id: string; count: number }>;
    } = {
      cartItems: [],
    };
    Object.entries(currentCart).forEach(([product_id, count]) => {
      newCartItems.cartItems.push({ product_id, count });
    });
    return this.http.put<any>(url, newCartItems);
  }

  private updateCount(id: string, type: 'add' | 'remove'): void {
    const val = this.#cartSource.getValue();
    const newVal = {
      ...val,
    };

    if (!(id in newVal)) {
      newVal[id] = 0;
    }

    if (type === 'add') {
      newVal[id] = ++newVal[id];
    } else if (type === 'remove') {
      if (newVal[id] === 0) {
        console.warn('No match. Skipping...');
        return;
      }

      newVal[id]--;

      if (!newVal[id]) {
        delete newVal[id];
      }

      // this.#cartSource.next(newVal);
    }

    this.updateCart(newVal).subscribe((response) => {
      const cart: Record<string, number> = {};
      response.data.cart.items.map(
        (item: any) => (cart[item.product_id] = item.count)
      );
      this.#cartSource.next(cart);
    });
  }
}
