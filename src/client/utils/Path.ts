export default class PathUtils {
  public static getBaseUrl() {
    const { origin, pathname } = window.location;
    return `${origin}${pathname === '/' ? '' : pathname}`;
  }

  public static buildThumbnailUrl(path: string, filename: string, queries?: { [key: string]: string }) {
    return '/thumbnails/' + this.buildUrl(path, filename, queries);
  }

  public static buildImageUrl(path: string, filename: string, queries?: { [key: string]: string }) {
    return '/images/' + this.buildUrl(path, filename, queries);
  }

  private static buildUrl(path: string, filename: string, queries?: { [key: string]: string }) {
    const queryString = queries ? '?' +
      Object.keys(queries).map((key) => `${key}=${encodeURIComponent(queries[key])}`).join('&') :
      '';
    return (path === '/' ? '' : encodeURIComponent( (path as string).substr(1)) + '/') +
      encodeURIComponent(filename) + queryString;
  }
}
