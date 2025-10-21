import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ExchangeRate, ExchangeRateSchema } from './schemas/exchange-rate.schema';
import { ExchangeRatesService } from './exchange-rates.service';
import { ExchangeRatesController } from './exchange-rates.controller';
import { AdminExchangeRatesController } from './admin-exchange-rates.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ExchangeRate.name, schema: ExchangeRateSchema },
    ]),
    forwardRef(() => AuthModule),
  ],
  controllers: [
    ExchangeRatesController,
    AdminExchangeRatesController,
  ],
  providers: [ExchangeRatesService],
  exports: [ExchangeRatesService],
})
export class ExchangeRatesModule {}
