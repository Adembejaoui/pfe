/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      unoptimized: true,
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'xou955y8kd.ufs.sh',
        },
          {
            protocol: 'https',
            hostname: 'ddragon.leagueoflegends.com',
            pathname: '**',
          },
        ],
        
    },
  };
  
  export default nextConfig;