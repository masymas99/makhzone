import { createInertiaApp } from '@inertiajs/react';

export default function route(name, params = {}, absolute = false) {
    return createInertiaApp().resolveUrl(name, params, absolute);
}
