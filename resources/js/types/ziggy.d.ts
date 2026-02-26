import { Config, RouteParam, Router } from 'ziggy-js';

declare global {
    function route(): Router;
    function route(name: string, params?: RouteParam | undefined, absolute?: boolean, config?: Config): string;
}
