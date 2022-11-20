import { ActivatedRouteSnapshot, DetachedRouteHandle, RouteReuseStrategy } from '@angular/router';

export class WCReuseStrategy extends RouteReuseStrategy {

  private savedHandles = new Map<string, DetachedRouteHandle | null>();
  private doLogging = false;

  constructor() {
    super();
    if (this.doLogging)
      console.log('WCReuseStrategy class instance created.');
  }

  /** determines if this route (and its subtree) the user is leaving should be detached to be reused later */
  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    if (this.doLogging)
      console.log(`WCReuseStrategy shouldDetatch:  returning route.data[savecomponent]=${route.data['saveComponent']}, title=${route.data['title']}`);
    return route.data['saveComponent'];
  }

  /** stores the detached route - if shouldDetach returns true */
  store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle | null): void {
    const key = this.getRouteKey(route);
    if (this.doLogging)
      console.log(`WCReuseStrategy store:  calling savedHandles.set(${key}, handle), handle=${handle}`);
    this.savedHandles.set(key, handle);
  }

  /** determins if this route (and its subtree) the user is navigating to should be reattached */
  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    if (this.doLogging)
      console.log(`WCReuseStrategy shouldAttach:  returning savedHandles.has(${this.getRouteKey(route)}): ${this.savedHandles.has(this.getRouteKey(route))}, title=${route.data['title']}`);
    return this.savedHandles.has(this.getRouteKey(route));
  }

  /** retrieves the previously stored route if shouldAttach returns true */
  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    if (this.doLogging)
      console.log(`WCReuseStrategy retrieve:  returning savedHandles.get(${this.getRouteKey(route) ?? null})`);
      return this.savedHandles.get(this.getRouteKey(route)) ?? null;
  }

  /** determines if a route should be reused */
  shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    if (this.doLogging)
      console.log(`WCReuseStrategy shouldReuseRoute:  returning future=${future.routeConfig?.path} === curr=${curr.routeConfig?.path} = ${((future.routeConfig === curr.routeConfig))}`)
      return (future.routeConfig === curr.routeConfig);
  }

  /** Removes the stored route from the internal map and destroys the component if found */
  public clearSavedHandle(key: string): void {
    if (this.doLogging)
      console.log(`WCReuseStrategy clearSavedHandle:  key=${key}`);

    const handle = this.savedHandles.get(key);
    if (handle) {
      if (this.doLogging)
        console.log(`WCReuseStrategy clearSavedHandle:  destroying handle associated with key=${key} and removing from map.`);
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
