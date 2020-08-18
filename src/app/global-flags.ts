export enum BrandType {
  Konveyor = 'Konveyor',
  RedHat = 'RedHat',
}

// TODO: this should probably be a build config option instead
//   maybe even just have the konveyor logo as a generic filename and have a script swap in the Red Hat file
//   instead of having any reference to Red Hat branding in here.
export const APP_BRAND: BrandType = BrandType.Konveyor;
