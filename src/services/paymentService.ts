import { CartItem } from '../types';

export interface PaymentRequest {
  card_number: string;
  amount: number;
  merchant_id: string;
  description: string;
  order_id: string;
  items: {
    id: number;
    name: string;
    price: number;
    quantity: number;
  }[];
}

export interface PaymentResponse {
  success: boolean;
  message: string;
  data: {
    card_number: string;
    amount: number;
    merchant_id: string;
    type: string;
    status: string;
    iso8583_message: {
      mti: string;
      primaryAccountNumber: string;
      processingCode: string;
      amount: number;
      transmissionDateTime: string;
      systemTraceNumber: string;
      localTransactionTime: string;
      localTransactionDate: string;
      merchantType: string;
      responseCode: string;
      terminalId: string;
      merchantId: string;
    };
    created_at: string;
    responseCode: string;
    processed_at: string;
  };
}

const PAYMENT_API_URL = "https://vecgjrouma.execute-api.us-east-1.amazonaws.com/prod/api";

class PaymentService {
  
  async processPayment(
    cartItems: CartItem[], 
    totalAmount: number,
    cardNumber: string = "4111111111111111", // Default test card
    merchantId: string = "GREENTHUMB_001"
  ): Promise<PaymentResponse> {
    
    const paymentRequest: PaymentRequest = {
      card_number: cardNumber,
      amount: totalAmount,
      merchant_id: merchantId,
      description: `GreenThumb Plants - ${cartItems.length} items`,
      order_id: `ORDER_${Date.now()}`,
      items: cartItems.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      }))
    };

    try {
      console.log('Sending payment request:', paymentRequest);
      
      const response = await fetch(`${PAYMENT_API_URL}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentRequest),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const result: PaymentResponse = await response.json();
      console.log('Payment response:', result);
      
      return result;
    } catch (error) {
      console.error('Payment processing error:', error);
      throw error;
    }
  }

  // Method to get transaction history (optional)
  async getTransactionHistory(): Promise<any[]> {
    try {
      const response = await fetch(`${PAYMENT_API_URL}/transactions`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      throw error;
    }
  }

  // Method to process batch transactions (if needed for testing)
  async processBatch(batchData: {
    total_transactions: number;
    total_amount: number;
    duration_seconds: number;
    merchant_id: string;
  }): Promise<any> {
    try {
      const response = await fetch(`${PAYMENT_API_URL}/process-batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(batchData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error processing batch:', error);
      throw error;
    }
  }
}

export const paymentService = new PaymentService();