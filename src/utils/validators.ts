export function isBase62(str: string): boolean {
  if (!str || typeof str !== "string") return false;

  const regex = /^[0-9A-Za-z]+$/;

  return regex.test(str);
}
