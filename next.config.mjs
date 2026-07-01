/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Supabase Storage images
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**"
      },

      // Vercel Blob images - optional if used later
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com"
      }
    ]
  }
};

export default nextConfig;