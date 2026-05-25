// Allow importing .css files without TypeScript errors.
// Next.js handles CSS imports natively at build time.
declare module "*.css" {
  const content: string;
  export default content;
}