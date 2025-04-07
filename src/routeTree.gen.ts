/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as ProjectsImport } from './routes/projects'
import { Route as IndexImport } from './routes/index'
import { Route as ProductProductIdImport } from './routes/product/$productId'
import { Route as ProductProductIdIndexImport } from './routes/product/$productId.index'
import { Route as ProductProductIdDocsImport } from './routes/product/$productId.docs'
import { Route as ProductProductIdDocsIndexImport } from './routes/product/$productId.docs/index'

// Create/Update Routes

const ProjectsRoute = ProjectsImport.update({
  id: '/projects',
  path: '/projects',
  getParentRoute: () => rootRoute,
} as any)

const IndexRoute = IndexImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRoute,
} as any)

const ProductProductIdRoute = ProductProductIdImport.update({
  id: '/product/$productId',
  path: '/product/$productId',
  getParentRoute: () => rootRoute,
} as any)

const ProductProductIdIndexRoute = ProductProductIdIndexImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => ProductProductIdRoute,
} as any)

const ProductProductIdDocsRoute = ProductProductIdDocsImport.update({
  id: '/docs',
  path: '/docs',
  getParentRoute: () => ProductProductIdRoute,
} as any)

const ProductProductIdDocsIndexRoute = ProductProductIdDocsIndexImport.update({
  id: '/',
  path: '/',
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
    '/projects': {
      id: '/projects'
      path: '/projects'
      fullPath: '/projects'
      preLoaderRoute: typeof ProjectsImport
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

interface ProductProductIdDocsRouteChildren {
  ProductProductIdDocsIndexRoute: typeof ProductProductIdDocsIndexRoute
}

const ProductProductIdDocsRouteChildren: ProductProductIdDocsRouteChildren = {
  ProductProductIdDocsIndexRoute: ProductProductIdDocsIndexRoute,
}

const ProductProductIdDocsRouteWithChildren =
  ProductProductIdDocsRoute._addFileChildren(ProductProductIdDocsRouteChildren)

interface ProductProductIdRouteChildren {
  ProductProductIdDocsRoute: typeof ProductProductIdDocsRouteWithChildren
  ProductProductIdIndexRoute: typeof ProductProductIdIndexRoute
}

const ProductProductIdRouteChildren: ProductProductIdRouteChildren = {
  ProductProductIdDocsRoute: ProductProductIdDocsRouteWithChildren,
  ProductProductIdIndexRoute: ProductProductIdIndexRoute,
}

const ProductProductIdRouteWithChildren =
  ProductProductIdRoute._addFileChildren(ProductProductIdRouteChildren)

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '/projects': typeof ProjectsRoute
  '/product/$productId': typeof ProductProductIdRouteWithChildren
  '/product/$productId/docs': typeof ProductProductIdDocsRouteWithChildren
  '/product/$productId/': typeof ProductProductIdIndexRoute
  '/product/$productId/docs/': typeof ProductProductIdDocsIndexRoute
}

export interface FileRoutesByTo {
  '/': typeof IndexRoute
  '/projects': typeof ProjectsRoute
  '/product/$productId': typeof ProductProductIdIndexRoute
  '/product/$productId/docs': typeof ProductProductIdDocsIndexRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  '/': typeof IndexRoute
  '/projects': typeof ProjectsRoute
  '/product/$productId': typeof ProductProductIdRouteWithChildren
  '/product/$productId/docs': typeof ProductProductIdDocsRouteWithChildren
  '/product/$productId/': typeof ProductProductIdIndexRoute
  '/product/$productId/docs/': typeof ProductProductIdDocsIndexRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths:
    | '/'
    | '/projects'
    | '/product/$productId'
    | '/product/$productId/docs'
    | '/product/$productId/'
    | '/product/$productId/docs/'
  fileRoutesByTo: FileRoutesByTo
  to: '/' | '/projects' | '/product/$productId' | '/product/$productId/docs'
  id:
    | '__root__'
    | '/'
    | '/projects'
    | '/product/$productId'
    | '/product/$productId/docs'
    | '/product/$productId/'
    | '/product/$productId/docs/'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  ProjectsRoute: typeof ProjectsRoute
  ProductProductIdRoute: typeof ProductProductIdRouteWithChildren
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  ProjectsRoute: ProjectsRoute,
  ProductProductIdRoute: ProductProductIdRouteWithChildren,
}

export const routeTree = rootRoute
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/",
        "/projects",
        "/product/$productId"
      ]
    },
    "/": {
      "filePath": "index.tsx"
    },
    "/projects": {
      "filePath": "projects.tsx"
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
        "/product/$productId/docs/"
      ]
    },
    "/product/$productId/": {
      "filePath": "product/$productId.index.tsx",
      "parent": "/product/$productId"
    },
    "/product/$productId/docs/": {
      "filePath": "product/$productId.docs/index.tsx",
      "parent": "/product/$productId/docs"
    }
  }
}
ROUTE_MANIFEST_END */
