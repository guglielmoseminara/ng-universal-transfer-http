import { ApplicationRef, Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpHeaders, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { TransferState, makeStateKey, StateKey } from '@angular/platform-browser';

import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { first, filter, flatMap, map, tap } from 'rxjs/operators';
import { mergeStatic } from 'rxjs/operators/merge';

import { createHash } from 'create-hash/browser';

/**
 * Response interface
 */
interface TransferHttpResponse {
    body?: any | null;
    headers?: { [k: string]: string[] };
    status?: number;
    statusText?: string;
    url?: string;
}

@Injectable()
export class TransferHttpCacheInterceptor implements HttpInterceptor {
    // private property to store cache activation status
    private _isCacheActive: boolean;
    // private property to store unique id of the key
    private _id: number;

    /**
     * Class constructor
     *
     * @param {ApplicationRef} _appRef
     * @param {TransferState} _transferState
     */
    constructor(private _appRef: ApplicationRef, private _transferState: TransferState) {
        this._isCacheActive = true;
        this._id = 0;

        // Stop using the cache if the application has stabilized, indicating initial rendering is complete.
        of(this._appRef.isStable)
            .pipe(
                first(_ => !!_),
            )
            .subscribe(_ => this._isCacheActive = false);
    }

    /**
     * Interceptor process
     *
     * @param {HttpRequest<any>} req
     * @param {HttpHandler} next
     *
     * @return {Observable<HttpEvent<any>>}
     */
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return of(
            of(this._isCacheActive)
        )
            .pipe(
                flatMap(isCacheActive =>
                    mergeStatic(
                        isCacheActive
                            .pipe(
                                filter(_ => !_),
                                flatMap(_ => next.handle(req))
                            ),
                        isCacheActive
                            .pipe(
                                filter(_ => !!_),
                                flatMap(_ => this._transferStateProcess(req, next))
                            )
                    )
                )
            );
    }

    private _transferStateProcess(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return this._createKey(req)
            .pipe(
                flatMap(storeKey =>
                    of(of(this._transferState.hasKey(storeKey)))
                        .pipe(
                            flatMap(hasKey =>
                                mergeStatic(
                                    this._hasKeyProcess(hasKey, storeKey),
                                    this._hasNotKeyProcess(req, next, hasKey, storeKey)
                                )
                            )
                        )
                ),
            );
    }

    /**
     * Creates transfer state key's store
     *
     * @param {HttpRequest<any>} req
     *
     * @returns {Observable<StateKey<TransferHttpResponse>>}
     *
     * @private
     */
    private _createKey(req: HttpRequest<any>): Observable<StateKey<TransferHttpResponse>> {
        this._id++;

        return of(this._id)
            .pipe(
                map(id => createHash('sha256').update(`${JSON.stringify(req)}_${id}`).digest('hex')),
                map(key => makeStateKey<TransferHttpResponse>(key))
            );
    }

    /**
     * Process when key exists in transfer state
     *
     * @param {Observable<boolean>} hasKey
     * @param {StateKey<TransferHttpResponse>} storeKey
     *
     * @returns {Observable<HttpEvent<any>>}
     *
     * @private
     */
    private _hasKeyProcess(hasKey: Observable<boolean>, storeKey: StateKey<TransferHttpResponse>): Observable<HttpEvent<any>> {
        return hasKey
            .pipe(
                filter(_ => !!_),
                map(_ => this._transferState.get(storeKey, {} as TransferHttpResponse)),
                map((response: TransferHttpResponse) => new HttpResponse<any>({
                    body: response.body,
                    headers: new HttpHeaders(response.headers),
                    status: response.status,
                    statusText: response.statusText,
                    url: response.url,
                }))
            );
    }

    /**
     * Process when key doesn't exist in transfer state
     *
     * @param {HttpRequest<any>} req
     * @param {HttpHandler} next
     * @param {Observable<boolean>} hasKey
     * @param {StateKey<TransferHttpResponse>} storeKey
     *
     * @returns {Observable<HttpEvent<any>>}
     *
     * @private
     */
    private _hasNotKeyProcess(req: HttpRequest<any>,
                              next: HttpHandler,
                              hasKey: Observable<boolean>,
                              storeKey: StateKey<TransferHttpResponse>): Observable<HttpEvent<any>> {
        return hasKey
            .pipe(
                filter(_ => !_),
                flatMap(_ =>
                    next.handle(req)
                        .pipe(
                            tap((event: HttpEvent<any>) =>
                                of(event)
                                    .pipe(
                                        filter(evt => evt instanceof HttpResponse),
                                        tap((evt: HttpResponse<any>) => this._transferState.set(storeKey, {
                                            body: evt.body,
                                            headers: this._getHeadersMap(evt.headers),
                                            status: evt.status,
                                            statusText: evt.statusText,
                                            url: evt.url!,
                                        }))
                                    )
                            )
                        )
                )
            )
    }

    /**
     * Creates Headers Map
     *
     * @param {HttpHeaders} headers
     *
     * @return {{[name: string]: string[]}}
     *
     * @private
     */
    private _getHeadersMap(headers: HttpHeaders): { [name: string]: string[] } {
        return headers.keys().reduce((acc, curr) => Object.assign(acc, { [curr]: headers.getAll(curr)! }), {});
    }
}
