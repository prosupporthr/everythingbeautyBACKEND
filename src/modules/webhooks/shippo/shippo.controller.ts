import { Body, Controller, Logger, Post } from '@nestjs/common';

@Controller('shippo')
export class ShippoController {
    private logger = new Logger('SHIPPO CONTROLLER')
    @Post('tracking')
    async trackingWebHook(@Body() body: any) {
        this.logger.debug('WEBHOOK BODY');
        this.logger.debug(body);
        // console.log(body);

        return Response.json({ message: 'Success' });
    }
}
