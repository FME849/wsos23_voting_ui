import type { NextPage } from "next";
import Head from "next/head";
import { VotingsView } from "../views";

const Basics: NextPage = (props) => {
  return (
    <div>
      <Head>
        <title>Solana Scaffold</title>
        <meta
          name="description"
          content="Basic Functionality"
        />
      </Head>
      <VotingsView />
    </div>
  );
};

export default Basics;
