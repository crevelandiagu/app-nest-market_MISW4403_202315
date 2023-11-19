import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, UseInterceptors } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { BusinessErrorsInterceptor } from "../shared/interceptors/business-errors.interceptor";

import {ProductoTiendaService} from "./producto-tienda.service";
import {TiendaController} from "../tienda/tienda.controller";
import {TiendaDto} from "../tienda/tienda.dto";
import {TiendaEntity} from "../tienda/tienda.entity";


@Controller('products')
@UseInterceptors(BusinessErrorsInterceptor)
export class ProductoTiendaController {

    constructor(private readonly productoTiendaService: ProductoTiendaService){}

    @Post(':productId/stores/:tiendaId')
    async addStoreToProduct(@Param('productId') productId: string, @Param('tiendaId') tiendaId: string){
        return await this.productoTiendaService.addStoreToProduct(productId, tiendaId);
    }

    @Get(':productId/stores/:tiendaId')
    async findStoreFromProduct(@Param('productId') productId: string, @Param('tiendaId') tiendaId: string){
        return await this.productoTiendaService.findStoreFromProduct(productId, tiendaId);
    }

    @Get(':productId/stores')
    async findStoresFromProduct(@Param('productId') productId: string){
        return await this.productoTiendaService.findStoresFromProduct(productId);
    }

    @Put(':productId/stores')
    async updateStoresFromProduct(@Body() tiendaDto: TiendaDto[], @Param('productId') productId: string){
        const stores = plainToInstance(TiendaEntity, tiendaDto)
        return await this.productoTiendaService.updateStoresFromProduct(productId, stores);
    }

    @Delete(':productId/stores/:tiendaId')
    @HttpCode(204)
    async deleteStoresFromProduct(@Param('productId') productId: string, @Param('tiendaId') tiendaId: string){
        return await this.productoTiendaService.deleteStoreFromProduct(productId, tiendaId);
    }

}
