/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    GENERIC_ID: "65f5e3a19468e44338cb336a",
    MARKET_ID: "65103a62a852a61a87d9eb09",
    ELECTRONICS_ID: "65f58b1df491c72246735208",
    AMAZON_ID: "65f58b37f491c72246735209",
    PAYPAL_ID: "65f5e3e69468e44338cb336b",
    PHARMACY_ID: "65f5e4019468e44338cb336c",
    ATM_ID: "65f58c74f491c7224673520c",
    HOME_DELIVERY_ID: "65f58cc8f491c7224673520d",
    BARBER_ID: "65f58cfff491c7224673520e",
    PAYCHECK_ID: "65f58d77f491c72246735210",
    RESTAURANTS_ID: "65f58e0cf491c72246735211",
    SPORTS_ID: "65f58fa9f491c72246735212",
    CLOTHING_ID: "65f5916cf491c72246735213",
    NEXTAUTH_SECRET: "6f28bfbcc56a0990ffba0de4fa0a371a",
  },
  images: {
    domains: ["lh3.googleusercontent.com"],
  },
};

module.exports = nextConfig;
