/**
 * Formats a numeric price into Indonesian Rupiah (IDR) currency format.
 * Example: 27999000 -> "Rp 27.999.000"
 */
export const formatIDR = (price: number): string => {
  if (price === undefined || price === null || isNaN(price)) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};
