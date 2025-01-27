export interface Document {
  id: string;
  title: string;
  status: 'pending' | 'signed';
  createdAt: string;
  signers: {
    email: string;
    status: 'pending' | 'signed';
    signedAt?: string;
  }[];
}

export interface SignatureResponse {
  id: string;
  document: string;
  signer: {
    email: string;
  };
  timestamp: string;
  certificate: string;
}