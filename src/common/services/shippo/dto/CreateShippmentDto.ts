import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsEmail, IsEnum, IsNotEmpty, IsNotEmptyObject, IsString } from "class-validator";

export class ShipmentAddress {
    @ApiProperty({
        example: 'user@example.com'
    })
    @IsString()
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @ApiProperty({
        example: '+1 238 3483 23'
    })
    @IsString()
    @IsNotEmpty()
    phone: string;

    @ApiProperty({
        example: 'Califonia'
    })
    @IsString()
    @IsNotEmpty()
    state: string;

    @ApiProperty({
        example: 'winomin'
    })
    @IsString()
    @IsNotEmpty()
    city: string;

    @ApiProperty({
        example: 'Wall Street'
    })
    @IsString()
    @IsNotEmpty()
    street1: string;

    @ApiProperty({
        example: '10001'
    })
    @IsString()
    @IsNotEmpty()
    zip: string;

    @ApiProperty({
        example: 'Jack dorsey'
    })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({
        example: 'United State'
    })
    @IsString()
    @IsNotEmpty()
    country: string;
}

export class Parcel {
    @ApiProperty({
        enum: ['g', 'kg', 'lb', 'oz'],
        example: 'kg'
    })
    @IsEnum(['g', 'kg', 'lb', 'oz'])
    @IsNotEmpty()
    mass_unit: 'g'|'kg'|'lb'|'oz';

    @ApiProperty({
        example: '4'
    })
    @IsString()
    @IsNotEmpty()
    weight: string;

    @ApiProperty({
        enum: ['cm', 'in', 'ft', 'm','mm','yd'],
        example: 'ft'
    })
    @IsEnum( ['cm', 'in', 'ft', 'm','mm','yd'])
    distance_unit: 'cm'|'in'|'ft'|'m'|'mm'|'yd';

    @ApiProperty({
        example: '4'
    })
    @IsString()
    @IsNotEmpty()
    height: string;

    @ApiProperty({
        example: '4'
    })
    @IsString()
    @IsNotEmpty()
    length: string;

    @ApiProperty({
        example: '4'
    })
    @IsString()
    @IsNotEmpty()
    width: string;
}

export class CreateShipmentDto {
    @ApiProperty()
    @Type(() => ShipmentAddress)
    @IsNotEmptyObject()
    address_from: ShipmentAddress;

    @ApiProperty()
    @Type(() => ShipmentAddress)
    @IsNotEmptyObject()
    address_to: ShipmentAddress;

    @ApiProperty({
        type: [Parcel]
    })
    @Type(() => Array<Parcel>)
    @IsArray()
    @IsNotEmpty()
    parcels: Array<Parcel>
}