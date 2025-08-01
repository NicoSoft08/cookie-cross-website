const api_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000'

export const paymentService = {
    // Créer un nouveau paiement
    // POST /api/payments/initiate
    initiatePayment: async (token, storeId, planId) => {
        const response = await fetch(`${api_URL}/api/payments/initiate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ storeId, planId })
        });

        if (!response.ok) {
            throw new Error('Failed to initiate payment');
        }

        const data = await response.json();
        console.log(data)
        return data;
    },
    // Récupérer un paiement par ID
    // GET /api/payments/:id
    getPaymentById: async (token, paymentId) => {
        const response = await fetch(`${api_URL}/api/payments/${paymentId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch payment');
        }

        const data = await response.json();
        console.log(data)
        return data;
    },
    // Confirmer un paiement
    // POST /api/payments/confirm/:id
    confirmPayment: async (token, paymentId) => {
        const response = await fetch(`${api_URL}/api/payments/${paymentId}/confirm`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });

        if (!response.ok) {
            throw new Error('Failed to confirm payment');
        }

        const data = await response.json();
        console.log(data)
        return data;
    }
};