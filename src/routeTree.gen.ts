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
import { Route as ProjectProjectIdImport } from './routes/project/$projectId'
import { Route as ProjectProjectIdIndexImport } from './routes/project/$projectId.index'
import { Route as ProjectProjectIdDocsImport } from './routes/project/$projectId.docs'
import { Route as ProjectProjectIdDocsBranchSplatIndexImport } from './routes/project/$projectId.docs/$branch.$/index'

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

const ProjectProjectIdRoute = ProjectProjectIdImport.update({
  id: '/project/$projectId',
  path: '/project/$projectId',
  getParentRoute: () => rootRoute,
} as any)

const ProjectProjectIdIndexRoute = ProjectProjectIdIndexImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => ProjectProjectIdRoute,
} as any)

const ProjectProjectIdDocsRoute = ProjectProjectIdDocsImport.update({
  id: '/docs',
  path: '/docs',
  getParentRoute: () => ProjectProjectIdRoute,
} as any)

const ProjectProjectIdDocsBranchSplatIndexRoute =
  ProjectProjectIdDocsBranchSplatIndexImport.update({
    id: '/$branch/$/',
    path: '/$branch/$/',
    getParentRoute: () => ProjectProjectIdDocsRoute,
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
    '/project/$projectId': {
      id: '/project/$projectId'
      path: '/project/$projectId'
      fullPath: '/project/$projectId'
      preLoaderRoute: typeof ProjectProjectIdImport
      parentRoute: typeof rootRoute
    }
    '/project/$projectId/docs': {
      id: '/project/$projectId/docs'
      path: '/docs'
      fullPath: '/project/$projectId/docs'
      preLoaderRoute: typeof ProjectProjectIdDocsImport
      parentRoute: typeof ProjectProjectIdImport
    }
    '/project/$projectId/': {
      id: '/project/$projectId/'
      path: '/'
      fullPath: '/project/$projectId/'
      preLoaderRoute: typeof ProjectProjectIdIndexImport
      parentRoute: typeof ProjectProjectIdImport
    }
    '/project/$projectId/docs/$branch/$/': {
      id: '/project/$projectId/docs/$branch/$/'
      path: '/$branch/$'
      fullPath: '/project/$projectId/docs/$branch/$'
      preLoaderRoute: typeof ProjectProjectIdDocsBranchSplatIndexImport
      parentRoute: typeof ProjectProjectIdDocsImport
    }
  }
}

// Create and export the route tree

interface ProjectProjectIdDocsRouteChildren {
  ProjectProjectIdDocsBranchSplatIndexRoute: typeof ProjectProjectIdDocsBranchSplatIndexRoute
}

const ProjectProjectIdDocsRouteChildren: ProjectProjectIdDocsRouteChildren = {
  ProjectProjectIdDocsBranchSplatIndexRoute:
    ProjectProjectIdDocsBranchSplatIndexRoute,
}

const ProjectProjectIdDocsRouteWithChildren =
  ProjectProjectIdDocsRoute._addFileChildren(ProjectProjectIdDocsRouteChildren)

interface ProjectProjectIdRouteChildren {
  ProjectProjectIdDocsRoute: typeof ProjectProjectIdDocsRouteWithChildren
  ProjectProjectIdIndexRoute: typeof ProjectProjectIdIndexRoute
}

const ProjectProjectIdRouteChildren: ProjectProjectIdRouteChildren = {
  ProjectProjectIdDocsRoute: ProjectProjectIdDocsRouteWithChildren,
  ProjectProjectIdIndexRoute: ProjectProjectIdIndexRoute,
}

const ProjectProjectIdRouteWithChildren =
  ProjectProjectIdRoute._addFileChildren(ProjectProjectIdRouteChildren)

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '/projects': typeof ProjectsRoute
  '/project/$projectId': typeof ProjectProjectIdRouteWithChildren
  '/project/$projectId/docs': typeof ProjectProjectIdDocsRouteWithChildren
  '/project/$projectId/': typeof ProjectProjectIdIndexRoute
  '/project/$projectId/docs/$branch/$': typeof ProjectProjectIdDocsBranchSplatIndexRoute
}

export interface FileRoutesByTo {
  '/': typeof IndexRoute
  '/projects': typeof ProjectsRoute
  '/project/$projectId/docs': typeof ProjectProjectIdDocsRouteWithChildren
  '/project/$projectId': typeof ProjectProjectIdIndexRoute
  '/project/$projectId/docs/$branch/$': typeof ProjectProjectIdDocsBranchSplatIndexRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  '/': typeof IndexRoute
  '/projects': typeof ProjectsRoute
  '/project/$projectId': typeof ProjectProjectIdRouteWithChildren
  '/project/$projectId/docs': typeof ProjectProjectIdDocsRouteWithChildren
  '/project/$projectId/': typeof ProjectProjectIdIndexRoute
  '/project/$projectId/docs/$branch/$/': typeof ProjectProjectIdDocsBranchSplatIndexRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths:
    | '/'
    | '/projects'
    | '/project/$projectId'
    | '/project/$projectId/docs'
    | '/project/$projectId/'
    | '/project/$projectId/docs/$branch/$'
  fileRoutesByTo: FileRoutesByTo
  to:
    | '/'
    | '/projects'
    | '/project/$projectId/docs'
    | '/project/$projectId'
    | '/project/$projectId/docs/$branch/$'
  id:
    | '__root__'
    | '/'
    | '/projects'
    | '/project/$projectId'
    | '/project/$projectId/docs'
    | '/project/$projectId/'
    | '/project/$projectId/docs/$branch/$/'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  ProjectsRoute: typeof ProjectsRoute
  ProjectProjectIdRoute: typeof ProjectProjectIdRouteWithChildren
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  ProjectsRoute: ProjectsRoute,
  ProjectProjectIdRoute: ProjectProjectIdRouteWithChildren,
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
        "/project/$projectId"
      ]
    },
    "/": {
      "filePath": "index.tsx"
    },
    "/projects": {
      "filePath": "projects.tsx"
    },
    "/project/$projectId": {
      "filePath": "project/$projectId.tsx",
      "children": [
        "/project/$projectId/docs",
        "/project/$projectId/"
      ]
    },
    "/project/$projectId/docs": {
      "filePath": "project/$projectId.docs.tsx",
      "parent": "/project/$projectId",
      "children": [
        "/project/$projectId/docs/$branch/$/"
      ]
    },
    "/project/$projectId/": {
      "filePath": "project/$projectId.index.tsx",
      "parent": "/project/$projectId"
    },
    "/project/$projectId/docs/$branch/$/": {
      "filePath": "project/$projectId.docs/$branch.$/index.tsx",
      "parent": "/project/$projectId/docs"
    }
  }
}
ROUTE_MANIFEST_END */
