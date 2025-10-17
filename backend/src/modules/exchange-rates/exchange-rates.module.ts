import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ExchangeRatesController } from './exchange-rates.controller';
import { AdminExchangeRatesController } from './admin-exchange-rates.controller';
import { ExchangeRatesService } from './exchange-rates.service';
import { CurrencyConversionService } from './currency-conversion.service';
import { ExchangeRate, ExchangeRateSchema } from './schemas/exchange-rate.schema';
import { ExchangeRateHistory, ExchangeRateHistorySchema } from './schemas/exchange-rate-history.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ExchangeRate.name, schema: ExchangeRateSchema },
      { name: ExchangeRateHistory.name, schema: ExchangeRateHistorySchema },
      { name: User.name, schema: UserSchema },
    ]),
    forwardRef(() => AuthModule),
  ],
  controllers: [ExchangeRatesController, AdminExchangeRatesController],
  providers: [ExchangeRatesService, CurrencyConversionService],
  exports: [ExchangeRatesService, CurrencyConversionService]
})
export class ExchangeRatesModule {}
