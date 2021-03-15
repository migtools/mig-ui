export enum BrandType {
  Crane = 'Crane',
  RedHat = 'RedHat',
}

export const APP_BRAND: BrandType = (process.env.BRAND_TYPE as BrandType) || BrandType.Crane;
