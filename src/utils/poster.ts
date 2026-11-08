/**
 * OMDb posters are capped at 380px wide, too soft for a full-bleed hero. They are served by a
 * resizing CDN, so the size segment of the URL can be rewritten. URLs that don't match are returned
 * untouched, which degrades to the original poster rather than a broken image.
 */
export const posterUrlForWidth = (url: string, width: number): string => {
  return url.replace(/_V1_.*\.jpg$/, `_V1_QL75_UX${width}_.jpg`);
};
