import {IsNotEmpty, IsString} from 'class-validator';
export class ProductoDto {

    @IsString()
    @IsNotEmpty()
    readonly nombre: string;

    @IsString()
    @IsNotEmpty()
    readonly precio: number;

    @IsString()
    @IsNotEmpty()
    readonly tipo: string;

}

