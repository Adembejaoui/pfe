export function getRouteParam(params: any, paramName: string): string | undefined {
    if (!params) return undefined
  
    // Handle string parameter
    if (typeof params[paramName] === "string") {
      return params[paramName] as string
    }
  
    // Handle array parameter (from catch-all routes)
    if (Array.isArray(params[paramName]) && params[paramName].length > 0) {
      return params[paramName][0] as string
    }
  
    return undefined
  }
  