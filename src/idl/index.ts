import { PublicKey } from '@solana/web3.js';
import idl from './wsos23_voting_app.json';

export const idl_obj = JSON.parse(JSON.stringify(idl));
export const program_id = new PublicKey(idl_obj.metadata.address);