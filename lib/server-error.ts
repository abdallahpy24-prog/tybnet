/** Keep request bodies, Prisma query arguments and credentials out of logs. */
export function logServerError(context: string, error: unknown) {
  const code =
    error && typeof error === "object" && "code" in error &&
    typeof error.code === "string" && /^P\d{4}$/.test(error.code)
      ? error.code
      : "UNEXPECTED_ERROR";
  console.error(context, { code });
}
