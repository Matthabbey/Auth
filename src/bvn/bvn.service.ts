import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class BvnService {
  private readonly apiUrl = 'https://api.flutterwave.com/v3/kyc/bvns';

  async verifyBvn(bvn: string): Promise<any> {
    const apiKey = 'YOUR_API_KEY'; // Replace with your Flutterwave API key

    try {
      const response = await axios.get(`${this.apiUrl}/${bvn}`, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });

      return response.data;
    } catch (error) {
      // Handle API errors or validation errors
      throw error;
    }
  }
}