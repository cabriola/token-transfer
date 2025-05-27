export interface RuneTransferRequest {
    senderPrivateKey: string;
    recipientAddress: string;
    runeAmount: string;
    runeId: string;
}

export interface RuneTransferResponse {
    success: boolean;
    transactionHex: string;
}

export interface ErrorResponse {
    error: string;
}

export interface UTXO {
    txid: string;
    vout: number;
    value: number;
    script: string;
}

export interface RuneBalance {
    runeId: string;
    amount: string;
    address: string;
} 