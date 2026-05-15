import { Parcel, ShipmentAddress } from "@/common/services/shippo/dto/CreateShippmentDto";
import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNotEmptyObject, IsArray, IsNotEmpty } from "class-validator";

export class CreateShipmentPayloadDto {
    @ApiProperty()
    @Type(() => ShipmentAddress)
    @IsNotEmptyObject()
    address_from: ShipmentAddress;

    @ApiProperty({
        type: [Parcel]
    })
    @Type(() => Array<Parcel>)
    @IsArray()
    @IsNotEmpty()
    parcels: Array<Parcel>
}