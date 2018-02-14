<img src="http://bit.ly/2mxmKKI" width="500" alt="Hapiness" />

<div style="margin-bottom:20px;">
<div style="line-height:60px">
    <a href="https://travis-ci.org/hapinessjs/ng-universal-transfer-http.svg?branch=master">
        <img src="https://travis-ci.org/hapinessjs/ng-universal-transfer-http.svg?branch=master" alt="build" />
    </a>
    <a href="https://david-dm.org/hapinessjs/ng-universal-transfer-http">
        <img src="https://david-dm.org/hapinessjs/ng-universal-transfer-http.svg" alt="dependencies" />
    </a>
    <a href="https://david-dm.org/hapinessjs/ng-universal-transfer-http?type=dev">
        <img src="https://david-dm.org/hapinessjs/ng-universal-transfer-http/dev-status.svg" alt="devDependencies" />
    </a>
</div>
<div>
    <a href="https://www.typescriptlang.org/docs/tutorial.html">
        <img src="https://cdn-images-1.medium.com/max/800/1*8lKzkDJVWuVbqumysxMRYw.png"
             align="right" alt="Typescript logo" width="50" height="50" style="border:none;" />
    </a>
    <a href="http://reactivex.io/rxjs">
        <img src="http://reactivex.io/assets/Rx_Logo_S.png"
             align="right" alt="ReactiveX logo" width="50" height="50" style="border:none;" />
    </a>
    <a href="https://www.angular.io">
            <img src="https://angular.io/assets/images/logos/angular/angular.svg"
                 align="right" alt="Angular logo" width="75" style="border:none; margin-top:-5px;" />
        </a>
</div>
</div>

# NG-Universal Transfer HTTP Cache Module

This module is an enhancement of original [`TransferHttpCacheModule`](https://github.com/angular/universal/blob/master/modules/common) from `Angular Universal` team. He allows to cache all type of requests and not just `GET` and/or `HEAD`.

It's written in full `Observable` with `lettable` versions.

## Installation

```bash
$ yarn add @hapiness/ng-universal-transfer-http

or

$ npm install --save @hapiness/ng-universal-transfer-http
```

## Usage

`TransferHttpCacheModule` installs a Http interceptor that avoids duplicate `HttpClient` requests on the client, for requests that were already made when the application was rendered on the server side.

When the module is installed in the application `NgModule`, it will intercept `HttpClient` requests on the server and store the response in the `TransferState` key-value store. This is transferred to the client, which then uses it to respond to the same `HttpClient` requests on the client.

To use the `TransferHttpCacheModule` just install it as part of the top-level App module.

### src/app/app.module.ts:

```typescript
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { TransferHttpCacheModule } from '@hapiness/ng-universal-transfer-http';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    // Add .withServerTransition() to support Universal rendering.
    // The application ID can be any identifier which is unique on
    // the page.
    BrowserModule.withServerTransition({ appId: 'ng-universal-example' }),
    // Add TransferHttpCacheModule to install a Http interceptor
    TransferHttpCacheModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
```

### src/app/app.server.module.ts:

```typescript
import { NgModule } from '@angular/core';
import { ServerModule, ServerTransferStateModule } from '@angular/platform-server';
import { ModuleMapLoaderModule } from '@nguniversal/module-map-ngfactory-loader';

import { AppModule } from './app.module';
import { AppComponent } from './app.component';

@NgModule({
  imports: [
    // The AppServerModule should import your AppModule followed
    // by the ServerModule from @angular/platform-server.
    AppModule,
    ServerModule,
    ModuleMapLoaderModule,
    ServerTransferStateModule
  ],
  // Since the bootstrapped component is not inherited from your
  // imported AppModule, it needs to be repeated here.
  bootstrap: [AppComponent]
})
export class AppServerModule {
}
```

### src/main.ts:

```typescript
import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

document.addEventListener('DOMContentLoaded', () => {
  platformBrowserDynamic().bootstrapModule(AppModule)
    .catch(err => console.log(err));
});
```

## Development mode compatibility

If you want to have `TransferHttpCacheModule` installed and compatible with `development` mode, you must to declare it like this:

```typescript
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { TransferHttpCacheModule } from '@hapiness/ng-universal-transfer-http';
import { environment } from '../environments/environment';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    // Add .withServerTransition() to support Universal rendering.
    // The application ID can be any identifier which is unique on
    // the page.
    BrowserModule.withServerTransition({ appId: 'ng-universal-example' }),
    // Add TransferHttpCacheModule to install a Http interceptor and activate it only for production mode
    TransferHttpCacheModule.withConfig({prodMode: environment.production})
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
```

Now, when you launch your application with `ng serve` all will work fine.


## Skip scheme for storage's key

Sometimes, when you're in `server` side rendering, you're in **internal environment** and calls have not the same scheme (`https` for client calls and `http`for server calls) so when you come back in `browser`, request are not cached if you don't skip the scheme in storage's key generation.

To solve it, we add an option and you must to declare it like this:

```typescript
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { TransferHttpCacheModule } from '@hapiness/ng-universal-transfer-http';
import { environment } from '../environments/environment';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    // Add .withServerTransition() to support Universal rendering.
    // The application ID can be any identifier which is unique on
    // the page.
    BrowserModule.withServerTransition({ appId: 'ng-universal-example' }),
    // Add TransferHttpCacheModule to install a Http interceptor and skip scheme in storage's key generation
    TransferHttpCacheModule.withConfig({skipUrlSchemeWhenCaching: true})
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
```

This option is compatible with `prodMode` option.

## Change History
* v6.0.0 (2018-02-14)
    * `Angular v5.2.5+`
    * Latest packages' versions
    * Change module `static` method from `enableOnProdMode` to `withConfig` and add `TransferHttpCacheConfig` parameter
    * Documentation
* v5.2.3 (2018-02-01)
    * `Angular v5.2.3+`
    * Latest packages' versions
    * Fix `circular JSON` stringify 
* v5.2.2 (2018-01-29)
    * `Angular v5.2.2+`
    * Latest packages' versions
* v5.2.1 (2017-12-20)
    * `Angular v5.1.1+`
    * Fix to handle `HttpErrorResponse`
    * Documentation
* v5.2.0 (2017-12-12)
    * `Angular v5.1.0+`
    * `RxJS v5.5.5+`
    * Documentation
* v5.1.2 (2017-12-05)
    * `Angular v5.0.5+`
    * `RxJS v5.5.3+`
    * Documentation
* v5.1.1 (2017-12-01)
    * `Angular v5.0.4+`
    * Documentation
* v5.1.0 (2017-11-18)
    * `Angular v5.0.2+`
    * Development mode compatibility with `enableOnProdMode()` function 
    * Documentation
* v5.0.0 (2017-11-13)
    * `Angular v5.0.0+`
    * Publish all features of the module
    * Lettable operators for `RxJS` 
    * Documentation

[Back to top](#installation)

## Maintainers

<table>
    <tr>
        <td colspan="5" align="center"><a href="https://www.tadaweb.com"><img src="http://bit.ly/2xHQkTi" width="117" alt="tadaweb" /></a></td>
    </tr>
    <tr>
        <td align="center"><a href="https://github.com/Juneil"><img src="https://avatars3.githubusercontent.com/u/6546204?v=3&s=117" width="117"/></a></td>
        <td align="center"><a href="https://github.com/antoinegomez"><img src="https://avatars3.githubusercontent.com/u/997028?v=3&s=117" width="117"/></a></td>
        <td align="center"><a href="https://github.com/reptilbud"><img src="https://avatars3.githubusercontent.com/u/6841511?v=3&s=117" width="117"/></a></td>
        <td align="center"><a href="https://github.com/njl07"><img src="https://avatars3.githubusercontent.com/u/1673977?v=3&s=117" width="117"/></a></td>
    </tr>
    <tr>
        <td align="center"><a href="https://github.com/Juneil">Julien Fauville</a></td>
        <td align="center"><a href="https://github.com/antoinegomez">Antoine Gomez</a></td>
        <td align="center"><a href="https://github.com/reptilbud">Sébastien Ritz</a></td>
        <td align="center"><a href="https://github.com/njl07">Nicolas Jessel</a></td>
    </tr>
</table>

[Back to top](#installation)

## License

Copyright (c) 2018 **Hapiness** Licensed under the [MIT license](https://github.com/hapinessjs/hapiness/blob/master/LICENSE.md).

[Back to top](#installation)
