export enum BrandType {
  Konveyor = 'Konveyor',
  RedHat = 'RedHat',
}

export const APP_BRAND: BrandType = (process.env.BRAND_TYPE as BrandType) || BrandType.Konveyor;
