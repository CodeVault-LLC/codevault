/* prettier-ignore-start */

/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file is auto-generated by TanStack Router

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as IndexImport } from './routes/index'
import { Route as ProductProductIdImport } from './routes/product/$productId'
import { Route as ProductProductIdIndexImport } from './routes/product/$productId.index'
import { Route as ProductProductIdDocsImport } from './routes/product/$productId.docs'
import { Route as ProductProductIdDocsIndexImport } from './routes/product/$productId.docs/index'
import { Route as ProductProductIdDocsReleasesImport } from './routes/product/$productId.docs/releases'

// Create/Update Routes

const IndexRoute = IndexImport.update({
  path: '/',
  getParentRoute: () => rootRoute,
} as any)

const ProductProductIdRoute = ProductProductIdImport.update({
  path: '/product/$productId',
  getParentRoute: () => rootRoute,
} as any)

const ProductProductIdIndexRoute = ProductProductIdIndexImport.update({
  path: '/',
  getParentRoute: () => ProductProductIdRoute,
} as any)

const ProductProductIdDocsRoute = ProductProductIdDocsImport.update({
  path: '/docs',
  getParentRoute: () => ProductProductIdRoute,
} as any)

const ProductProductIdDocsIndexRoute = ProductProductIdDocsIndexImport.update({
  path: '/',
  getParentRoute: () => ProductProductIdDocsRoute,
} as any)

const ProductProductIdDocsReleasesRoute =
  ProductProductIdDocsReleasesImport.update({
    path: '/releases',
    getParentRoute: () => ProductProductIdDocsRoute,
  } as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexImport
      parentRoute: typeof rootRoute
    }
    '/product/$productId': {
      id: '/product/$productId'
      path: '/product/$productId'
      fullPath: '/product/$productId'
      preLoaderRoute: typeof ProductProductIdImport
      parentRoute: typeof rootRoute
    }
    '/product/$productId/docs': {
      id: '/product/$productId/docs'
      path: '/docs'
      fullPath: '/product/$productId/docs'
      preLoaderRoute: typeof ProductProductIdDocsImport
      parentRoute: typeof ProductProductIdImport
    }
    '/product/$productId/': {
      id: '/product/$productId/'
      path: '/'
      fullPath: '/product/$productId/'
      preLoaderRoute: typeof ProductProductIdIndexImport
      parentRoute: typeof ProductProductIdImport
    }
    '/product/$productId/docs/releases': {
      id: '/product/$productId/docs/releases'
      path: '/releases'
      fullPath: '/product/$productId/docs/releases'
      preLoaderRoute: typeof ProductProductIdDocsReleasesImport
      parentRoute: typeof ProductProductIdDocsImport
    }
    '/product/$productId/docs/': {
      id: '/product/$productId/docs/'
      path: '/'
      fullPath: '/product/$productId/docs/'
      preLoaderRoute: typeof ProductProductIdDocsIndexImport
      parentRoute: typeof ProductProductIdDocsImport
    }
  }
}

// Create and export the route tree

export const routeTree = rootRoute.addChildren({
  IndexRoute,
  ProductProductIdRoute: ProductProductIdRoute.addChildren({
    ProductProductIdDocsRoute: ProductProductIdDocsRoute.addChildren({
      ProductProductIdDocsReleasesRoute,
      ProductProductIdDocsIndexRoute,
    }),
    ProductProductIdIndexRoute,
  }),
})

/* prettier-ignore-end */

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/",
        "/product/$productId"
      ]
    },
    "/": {
      "filePath": "index.tsx"
    },
    "/product/$productId": {
      "filePath": "product/$productId.tsx",
      "children": [
        "/product/$productId/docs",
        "/product/$productId/"
      ]
    },
    "/product/$productId/docs": {
      "filePath": "product/$productId.docs.tsx",
      "parent": "/product/$productId",
      "children": [
        "/product/$productId/docs/releases",
        "/product/$productId/docs/"
      ]
    },
    "/product/$productId/": {
      "filePath": "product/$productId.index.tsx",
      "parent": "/product/$productId"
    },
    "/product/$productId/docs/releases": {
      "filePath": "product/$productId.docs/releases.tsx",
      "parent": "/product/$productId/docs"
    },
    "/product/$productId/docs/": {
      "filePath": "product/$productId.docs/index.tsx",
      "parent": "/product/$productId/docs"
    }
  }
}
ROUTE_MANIFEST_END */
