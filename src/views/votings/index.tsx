
import { FC, useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { AnchorProvider, Program, web3 } from "@project-serum/anchor";
import { idl_obj, program_id } from "idl";
import { PublicKey, Transaction } from "@solana/web3.js";

export const VotingsView: FC = ({ }) => {
  const [votings, setVotings] = useState([]);
  const {connection} = useConnection();
  const myWallet = useWallet();
  const anchorProvider = new AnchorProvider(connection, myWallet, AnchorProvider.defaultOptions());
  const program = new Program(idl_obj, program_id, anchorProvider);
  const stage = ['application', 'voting', 'closed'];
  const accountTypes = ['electionData', 'candidateData', 'myVote'];

  const getVotings = async () => {
    try {
        Promise.all((await connection.getProgramAccounts(program.programId)).map(async voting => {
                try {
                    const votingData = await program.account.electionData.fetch(voting.pubkey)
                    return ({
                        ...votingData,
                        pubkey: voting.pubkey,
                    });
                } catch (error) {
                    console.log('Wrong account struct'); 
                    return
                }   
        })).then(fetchedVotings => {
            const filterVotings = fetchedVotings.filter(voting => voting !== undefined);
          setVotings(filterVotings)
        })
      } catch (error) {
        console.log("Error while getting votings:", error);
      }
  }

  const getNextStage = (currentStage: string) => {
    const currentIndex = stage.indexOf(currentStage);
    if (currentIndex < (stage.length - 1)) {
        const nextIndex = currentIndex + 1;
        return stage[nextIndex];
    } else {
        return stage[currentIndex];
    }
  }

  const changeStage = async (votingPubkey: PublicKey, initiator: PublicKey, currentStage: string) => {
    const newStage = getNextStage(currentStage);

    try {
        await program.rpc.changeStage({[newStage]: {}}, {
            accounts: {
                electionData: votingPubkey,
                signer: initiator,
            }
        })

    } catch (error) {
        console.error(error)
    }
  }

  const handleApplication = async (votingPubkey: PublicKey) => {
    const [candidateData] = PublicKey.findProgramAddressSync([
        Buffer.from('candidate'),
        anchorProvider.wallet.publicKey.toBuffer(),
        votingPubkey.toBuffer(),
    ], program.programId)

    try {
        await program.rpc.apply({
            accounts: {
                candidateData,
                electionData: votingPubkey,
                signer: anchorProvider.wallet.publicKey,
                systemProgram: web3.SystemProgram.programId,
            }
        })
    } catch (error) {
        console.error(error);
    }
  }

  useEffect(() => {
    getVotings();
  }, [])

  return (
    <div className="md:hero mx-auto p-4">
      <div className="md:hero-content flex flex-col w-full">
        <h1 className="text-center text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 to-fuchsia-500 mt-10 mb-8">
          Votings
        </h1>
        <div className="flex flex-col w-full">
            {votings.map((voting, index) => {
                const {id, initiator, candidates, stage, pubkey} = voting;
                const initiatorPubkey = initiator.toBase58();
                const currentStage = Object.keys(stage)[0]
                if (!id || initiatorPubkey.length < 40) {
                    return
                }
                return <div key={index} className="bg-slate-500 w-full mb-4 rounded-lg px-4 py-2 flex flex-row">
                    <div className="flex flex-col flex-1">
                    <span>Voting id: {id}</span>
                    <span>Initiator: {initiator.toBase58()}</span>
                    <span>Candidates: {candidates.toString()}</span>
                    <span>Stage: {currentStage}</span>
                    </div>
                    <div className="flex flex-col items-end">
                        <button 
                            className="group w-60 m-2 btn animate-pulse bg-gradient-to-br from-indigo-500 to-fuchsia-500 hover:from-white hover:to-purple-300 text-black" 
                            onClick={() => changeStage(pubkey, initiatorPubkey, currentStage)}
                        >
                            Change voting stage
                        </button>
                        <button 
                            className="group w-60 m-2 btn animate-pulse bg-gradient-to-br from-indigo-500 to-fuchsia-500 hover:from-white hover:to-purple-300 text-black"
                            onClick={() => handleApplication(pubkey)}
                        >
                            Apply
                        </button>
                    </div>
                </div>
            })}
        </div>
      </div>
    </div>
  );
};
