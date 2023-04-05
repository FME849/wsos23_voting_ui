import { AnchorProvider, Program, web3 } from "@project-serum/anchor";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Keypair, PublicKey } from "@solana/web3.js";
import { idl_obj, program_id } from "idl";
import { notify } from "utils/notifications";

export const CreateVoting = () => {
    const {connection} = useConnection();
    const myWallet = useWallet();
    const anchorProvider = new AnchorProvider(connection, myWallet, AnchorProvider.defaultOptions());
    const program = new Program(idl_obj, program_id, anchorProvider);

    const getRandomId = (): string => {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        let counter = 0;
        while (counter < 13) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
            counter += 1;
        }

        return result
    }

    const createVoting = async () => {
        const votingId = getRandomId();

        try {
            const [voting] = PublicKey.findProgramAddressSync([
                Buffer.from(votingId),
                anchorProvider.wallet.publicKey.toBuffer(),
            ], program.programId)

            const txid = await program.rpc.createElection(votingId, {
                accounts: {
                    electionData: voting,
                    signer: anchorProvider.wallet.publicKey,
                    systemProgram: web3.SystemProgram.programId,
                }
            })

            console.log(voting);
            notify({type: 'success', message: 'Successfully create new voting', txid})
        } catch (err) {
            console.error(err);
            notify({type: 'error', message: 'Failed to create new voting', })
        }
    }

    return (
        <div className="flex flex-row justify-center">
        <div className="relative group items-center">
            <div className="m-1 absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-fuchsia-500 
            rounded-lg blur opacity-20 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
                <button
                    className="group w-60 m-2 btn animate-pulse bg-gradient-to-br from-indigo-500 to-fuchsia-500 hover:from-white hover:to-purple-300 text-black"
                    onClick={createVoting} disabled={!myWallet.connected}
                >
                    <div className="hidden group-disabled:block ">
                    Wallet not connected
                    </div>
                     <span className="block group-disabled:hidden" >
                       Create new voting
                    </span>
                </button>
         </div>
    </div>
    )
};

export default CreateVoting;