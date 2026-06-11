export interface LicenseOrder {
  id: string;
  customerName: string;
  email: string;
  whatsapp: string;
  licenseKey: string;
  paymentMethod: 'bKash' | 'Nagad' | 'Rocket';
  paymentStatus: 'pending' | 'completed' | 'failed';
  paymentTxid: string;
  requestedAt: string;
  priceBDT: number;
  isWhatsAppSent: boolean;
}
