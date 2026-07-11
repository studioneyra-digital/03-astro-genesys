export function isElementVisible(scrollY: number, threshold = 300): boolean {
  return scrollY > threshold;
}
