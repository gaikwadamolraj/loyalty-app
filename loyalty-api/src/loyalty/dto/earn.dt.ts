import { IsInt, IsPositive } from 'class-validator';

export class EarnDto {
  @IsInt()
  @IsPositive()
  customerId: number;

  @IsInt()
  @IsPositive()
  points: number;
}
