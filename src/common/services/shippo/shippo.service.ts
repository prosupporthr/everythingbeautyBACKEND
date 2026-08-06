import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios'
import { AxiosInstance } from 'axios';
import { CreateShipmentDto } from './dto/CreateShippmentDto';
import { ShipmentReturnType } from './dto/ShipmentReturnType';

@Injectable()
export class ShippoService {
    private SHIPPO_BASE_URL: string;
    private axios: AxiosInstance | null;
    constructor(
        private configService: ConfigService,
        private httpService: HttpService
    ) {
        this.SHIPPO_BASE_URL = this.configService.get('SHIPPO_BASE_URL', 'https://api.goshippo.com/');
        const API_KEY = this.configService.get('SHIPPO_API_KEY', null);
        this.axios = this.httpService.axiosRef.create({
            baseURL: this.SHIPPO_BASE_URL,
            headers: {
                Authorization: `ShippoToken ${API_KEY}`,
                'Content-Type': 'application/json',
            },
        });
    }

    

    async createShippment({ payload }: { payload: CreateShipmentDto}): Promise<ShipmentReturnType> {
        try {
            const request = await this.axios?.post(`shipments`, payload);
            return request?.data;
        } catch (error) {
            console.log('SHIPPO ERROR', error?.response?.data || error?.message);
            throw error;
        }
    }

    async getShipmentById(id: string): Promise<ShipmentReturnType> {
        try {
            const request = await this.axios?.get(`shipments/${id}`);
            return request?.data;
        } catch(error) {
            return error;
        }
    }
}
