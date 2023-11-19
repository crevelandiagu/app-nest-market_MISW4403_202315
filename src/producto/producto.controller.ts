import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, UseInterceptors } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { BusinessErrorsInterceptor } from "../shared/interceptors/business-errors.interceptor";

import { ProductoService } from "./producto.service";
import {ProductoDto} from "./producto.dto";
import {ProductoEntity} from "./producto.entity";


@Controller('products')
@UseInterceptors(BusinessErrorsInterceptor)
export class ProductoController {
    constructor(private readonly productoService: ProductoService) {}

    @Get()
    async findAll() {
        return await this.productoService.findAll();
    }

    @Get(':productId')
    async findOne(@Param('productId') productId: string) {
        return await this.productoService.findOne(productId);
    }

    @Post()
    async create(@Body() productoDto: ProductoDto) {
        const producto: ProductoEntity = plainToInstance(ProductoEntity, productoDto);
        return await this.productoService.create(producto);
    }

    @Put(':productId')
    async update(@Param('productId') productId: string, @Body() productoDto: ProductoDto) {
        const producto: ProductoEntity = plainToInstance(ProductoEntity, productoDto);
        return await this.productoService.update(productId, producto);
    }

    @Delete(':productId')
    @HttpCode(204)
    async delete(@Param('productId') productId: string) {
        return await this.productoService.delete(productId);
    }

}
