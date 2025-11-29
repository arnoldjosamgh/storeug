// Mock API Services

const api = {
    // Simulate Google Maps Distance Matrix API
    calculateDistance: (location) => {
        // In a real app, this would call Google Maps API
        // Here we just return the user input as the "calculated" distance
        return parseFloat(location) || 0;
    },

    // Calculate Delivery Cost (700 UGX per km)
    calculateDeliveryCost: (distanceKm) => {
        const RATE_PER_KM = 700;
        return Math.round(distanceKm * RATE_PER_KM);
    },

    // Simulate Payment Processing (MTN/Airtel)
    processPayment: async (provider, phone, amount) => {
        console.log(`Processing ${provider} payment for ${phone}: ${amount} UGX`);

        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate 90% success rate
                if (Math.random() > 0.1) {
                    resolve({
                        success: true,
                        transactionId: "TXN" + Math.floor(Math.random() * 1000000),
                        message: `Payment successful via ${provider}`
                    });
                } else {
                    reject({
                        success: false,
                        message: "Payment failed. Insufficient funds or network error."
                    });
                }
            }, 2000); // 2 second delay
        });
    }
};
