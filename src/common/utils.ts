import * as dayjs from 'dayjs';
import * as crypto from 'crypto';

export const getInitial = (data: string): string => {
  return data[0].toUpperCase();
};

export const getNameFromEmail = (email: string): string => {
  const split = email.split('@');
  const name = split[0];
  return name;
};

export const getImagePublicId = (imageUrl: string) => {
  const split = imageUrl.split('/');
  const imageName = split[split.length - 1];
  const publicId = imageName.split('.')[0];
  return publicId;
};

export const generateOrderId = (userId: number) => {
  const unixTimestamp = dayjs().unix();
  return `OB-${unixTimestamp}-${userId}`;
};

export const hashSHA512 = (data: string): string => {
  return crypto.createHash('sha512').update(data).digest('hex');
};

export const formatRupiah = (
  amount: number,
  withSymbol: boolean = true,
): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  })
    .format(amount)
    .replace(withSymbol ? '' : 'Rp', '')
    .trim();
};

export const formatDonationMessage = (username: string, nominal: number) => {
  return `${username} telah berdonasi sebesar ${formatRupiah(nominal)}`;
};
