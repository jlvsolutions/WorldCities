import { ActivatedRouteSnapshot, DetachedRouteHandle, RouteReuseStrategy } from '@angular/router';

export class WCReuseStrategy extends RouteReuseStrategy {

  private savedHandles = new Map<string, DetachedRouteHandle | null>();

  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    return route.data['saveComponent'];
  }

  store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle | null): void {
    const key = this.getRouteKey(route);
    this.savedHandles.set(key, handle);
  }

  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    return this.savedHandles.has(this.getRouteKey(route));
  }
  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    return this.savedHandles.get(this.getRouteKey(route)) ?? null;
  }

  shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    return (future.routeConfig === curr.routeConfig);
  }

  public clearSavedHandle(key: string): void {
    const handle = this.savedHandles.get(key);
    if (handle) {
      (handle as any).componentRef.destroy();
    }

    this.savedHandles.delete(key);
  }

  // Routes are stored as an array of route configs, so we can find any
  // with url property and join them to create the URL for the route.
  private getRouteKey(route: ActivatedRouteSnapshot): string {
    return route.pathFromRoot.filter(u => u.url).map(u => u.url).join('/');
  }
}
