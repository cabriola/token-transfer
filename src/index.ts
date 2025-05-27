import express, { Request, Response } from 'express';
import * as bitcoin from 'bitcoinjs-lib';
import { RuneTransferRequest, RuneTransferResponse, ErrorResponse, UTXO } from './types';

const app = express();

// Configure network (testnet or mainnet)
const network = bitcoin.networks.testnet;

// Middleware to parse JSON bodies
app.use(express.json());

// Function to create a Rune transfer transaction
async function createRuneTransfer(
    senderPrivateKey: string,
    recipientAddress: string,
    runeAmount: string,
    runeId: string
): Promise<string> {
    try {
        // Create key pair from private key
        const keyPair = bitcoin.ECPair.fromWIF(senderPrivateKey, network);
        
        // Create a new transaction
        const txb = new bitcoin.TransactionBuilder(network);
        
        // TODO: Add UTXO selection logic here
        // This would typically involve querying a Bitcoin node or API
        // to get the sender's UTXOs
        
        // Add input (placeholder - needs actual UTXO)
        // txb.addInput(utxo.txid, utxo.vout);
        
        // Add output for Rune transfer
        // The OP_RETURN output contains the Rune transfer data
        const runeData = Buffer.from(JSON.stringify({
            protocol: 'runes',
            action: 'transfer',
            runeId: runeId,
            amount: runeAmount
        }));
        
        txb.addOutput(bitcoin.script.compile([
            bitcoin.opcodes.OP_RETURN,
            runeData
        ]), 0);
        
        // Add output for recipient
        txb.addOutput(recipientAddress, 546); // Minimum amount for dust
        
        // Sign the transaction
        // txb.sign(0, keyPair);
        
        // Build the transaction
        const tx = txb.build();
        
        return tx.toHex();
    } catch (error) {
        console.error('Error creating Rune transfer:', error);
        throw error;
    }
}

// API endpoint to transfer Runes
app.post('/transfer-rune', async (req: Request<{}, {}, RuneTransferRequest>, res: Response<RuneTransferResponse | ErrorResponse>) => {
    try {
        const {
            senderPrivateKey,
            recipientAddress,
            runeAmount,
            runeId
        } = req.body;

        // Validate inputs
        if (!senderPrivateKey || !recipientAddress || !runeAmount || !runeId) {
            return res.status(400).json({
                error: 'Missing required parameters'
            });
        }

        // Create the transaction
        const txHex = await createRuneTransfer(
            senderPrivateKey,
            recipientAddress,
            runeAmount,
            runeId
        );

        res.json({
            success: true,
            transactionHex: txHex
        });
    } catch (error) {
        res.status(500).json({
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        });
    }
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'ok' });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 