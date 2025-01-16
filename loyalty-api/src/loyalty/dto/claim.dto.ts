import { IsInt, IsPositive, IsString, Length } from 'class-validator';

export class ClaimDto {
  @IsInt()
  @IsPositive()
  customerId: number;

  @IsInt()
  @IsPositive()
  points: number;

  @IsString()
  @Length(1, 255)
  description: string;
}
